import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'

export const fluidLog = sqliteTable('fluid_log', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  date: text('date').notNull(),
  type: text('type').notNull(), // 'water', 'coffee', 'tea', 'juice', 'soda', 'other'
  amountMl: integer('amount_ml').notNull(), // milliliters
  note: text('note').default(''),
  createdAt: text('created_at').notNull().default("datetime('now')"),
})
