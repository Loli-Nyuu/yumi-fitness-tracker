import { useDB, sessions } from '../../db'
import { desc } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const db = useDB()
  const query = getQuery(event)

  let results = db.select().from(sessions).orderBy(desc(sessions.date)).all()

  if (query.limit) {
    results = results.slice(0, Number(query.limit))
  }

  if (query.status) {
    results = results.filter(s => s.status === query.status)
  }

  return results
})
