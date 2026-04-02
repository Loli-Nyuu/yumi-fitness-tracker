import { useDB, sessions, sessionExercises, exercises, prRecords } from '../../db'
import { eq, desc } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const db = useDB()
  const id = Number(getRouterParam(event, 'id'))

  if (event.method === 'GET') {
    const session = db.select().from(sessions).where(eq(sessions.id, id)).get()
    if (!session) {
      throw createError({ statusCode: 404, message: 'Session not found' })
    }

    const sessionExs = db
      .select()
      .from(sessionExercises)
      .where(eq(sessionExercises.sessionId, id))
      .all()

    // Join with exercise details
    const exerciseDetails = sessionExs.map(se => {
      const exercise = db.select().from(exercises).where(eq(exercises.id, se.exerciseId)).get()
      return { ...se, exercise }
    })

    // Get PRs from this session
    const sessionPrs = db
      .select()
      .from(prRecords)
      .where(eq(prRecords.sessionId, id))
      .all()

    return {
      ...session,
      exercises: exerciseDetails,
      prs: sessionPrs,
    }
  }

  if (event.method === 'PATCH') {
    const body = await readBody(event)

    const updates: Record<string, any> = {}
    if (body.status) updates.status = body.status
    if (body.durationActual) updates.durationActual = body.durationActual
    if (body.notes !== undefined) updates.notes = body.notes
    if (body.moodAfter) updates.moodAfter = body.moodAfter

    if (body.status === 'completed') {
      updates.durationActual = body.durationActual || 0
    }

    db.update(sessions).set(updates).where(eq(sessions.id, id)).run()

    return { message: 'Session updated!' }
  }
})
