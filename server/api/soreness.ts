import { useDB, sorenessLog } from '../db'
import { desc, eq, and } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const db = useDB()
  const today = new Date().toISOString().split('T')[0]
  const query = getQuery(event)

  if (event.method === 'GET') {
    const date = query.date as string

    if (date === 'all') {
      // Full history for charting (last 200 entries)
      return db.select().from(sorenessLog).orderBy(desc(sorenessLog.date)).limit(200).all()
    }

    // Today or specific date — deduplicated
    const targetDate = date || today
    const entries = db.select().from(sorenessLog).where(eq(sorenessLog.date, targetDate)).all()
    const byPart: Record<string, { id: number; severity: number }> = {}
    for (const entry of entries) {
      if (!byPart[entry.bodyPart] || entry.id > byPart[entry.bodyPart].id) {
        byPart[entry.bodyPart] = { id: entry.id, severity: entry.severity }
      }
    }
    return byPart
  }

  if (event.method === 'POST') {
    const body = await readBody(event)
    const entryDate = body.date || today

    // Batch mode: { entries: [{ bodyPart, severity }, ...] }
    if (Array.isArray(body.entries)) {
      // Delete all existing entries for today
      db.delete(sorenessLog).where(eq(sorenessLog.date, entryDate)).run()

      // Insert all new entries (skip severity 0)
      for (const entry of body.entries) {
        if (entry.severity > 0) {
          db.insert(sorenessLog).values({
            date: entryDate,
            bodyPart: entry.bodyPart,
            severity: entry.severity,
            sessionId: body.sessionId || null,
            notes: entry.notes || '',
          }).run()
        }
      }

      // Return all current entries for the day (deduplicated, same as GET)
      const entries = db.select().from(sorenessLog).where(eq(sorenessLog.date, entryDate)).all()
      const byPart: Record<string, { id: number; severity: number }> = {}
      for (const entry of entries) {
        if (!byPart[entry.bodyPart] || entry.id > byPart[entry.bodyPart].id) {
          byPart[entry.bodyPart] = { id: entry.id, severity: entry.severity }
        }
      }
      return byPart
    }

    // Single-entry mode (backward compat)
    const existing = db.select().from(sorenessLog)
      .where(and(eq(sorenessLog.date, entryDate), eq(sorenessLog.bodyPart, body.bodyPart)))
      .all()
      .sort((a: any, b: any) => b.id - a.id)[0]

    if (existing) {
      if (body.severity === 0) {
        // Delete ALL entries for this body part today
        db.delete(sorenessLog)
          .where(and(eq(sorenessLog.date, entryDate), eq(sorenessLog.bodyPart, body.bodyPart)))
          .run()
        return { message: `${body.bodyPart} soreness removed`, deleted: true }
      }
      db.update(sorenessLog)
        .set({ severity: body.severity, notes: body.notes || '' })
        .where(eq(sorenessLog.id, existing.id))
        .run()
      return { id: existing.id, message: `${body.bodyPart} updated to ${body.severity}`, updated: true }
    }

    if (body.severity === 0) {
      return { message: `${body.bodyPart} no soreness`, skipped: true }
    }

    const result = db.insert(sorenessLog).values({
      date: entryDate,
      bodyPart: body.bodyPart,
      severity: body.severity || 1,
      sessionId: body.sessionId || null,
      notes: body.notes || '',
    }).run()
    return { id: Number(result.lastInsertRowid), message: `${body.bodyPart} soreness logged`, created: true }
  }

  // DELETE all entries for a date
  if (event.method === 'DELETE') {
    const date = (query.date as string) || today
    const deleted = db.delete(sorenessLog).where(eq(sorenessLog.date, date)).run()
    return { message: `Cleared soreness for ${date}`, deleted: deleted.changes }
  }
})
