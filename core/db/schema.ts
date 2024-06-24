import { sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const liveStreams = sqliteTable('live-streams', {
  id: text('id').notNull().primaryKey(),
  title: text('title'),
  startTimestamp: text('start_timestamp'),
  endTimestamp: text('end_timestamp'),
  duration: text('duration'),
})

export const authors = sqliteTable('authors', {
  id: text('id').notNull().primaryKey(),
  name: text('name').notNull(),
})

export type InsertAuthor = typeof authors.$inferInsert
