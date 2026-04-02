import { useDB, sessions } from '../../db'

export default defineEventHandler(async (event) => {
  const db = useDB()
  const body = await readBody(event)

  if (!body.date || !body.type) {
    throw createError({ statusCode: 400, message: 'date and type are required' })
  }

  const result = db.insert(sessions).values({
    date: body.date,
    type: body.type || 'full',
    status: 'planned',
    durationPlanned: body.durationPlanned || 0,
    notes: body.notes || '',
    moodBefore: body.moodBefore || 3,
    energyLevel: body.energyLevel || 3,
  }).run()

  return {
    id: Number(result.lastInsertRowid),
    message: 'Session created!',
  }
})
