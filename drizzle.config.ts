import { defineConfig } from 'drizzle-kit'

const dbPath = process.env.DB_PATH || 'sqlite.db'

export default defineConfig({
  dialect: 'sqlite',
  schema: './server/database/schema.ts',
  out: './server/database/migrations',
  driver: 'durable-sqlite',
  dbCredentials: {
    url: `file:${dbPath}`
  }
})
