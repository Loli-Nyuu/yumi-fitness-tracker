import { useDB, sessions, prRecords, exercises, bodyMeasurements, sleepLog, waterLog, goals } from '../db'
import { desc, eq, gte, sql } from 'drizzle-orm'

export default defineEventHandler(async () => {
  const db = useDB()
  const today = new Date().toISOString().split('T')[0]

  // Today's session
  const todaySession = db.select().from(sessions).where(eq(sessions.date, today)).get() || null

  // Recent sessions
  const recentSessions = db.select().from(sessions).orderBy(desc(sessions.date)).limit(7).all()

  // All PRs
  const allPrs = db
    .select({
      id: prRecords.id,
      value: prRecords.value,
      unit: prRecords.unit,
      date: prRecords.date,
      exerciseName: exercises.name,
      exerciseSlug: exercises.slug,
    })
    .from(prRecords)
    .leftJoin(exercises, eq(prRecords.exerciseId, exercises.id))
    .orderBy(desc(prRecords.date))
    .limit(10)
    .all()

  // Latest body measurement
  const latestMeasurement = db.select().from(bodyMeasurements).orderBy(desc(bodyMeasurements.date)).limit(1).get() || null

  // Today's water
  const todayWater = db.select().from(waterLog).where(eq(waterLog.date, today)).get() || { glasses: 0, target: 8 }

  // Last sleep
  const lastSleep = db.select().from(sleepLog).orderBy(desc(sleepLog.date)).limit(1).get() || null

  // Active goals
  const activeGoals = db.select().from(goals).where(eq(goals.status, 'active')).all()

  // Weekly streak (sessions in last 7 days)
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  const weeklySessions = db.select().from(sessions)
    .where(gte(sessions.date, weekAgo.toISOString().split('T')[0]))
    .all()
  const completedThisWeek = weeklySessions.filter(s => s.status === 'completed').length

  // Total sessions
  const totalSessions = db.select({ count: sql<number>`count(*)` }).from(sessions).get()

  return {
    today: {
      date: today,
      session: todaySession || null,
      water: todayWater,
    },
    recentSessions,
    prs: allPrs,
    latestMeasurement,
    lastSleep,
    activeGoals,
    stats: {
      completedThisWeek,
      totalSessions: totalSessions?.count || 0,
    },
  }
})
