import { useDB, fluidLog } from '../db'
import { desc, eq, and } from 'drizzle-orm'

// Hydration multiplier
const HYDRATION_FACTORS: Record<string, number> = {
  water: 1.0, tea: 0.90, juice: 1.0, soda: 0.90, coffee: 0.80, other: 0.85,
}

export default defineEventHandler(async (event) => {
  const db = useDB()
  const method = event.method
  const today = new Date().toISOString().split('T')[0]

  // GET /api/fluids — full summary + entries for a date
  if (method === 'GET') {
    const query = getQuery(event)
    const date = (query.date as string) || today

    // date=all → last 30 days grouped by date with summary
    if (date === 'all') {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      const cutoff = thirtyDaysAgo.toISOString().split('T')[0]

      const allEntries = db.select().from(fluidLog)
        .where(eq(fluidLog.date, cutoff)) // drizzle doesn't have gte easily, use raw
        .all()

      // Actually fetch all recent and filter
      const recent = db.select().from(fluidLog).orderBy(desc(fluidLog.date)).limit(500).all()

      // Group by date
      const byDate: Record<string, { totalMl: number; effectiveMl: number; count: number }> = {}
      for (const entry of recent) {
        if (entry.date < cutoff) continue
        if (!byDate[entry.date]) byDate[entry.date] = { totalMl: 0, effectiveMl: 0, count: 0 }
        byDate[entry.date].totalMl += entry.amountMl
        byDate[entry.date].effectiveMl += Math.round(entry.amountMl * (HYDRATION_FACTORS[entry.type] || 0.85))
        byDate[entry.date].count++
      }

      return Object.entries(byDate)
        .sort((a, b) => b[0].localeCompare(a[0]))
        .map(([date, summary]) => ({ date, ...summary }))
    }

    const entries = db.select().from(fluidLog).where(eq(fluidLog.date, date)).all()

    const byType: Record<string, { count: number; totalMl: number; effectiveMl: number }> = {}
    let totalMl = 0
    let effectiveMl = 0

    for (const entry of entries) {
      if (!byType[entry.type]) byType[entry.type] = { count: 0, totalMl: 0, effectiveMl: 0 }
      byType[entry.type].count++
      byType[entry.type].totalMl += entry.amountMl
      byType[entry.type].effectiveMl += Math.round(entry.amountMl * (HYDRATION_FACTORS[entry.type] || 0.85))
      totalMl += entry.amountMl
      effectiveMl += Math.round(entry.amountMl * (HYDRATION_FACTORS[entry.type] || 0.85))
    }

    return {
      date,
      entries,
      summary: {
        byType,
        totalMl,
        effectiveMl,
        targetMl: 2500,
        percentComplete: Math.round((effectiveMl / 2500) * 100),
      },
    }
  }

  // POST /api/fluids — log a single drink
  if (method === 'POST') {
    const body = await readBody(event)
    if (!body.type || !body.amountMl) {
      throw createError({ statusCode: 400, message: 'type and amountMl are required' })
    }

    // Handle batch set_type action
    if (body.action === 'set_type') {
      const date = body.date || today
      db.delete(fluidLog).where(and(eq(fluidLog.date, date), eq(fluidLog.type, body.type))).run()
      const entries = []
      for (let i = 0; i < body.count; i++) {
        entries.push({ date, type: body.type, amountMl: body.ml })
      }
      if (entries.length > 0) db.insert(fluidLog).values(entries).run()
      return { message: `Set ${body.type} to ${body.count} × ${body.ml}ml`, count: body.count }
    }

    // Handle batch delete_type action
    if (body.action === 'delete_type') {
      const date = body.date || today
      const deleted = db.delete(fluidLog).where(and(eq(fluidLog.date, date), eq(fluidLog.type, body.type))).run()
      return { message: `Deleted all ${body.type} entries`, deleted: deleted.changes }
    }

    // Normal single entry log
    const result = db.insert(fluidLog).values({
      date: body.date || today,
      type: body.type,
      subtype: body.subtype || '',
      amountMl: body.amountMl,
      note: body.note || '',
    }).run()

    return {
      id: Number(result.lastInsertRowid),
      hydrationFactor: HYDRATION_FACTORS[body.type] || 0.85,
      effectiveMl: Math.round(body.amountMl * (HYDRATION_FACTORS[body.type] || 0.85)),
      message: `${body.type} logged!`,
    }
  }

  // PATCH /api/fluids — edit an entry
  // Body: { id, type?, amountMl? }
  if (method === 'PATCH') {
    const body = await readBody(event)
    if (!body.id) throw createError({ statusCode: 400, message: 'id required' })

    const updates: Record<string, any> = {}
    if (body.type) updates.type = body.type
    if (body.amountMl) updates.amountMl = body.amountMl

    db.update(fluidLog).set(updates).where(eq(fluidLog.id, body.id)).run()
    return { message: 'Updated!' }
  }

  // DELETE /api/fluids?id=5 — delete specific entry
  if (method === 'DELETE') {
    const query = getQuery(event)
    const id = Number(query.id)
    if (!id) throw createError({ statusCode: 400, message: 'id query param required' })

    db.delete(fluidLog).where(eq(fluidLog.id, id)).run()
    return { message: 'Deleted!' }
  }
})
