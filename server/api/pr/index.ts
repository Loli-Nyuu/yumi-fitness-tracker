import { useDB, prRecords, exercises } from '../../db'
import { desc, eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const db = useDB()

  if (event.method === 'GET') {
    const prs = db
      .select({
        id: prRecords.id,
        exerciseId: prRecords.exerciseId,
        value: prRecords.value,
        unit: prRecords.unit,
        date: prRecords.date,
        sessionId: prRecords.sessionId,
        previousRecord: prRecords.previousRecord,
        exerciseName: exercises.name,
        exerciseSlug: exercises.slug,
      })
      .from(prRecords)
      .leftJoin(exercises, eq(prRecords.exerciseId, exercises.id))
      .orderBy(desc(prRecords.date))
      .all()

    return prs
  }

  if (event.method === 'POST') {
    const body = await readBody(event)

    // Get previous record
    const previous = db
      .select()
      .from(prRecords)
      .where(eq(prRecords.exerciseId, body.exerciseId))
      .orderBy(desc(prRecords.value))
      .limit(1)
      .get()

    const result = db.insert(prRecords).values({
      exerciseId: body.exerciseId,
      value: body.value,
      unit: body.unit || 'seconds',
      date: body.date || new Date().toISOString().split('T')[0],
      sessionId: body.sessionId,
      previousRecord: previous?.value || null,
    }).run()

    return {
      id: Number(result.lastInsertRowid),
      isPr: !previous || body.value > previous.value,
      previousRecord: previous?.value || null,
      message: 'PR logged!',
    }
  }
})
