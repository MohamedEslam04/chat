import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  dialect: 'sqlite',
  schema: './server/database/schema.ts',
  out: './server/database/migrations',
  driver: 'durable-sqlite',
  dbCredentials: {
    url: 'file:.data/sqlite.db'
  }
})
