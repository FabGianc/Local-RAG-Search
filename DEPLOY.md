# Guida al Deploy su Workstation Locale

## Prerequisiti

1. **Node.js** v20 o superiore
2. **PostgreSQL** 15+ con estensione `pgvector`
3. **Chiave API OpenAI** (oppure un LLM locale come Ollama con endpoint compatibile OpenAI)

## Installazione

### 1. Clona il progetto

```bash
git clone <url-del-progetto>
cd <cartella-progetto>
```

### 2. Installa le dipendenze

```bash
npm install
```

### 3. Configura PostgreSQL

Crea il database e abilita l'estensione vector:

```sql
CREATE DATABASE ragdb;
\c ragdb
CREATE EXTENSION IF NOT EXISTS vector;
```

### 4. Configura le variabili d'ambiente

Copia il file di esempio e personalizzalo:

```bash
cp .env.example .env
```

Modifica `.env` con i tuoi dati:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/ragdb
OPENAI_API_KEY=sk-...
PORT=5000
```

### 5. Crea le tabelle nel database

```bash
npm run db:push
```

### 6. Build del progetto

```bash
npm run build
```

### 7. Avvia il server

```bash
npm start
```

L'app sarà disponibile su `http://localhost:5000` (o la porta configurata).

## Accesso da LAN

Il server ascolta su `0.0.0.0`, quindi è già accessibile dagli altri dispositivi sulla stessa rete locale tramite l'IP della workstation.

Esempio: se la workstation ha IP `192.168.1.100`, gli altri dispositivi potranno accedere a `http://192.168.1.100:5000`.

## Usare un LLM Locale (Ollama)

Se vuoi evitare completamente servizi cloud e lavorare 100% in locale, puoi usare [Ollama](https://ollama.ai):

1. Installa Ollama
2. Scarica un modello: `ollama pull llama3.1`
3. Configura `.env`:

```env
OPENAI_API_KEY=ollama
OPENAI_BASE_URL=http://localhost:11434/v1
OPENAI_MODEL=llama3.1
```

In questo modo sia gli embeddings (generati con `all-MiniLM-L6-v2` via `@xenova/transformers`, già in locale) sia le risposte del LLM gireranno interamente sulla tua workstation.

## Formati Supportati

- `.pdf`
- `.txt`
- `.doc` / `.docx`

## Architettura

- **Embeddings**: generati localmente con `all-MiniLM-L6-v2` (384 dimensioni) via `@xenova/transformers`
- **Vector store**: PostgreSQL + pgvector (ricerca per distanza coseno)
- **LLM**: OpenAI API (o qualsiasi endpoint compatibile)
- **Frontend**: React (servito dallo stesso server Express)
