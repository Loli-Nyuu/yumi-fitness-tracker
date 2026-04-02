import { useDB, goals } from '../../db'
import { desc, eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const db = useDB()

  if (event.method === 'GET') {
    const query = getQuery(event)
    if (query.status) {
      return db.select().from(goals).where(eq(goals.status, query.status as string)).all()
    }
    return db.select().from(goals).orderBy(desc(goals.createdAt)).all()
  }

  if (event.method === 'POST') {
    const body = await readBody(event)
    const result = db.insert(goals).values({
      type: body.type,
      description: body.description,
      targetValue: body.targetValue,
      targetUnit: body.targetUnit || '',
      currentValue: body.currentValue || 0,
      deadline: body.deadline || '',
      status: 'active',
    }).run()
    return { id: Number(result.lastInsertRowid), message: 'Goal created!' }
  }
})
