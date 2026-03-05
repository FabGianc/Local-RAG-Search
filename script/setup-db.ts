import { pool } from "../server/db";

async function setup() {
  try {
    await pool.query('CREATE EXTENSION IF NOT EXISTS vector;');
    console.log('Vector extension enabled successfully');
  } catch (error) {
    console.error('Error enabling vector extension:', error);
  } finally {
    process.exit(0);
  }
}

setup();
