import { useDB, outfitLogs } from '../db'
import { desc } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const db = useDB()

  if (event.method === 'GET') {
    return db.select().from(outfitLogs).orderBy(desc(outfitLogs.date)).all()
  }

  if (event.method === 'POST') {
    const body = await readBody(event)
    const result = db.insert(outfitLogs).values({
      date: body.date || new Date().toISOString().split('T')[0],
      description: body.description,
      photoUrl: body.photoUrl || '',
      bodyNotes: body.bodyNotes || '',
      yumiRating: body.yumiRating || 3,
    }).run()
    return { id: Number(result.lastInsertRowid), message: 'Outfit logged!' }
  }
})
