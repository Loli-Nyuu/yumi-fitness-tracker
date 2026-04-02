import { useDB, flexibilityProgress } from '../../db'
import { desc, eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const db = useDB()

  if (event.method === 'GET') {
    const query = getQuery(event)
    if (query.type) {
      return db.select().from(flexibilityProgress)
        .where(eq(flexibilityProgress.stretchType, query.type as string))
        .orderBy(desc(flexibilityProgress.date))
        .all()
    }
    return db.select().from(flexibilityProgress).orderBy(desc(flexibilityProgress.date)).all()
  }

  if (event.method === 'POST') {
    const body = await readBody(event)
    const result = db.insert(flexibilityProgress).values({
      date: body.date || new Date().toISOString().split('T')[0],
      stretchType: body.stretchType,
      distanceFromFloor: body.distanceFromFloor || null,
      holdTime: body.holdTime || 0,
      comfortLevel: body.comfortLevel || 3,
      notes: body.notes || '',
    }).run()
    return { id: Number(result.lastInsertRowid), message: 'Flexibility logged!' }
  }
})
