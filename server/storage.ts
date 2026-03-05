import { documents, documentChunks, type Document, type InsertDocument } from "@shared/schema";
import { db } from "./db";
import { eq, sql } from "drizzle-orm";

export interface IStorage {
  getDocuments(): Promise<Document[]>;
  getDocument(id: number): Promise<Document | undefined>;
  createDocument(doc: InsertDocument): Promise<Document>;
  createDocumentChunks(chunks: { documentId: number; content: string; embedding: number[] }[]): Promise<void>;
  searchSimilarChunks(embedding: number[], limit?: number): Promise<{ content: string; filename: string; path: string; distance: number }[]>;
}

export class DatabaseStorage implements IStorage {
  async getDocuments(): Promise<Document[]> {
    return await db.select().from(documents);
  }

  async getDocument(id: number): Promise<Document | undefined> {
    const [doc] = await db.select().from(documents).where(eq(documents.id, id));
    return doc || undefined;
  }

  async createDocument(doc: InsertDocument): Promise<Document> {
    const [created] = await db.insert(documents).values(doc).returning();
    return created;
  }

  async createDocumentChunks(chunks: { documentId: number; content: string; embedding: number[] }[]): Promise<void> {
    if (chunks.length === 0) return;
    // Batch insert using values
    await db.insert(documentChunks).values(chunks);
  }

  async searchSimilarChunks(embedding: number[], limit = 5): Promise<{ content: string; filename: string; path: string; distance: number }[]> {
    const embeddingString = `[${embedding.join(',')}]`;
    
    // <-> is L2 distance, <=> is cosine distance, <#> is inner product
    // Xenova/all-MiniLM-L6-v2 uses normalized embeddings, so cosine is appropriate
    const results = await db.execute(sql`
      SELECT 
        c.content, 
        d.filename, 
        d.path,
        c.embedding <=> ${embeddingString}::vector as distance
      FROM document_chunks c
      JOIN documents d ON c.document_id = d.id
      ORDER BY distance ASC
      LIMIT ${limit}
    `);
    
    return results.rows as { content: string; filename: string; path: string; distance: number }[];
  }
}

export const storage = new DatabaseStorage();
