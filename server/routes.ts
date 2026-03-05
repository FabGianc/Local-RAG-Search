import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import * as pdfParseModule from "pdf-parse";
import mammoth from "mammoth";
import { pipeline } from "@xenova/transformers";
import { openai } from "./replit_integrations/image/client";

// Setup multer for file uploads
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === ".pdf" || ext === ".txt" || ext === ".doc" || ext === ".docx") {
      cb(null, true);
    } else {
      cb(new Error("Only .pdf, .txt, .doc, .docx files are allowed"));
    }
  },
});

// Initialize embedding pipeline (lazy loaded)
let extractor: any = null;
async function getExtractor() {
  if (!extractor) {
    // all-MiniLM-L6-v2 produces 384-dimensional embeddings
    extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
  return extractor;
}

// Helper to extract text from files
async function extractText(filePath: string, originalName: string): Promise<string> {
  const ext = path.extname(originalName).toLowerCase();
  
  if (ext === ".txt") {
    return await fs.readFile(filePath, "utf-8");
  } else if (ext === ".pdf") {
    const dataBuffer = await fs.readFile(filePath);
    // Handle both default import and named export for CommonJS/ESM interop
    const parse = (pdfParseModule as any).default || pdfParseModule;
    const data = await parse(dataBuffer);
    return data.text;
  } else if (ext === ".doc" || ext === ".docx") {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  }
  
  throw new Error("Unsupported file type");
}

// Simple text chunking
function chunkText(text: string, maxChunkSize = 1000): string[] {
  const paragraphs = text.split(/\n\s*\n/);
  const chunks: string[] = [];
  let currentChunk = "";
  
  for (const p of paragraphs) {
    if (currentChunk.length + p.length > maxChunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = p;
    } else {
      currentChunk += (currentChunk ? "\n\n" : "") + p;
    }
  }
  
  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Get all documents
  app.get(api.documents.list.path, async (req, res) => {
    try {
      const docs = await storage.getDocuments();
      res.json(docs);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  // Upload and process a document
  app.post(api.documents.upload.path, upload.single("file"), async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded", field: "file" });
    }

    try {
      const { originalname, path: filePath } = req.file;
      
      // 1. Create document record
      const doc = await storage.createDocument({
        filename: originalname,
        path: filePath,
      });

      // 2. Extract text
      const text = await extractText(filePath, originalname);
      
      // 3. Chunk text
      const chunks = chunkText(text);
      
      // 4. Generate embeddings and save chunks
      const embedder = await getExtractor();
      const chunkRecords = [];
      
      for (const content of chunks) {
        if (!content.trim()) continue;
        
        const output = await embedder(content, { pooling: 'mean', normalize: true });
        const embedding = Array.from(output.data);
        
        chunkRecords.push({
          documentId: doc.id,
          content,
          embedding: embedding as number[],
        });
      }
      
      await storage.createDocumentChunks(chunkRecords);
      
      res.status(201).json(doc);
    } catch (err) {
      console.error("Upload error:", err);
      // Clean up uploaded file if processing failed
      if (req.file) {
        await fs.unlink(req.file.path).catch(console.error);
      }
      res.status(500).json({ message: err instanceof Error ? err.message : "Failed to process document" });
    }
  });

  // Search documents using RAG
  app.post(api.search.post.path, async (req, res) => {
    try {
      const input = api.search.post.input.parse(req.body);
      const { query } = input;
      
      // 1. Generate embedding for query
      const embedder = await getExtractor();
      const output = await embedder(query, { pooling: 'mean', normalize: true });
      const queryEmbedding = Array.from(output.data) as number[];
      
      // 2. Find similar chunks in DB
      const similarChunks = await storage.searchSimilarChunks(queryEmbedding, 5);
      
      if (similarChunks.length === 0) {
        return res.json({
          answer: "I couldn't find any relevant information in the uploaded documents to answer your question.",
          sources: []
        });
      }
      
      // 3. Build context for LLM
      const context = similarChunks
        .map(chunk => `[Source: ${chunk.filename}]\n${chunk.content}`)
        .join("\n\n---\n\n");
      
      // 4. Generate answer using OpenAI via Replit AI Integrations
      const prompt = `You are a helpful assistant. Use the following pieces of retrieved context from uploaded documents to answer the user's question. 
If you don't know the answer based on the context, just say that you don't know. Don't make up information.
Always cite the source filenames when you use information from them.

Context:
${context}

Question: ${query}

Answer:`;

      const response = await openai.chat.completions.create({
        model: "gpt-5.1",
        messages: [{ role: "user", content: prompt }],
      });
      
      const answer = response.choices[0]?.message?.content || "Sorry, I couldn't generate an answer.";
      
      // 5. Return answer and sources
      res.json({
        answer,
        sources: similarChunks.map(c => ({
          filename: c.filename,
          path: c.path,
          content: c.content
        }))
      });
      
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      console.error("Search error:", err);
      res.status(500).json({ message: "Failed to perform search" });
    }
  });

  return httpServer;
}
