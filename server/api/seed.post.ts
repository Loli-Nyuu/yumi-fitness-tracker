import { seedExercises } from '../db/seed-exercises'

export default defineEventHandler(async () => {
  try {
    await seedExercises()
    return { message: 'Exercises seeded successfully!' }
  } catch (err) {
    console.error('Seeding error:', err)
    return { error: 'Failed to seed exercises', details: err }
  }
})
