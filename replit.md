# RAG Document Search Engine

## Overview
A local document search engine using Retrieval-Augmented Generation (RAG) over PDF, DOC, DOCX, and TXT files. Embeddings are generated locally, stored in PostgreSQL with pgvector, and answers are generated via an LLM (OpenAI API or any compatible endpoint).

## Architecture
- **Frontend**: React + Vite + TailwindCSS + shadcn/ui
- **Backend**: Express.js (TypeScript)
- **Database**: PostgreSQL + pgvector extension
- **Embeddings**: `@xenova/transformers` with `all-MiniLM-L6-v2` (384-dim, runs locally)
- **LLM**: OpenAI API (configurable via env vars, also supports Ollama/local LLMs)

## Key Files
- `shared/schema.ts` — Drizzle ORM schema (documents, document_chunks with vector column)
- `shared/routes.ts` — API contract definitions with Zod
- `server/routes.ts` — Express routes (upload, search)
- `server/storage.ts` — Database storage layer with pgvector similarity search
- `server/openai-client.ts` — Portable OpenAI client (works with Replit AI Integrations and standard API keys)
- `server/db.ts` — Database connection
- `client/src/pages/SearchPage.tsx` — Main search interface
- `client/src/pages/DocumentsPage.tsx` — Document upload page
- `DEPLOY.md` — Self-hosting guide (Italian)
- `.env.example` — Environment variable template

## Environment Variables
- `DATABASE_URL` — PostgreSQL connection string
- `OPENAI_API_KEY` — OpenAI API key (or `AI_INTEGRATIONS_OPENAI_API_KEY` on Replit)
- `OPENAI_BASE_URL` — Optional custom base URL for LLM endpoint
- `OPENAI_MODEL` — Optional model name (default: gpt-4o)
- `PORT` — Server port (default: 5000)

## Commands
- `npm run dev` — Start dev server
- `npm run build` — Build for production
- `npm start` — Start production server
- `npm run db:push` — Push schema to database

## Supported Document Formats
PDF, TXT, DOC, DOCX
