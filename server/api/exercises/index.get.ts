import { useDB, exercises } from '../../db'
import { eq, like, and } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const db = useDB()
  const query = getQuery(event)

  let results = db.select().from(exercises).all()

  // Filter by category
  if (query.category) {
    results = results.filter(e => e.category === query.category)
  }

  // Filter by ankle safety
  if (query.ankleSafe === 'true') {
    results = results.filter(e => e.isAnkleSafe)
  }

  // Filter by preference
  if (query.preference) {
    results = results.filter(e => e.preference === query.preference)
  }

  // Exclude hated
  if (query.excludeHated === 'true') {
    results = results.filter(e => e.preference !== 'hated')
  }

  // Search by name
  if (query.search) {
    const search = (query.search as string).toLowerCase()
    results = results.filter(e => e.name.toLowerCase().includes(search))
  }

  return results
})
