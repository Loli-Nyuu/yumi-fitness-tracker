import { useDB, breathingSessions } from '../../db'
import { desc } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const db = useDB()

  if (event.method === 'GET') {
    return db.select().from(breathingSessions).orderBy(desc(breathingSessions.date)).limit(30).all()
  }

  if (event.method === 'POST') {
    const body = await readBody(event)
    const result = db.insert(breathingSessions).values({
      date: body.date || new Date().toISOString().split('T')[0],
      pattern: body.pattern,
      duration: body.duration || 0,
      rounds: body.rounds || 0,
      notes: body.notes || '',
    }).run()
    return { id: Number(result.lastInsertRowid), message: 'Breathing session logged!' }
  }

  if (event.method === 'DELETE') {
    const { useDB, breathingSessions } = await import('../../db')
    const { eq } = await import('drizzle-orm')
    const db2 = useDB()
    const query = getQuery(event)
    const id = Number(query.id)
    if (id) {
      db2.delete(breathingSessions).where(eq(breathingSessions.id, id)).run()
      return { message: 'Deleted!' }
    }
  }
})
