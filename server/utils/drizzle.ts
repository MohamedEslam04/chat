import { drizzle } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'
import * as schema from '../database/schema'

export { sql, eq, and, or } from 'drizzle-orm'
export const tables = schema

export function useDrizzle() {
  const { dbPath } = useRuntimeConfig()
  const sqlitePath = dbPath || process.env.DB_PATH || 'sqlite.db'

  // Create libsql client - works with both local files and remote databases
  const client = createClient({
    url: sqlitePath.startsWith('file:') ? sqlitePath : `file:${sqlitePath}`,
  })

  return drizzle(client, { schema })
}

export type Chat = typeof schema.chats.$inferSelect
export type Message = typeof schema.messages.$inferSelect
