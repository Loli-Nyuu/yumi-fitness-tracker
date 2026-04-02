import { useDB, nutritionLog } from '../db'
import { desc, eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const db = useDB()

  if (event.method === 'GET') {
    const query = getQuery(event)
    if (query.date) {
      return db.select().from(nutritionLog).where(eq(nutritionLog.date, query.date as string)).all()
    }
    return db.select().from(nutritionLog).orderBy(desc(nutritionLog.date)).limit(50).all()
  }

  if (event.method === 'POST') {
    const body = await readBody(event)
    const result = db.insert(nutritionLog).values({
      date: body.date || new Date().toISOString().split('T')[0],
      mealType: body.mealType,
      description: body.description || '',
      protein: body.protein || 0,
      calories: body.calories || 0,
      notes: body.notes || '',
    }).run()
    return { id: Number(result.lastInsertRowid), message: 'Meal logged!' }
  }

  if (event.method === 'DELETE') {
    const query = getQuery(event)
    const id = Number(query.id)
    if (id) {
      db.delete(nutritionLog).where(eq(nutritionLog.id, id)).run()
      return { message: 'Deleted!' }
    }
  }
})
