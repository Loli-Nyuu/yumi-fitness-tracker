import { useDB, yumiNotes } from '../db'
import { desc, eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const db = useDB()

  if (event.method === 'GET') {
    const query = getQuery(event)
    if (query.sessionId) {
      return db.select().from(yumiNotes).where(eq(yumiNotes.sessionId, Number(query.sessionId))).all()
    }
    if (query.visibility) {
      return db.select().from(yumiNotes).where(eq(yumiNotes.visibility, query.visibility as string)).orderBy(desc(yumiNotes.date)).all()
    }
    return db.select().from(yumiNotes).orderBy(desc(yumiNotes.date)).all()
  }

  if (event.method === 'POST') {
    const body = await readBody(event)
    const result = db.insert(yumiNotes).values({
      date: body.date || new Date().toISOString().split('T')[0],
      sessionId: body.sessionId || null,
      visibility: body.visibility || 'shared',
      content: body.content,
      category: body.category || 'observation',
    }).run()
    return { id: Number(result.lastInsertRowid), message: 'Note saved!' }
  }
})
