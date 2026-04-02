import { useDB, sleepLog } from '../db'
import { desc, eq, and, sql } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const db = useDB()

  if (event.method === 'GET') {
    const query = getQuery(event)
    const date = query.date as string

    if (date) {
      // Return all entries for a specific date
      return db.select().from(sleepLog).where(eq(sleepLog.date, date)).all()
    }

    // Return last 30 entries with summary
    const entries = db.select().from(sleepLog).orderBy(desc(sleepLog.date)).limit(30).all()

    // Calculate today's summary
    const today = new Date().toISOString().split('T')[0]
    const todayEntries = entries.filter(e => e.date === today)
    const todaySleep = todayEntries.filter(e => e.sleepType === 'sleep')
    const todayNaps = todayEntries.filter(e => e.sleepType === 'nap')

    const totalSleepHours = todaySleep.reduce((sum, e) => sum + (e.hours || 0), 0)
    const totalNapHours = todayNaps.reduce((sum, e) => sum + (e.hours || 0), 0)
    const avgQuality = todayEntries.length > 0
      ? Math.round(todayEntries.reduce((sum, e) => sum + (e.quality || 3), 0) / todayEntries.length * 10) / 10
      : 0

    return {
      entries,
      todaySummary: {
        date: today,
        sleepCount: todaySleep.length,
        napCount: todayNaps.length,
        totalSleepHours,
        totalNapHours,
        totalRestHours: totalSleepHours + totalNapHours,
        avgQuality,
        // Sleep score: 8h sleep + quality weighted = 100
        sleepScore: Math.min(100, Math.round(
          (totalSleepHours / 8 * 60) + (avgQuality / 5 * 40)
        )),
      },
    }
  }

  if (event.method === 'POST') {
    const body = await readBody(event)
    const result = db.insert(sleepLog).values({
      date: body.date || new Date().toISOString().split('T')[0],
      sleepType: body.sleepType || 'sleep', // 'sleep' or 'nap'
      quality: body.quality || 3,
      hours: body.hours || 0,
      notes: body.notes || '',
    }).run()
    return { id: Number(result.lastInsertRowid), message: `${body.sleepType || 'sleep'} logged!` }
  }

  if (event.method === 'DELETE') {
    const query = getQuery(event)
    const id = Number(query.id)
    if (id) {
      db.delete(sleepLog).where(eq(sleepLog.id, id)).run()
      return { message: 'Deleted!' }
    }
  }
})
