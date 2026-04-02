import { useDB, bodyMeasurements } from '../../db'
import { desc } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const db = useDB()

  if (event.method === 'GET') {
    const query = getQuery(event)

    if (query.latest === 'true') {
      return db.select().from(bodyMeasurements).orderBy(desc(bodyMeasurements.date)).limit(1).get()
    }

    return db.select().from(bodyMeasurements).orderBy(desc(bodyMeasurements.date)).all()
  }

  if (event.method === 'POST') {
    const body = await readBody(event)

    // Auto-calculate WHR
    let whr = null
    if (body.waist && body.hip) {
      whr = Number((body.waist / body.hip).toFixed(3))
    }

    const result = db.insert(bodyMeasurements).values({
      date: body.date || new Date().toISOString().split('T')[0],
      weight: body.weight || null,
      waist: body.waist || null,
      hip: body.hip || null,
      chest: body.chest || null,
      thighLeft: body.thighLeft || null,
      thighRight: body.thighRight || null,
      armLeft: body.armLeft || null,
      armRight: body.armRight || null,
      whr,
      notes: body.notes || '',
    }).run()

    return { id: Number(result.lastInsertRowid), whr, message: 'Measurement logged!' }
  }
})
