import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'

export const sessions = sqliteTable('sessions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  date: text('date').notNull(),
  type: text('type').notNull().default('full'),
  status: text('status').notNull().default('planned'),
  durationActual: integer('duration_actual').default(0),
  durationPlanned: integer('duration_planned').default(0),
  notes: text('notes').default(''),
  moodBefore: integer('mood_before').default(3),
  moodAfter: integer('mood_after').default(3),
  energyLevel: integer('energy_level').default(3),
  createdAt: text('created_at').notNull().default("datetime('now')"),
})

export const exercises = sqliteTable('exercises', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  category: text('category').notNull(),
  musclePrimary: text('muscle_primary').notNull().default(''),
  muscleSecondary: text('muscle_secondary').default(''),
  gifUrl: text('gif_url').default(''),
  description: text('description').default(''),
  kidFriendlyTip: text('kid_friendly_tip').default(''),
  isAnkleSafe: integer('is_ankle_safe', { mode: 'boolean' }).notNull().default(true),
  equipment: text('equipment').notNull().default('none'),
  preference: text('preference').notNull().default('untested'),
  notes: text('notes').default(''),
  createdAt: text('created_at').notNull().default("datetime('now')"),
})

export const sessionExercises = sqliteTable('session_exercises', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  sessionId: integer('session_id').notNull().references(() => sessions.id, { onDelete: 'cascade' }),
  exerciseId: integer('exercise_id').notNull().references(() => exercises.id),
  orderIndex: integer('order_index').notNull().default(0),
  setsPlanned: integer('sets_planned').notNull().default(1),
  setsCompleted: integer('sets_completed').default(0),
  repsPlanned: integer('reps_planned').notNull().default(10),
  repsCompleted: integer('reps_completed').default(0),
  holdTimePlanned: integer('hold_time_planned').default(0),
  holdTimeActual: integer('hold_time_actual').default(0),
  isPr: integer('is_pr', { mode: 'boolean' }).notNull().default(false),
  prValue: real('pr_value').default(0),
  notes: text('notes').default(''),
})

export const bodyMeasurements = sqliteTable('body_measurements', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  date: text('date').notNull(),
  weight: real('weight'),
  waist: real('waist'),
  hip: real('hip'),
  chest: real('chest'),
  thighLeft: real('thigh_left'),
  thighRight: real('thigh_right'),
  armLeft: real('arm_left'),
  armRight: real('arm_right'),
  whr: real('whr'),
  shr: real('shr'),
  notes: text('notes').default(''),
})

export const sleepLog = sqliteTable('sleep_log', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  date: text('date').notNull(),
  sleepType: text('sleep_type').notNull().default('sleep'),
  quality: integer('quality').notNull().default(3),
  hours: real('hours').default(0),
  notes: text('notes').default(''),
})

export const sorenessLog = sqliteTable('soreness_log', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  date: text('date').notNull(),
  bodyPart: text('body_part').notNull(),
  severity: integer('severity').notNull().default(1),
  sessionId: integer('session_id').references(() => sessions.id),
  notes: text('notes').default(''),
})

export const nutritionLog = sqliteTable('nutrition_log', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  date: text('date').notNull(),
  mealType: text('meal_type').notNull(),
  description: text('description').default(''),
  protein: real('protein').default(0),
  calories: real('calories').default(0),
  notes: text('notes').default(''),
})

export const waterLog = sqliteTable('water_log', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  date: text('date').notNull(),
  glasses: integer('glasses').notNull().default(0),
  target: integer('target').notNull().default(8),
})

export const breathingSessions = sqliteTable('breathing_sessions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  date: text('date').notNull(),
  pattern: text('pattern').notNull(),
  duration: integer('duration').notNull().default(0),
  rounds: integer('rounds').notNull().default(0),
  notes: text('notes').default(''),
})

export const goals = sqliteTable('goals', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  type: text('type').notNull(),
  description: text('description').notNull(),
  targetValue: real('target_value').notNull(),
  targetUnit: text('target_unit').notNull().default(''),
  currentValue: real('current_value').default(0),
  deadline: text('deadline').default(''),
  status: text('status').notNull().default('active'),
  createdAt: text('created_at').notNull().default("datetime('now')"),
})

export const achievements = sqliteTable('achievements', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  description: text('description').default(''),
  icon: text('icon').default('🏆'),
  unlockedAt: text('unlocked_at'),
  sessionId: integer('session_id').references(() => sessions.id),
})

export const outfitLogs = sqliteTable('outfit_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  date: text('date').notNull(),
  description: text('description').notNull(),
  photoUrl: text('photo_url').default(''),
  bodyNotes: text('body_notes').default(''),
  yumiRating: integer('yumi_rating').default(3),
})

export const flexibilityProgress = sqliteTable('flexibility_progress', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  date: text('date').notNull(),
  stretchType: text('stretch_type').notNull(),
  distanceFromFloor: real('distance_from_floor'),
  holdTime: integer('hold_time').default(0),
  comfortLevel: integer('comfort_level').default(3),
  notes: text('notes').default(''),
})

export const yumiNotes = sqliteTable('yumi_notes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  date: text('date').notNull(),
  sessionId: integer('session_id').references(() => sessions.id),
  visibility: text('visibility').notNull().default('shared'),
  content: text('content').notNull(),
  category: text('category').default('observation'),
})

export const prRecords = sqliteTable('pr_records', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  exerciseId: integer('exercise_id').notNull().references(() => exercises.id),
  value: real('value').notNull(),
  unit: text('unit').notNull().default('seconds'),
  date: text('date').notNull(),
  sessionId: integer('session_id').notNull().references(() => sessions.id),
  previousRecord: real('previous_record'),
})

export * from './fluids'
