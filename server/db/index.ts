import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import * as schema from './schema'
import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'

let _db: ReturnType<typeof drizzle> | null = null

export function useDB() {
  if (!_db) {
    const config = useRuntimeConfig()
    const dbPath = config.dbPath || './data/yumi-fitness.db'

    // Ensure directory exists
    mkdirSync(dirname(dbPath), { recursive: true })

    const sqlite = new Database(dbPath)
    sqlite.pragma('journal_mode = WAL')
    sqlite.pragma('foreign_keys = ON')

    _db = drizzle(sqlite, { schema })

    // Auto-create tables
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'full',
        status TEXT NOT NULL DEFAULT 'planned',
        duration_actual INTEGER DEFAULT 0,
        duration_planned INTEGER DEFAULT 0,
        notes TEXT DEFAULT '',
        mood_before INTEGER DEFAULT 3,
        mood_after INTEGER DEFAULT 3,
        energy_level INTEGER DEFAULT 3,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS exercises (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        category TEXT NOT NULL,
        muscle_primary TEXT NOT NULL DEFAULT '',
        muscle_secondary TEXT DEFAULT '',
        gif_url TEXT DEFAULT '',
        description TEXT DEFAULT '',
        kid_friendly_tip TEXT DEFAULT '',
        is_ankle_safe INTEGER NOT NULL DEFAULT 1,
        equipment TEXT NOT NULL DEFAULT 'none',
        preference TEXT NOT NULL DEFAULT 'untested',
        notes TEXT DEFAULT '',
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS session_exercises (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id INTEGER NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
        exercise_id INTEGER NOT NULL REFERENCES exercises(id),
        order_index INTEGER NOT NULL DEFAULT 0,
        sets_planned INTEGER NOT NULL DEFAULT 1,
        sets_completed INTEGER DEFAULT 0,
        reps_planned INTEGER NOT NULL DEFAULT 10,
        reps_completed INTEGER DEFAULT 0,
        hold_time_planned INTEGER DEFAULT 0,
        hold_time_actual INTEGER DEFAULT 0,
        is_pr INTEGER NOT NULL DEFAULT 0,
        pr_value REAL DEFAULT 0,
        notes TEXT DEFAULT ''
      );

      CREATE TABLE IF NOT EXISTS body_measurements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        weight REAL,
        waist REAL,
        hip REAL,
        chest REAL,
        thigh_left REAL,
        thigh_right REAL,
        arm_left REAL,
        arm_right REAL,
        whr REAL,
        shr REAL,
        notes TEXT DEFAULT ''
      );

      CREATE TABLE IF NOT EXISTS sleep_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        sleep_type TEXT NOT NULL DEFAULT 'sleep',
        quality INTEGER NOT NULL DEFAULT 3,
        hours REAL DEFAULT 0,
        notes TEXT DEFAULT ''
      );

      CREATE TABLE IF NOT EXISTS soreness_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        body_part TEXT NOT NULL,
        severity INTEGER NOT NULL DEFAULT 1,
        session_id INTEGER REFERENCES sessions(id),
        notes TEXT DEFAULT ''
      );

      CREATE TABLE IF NOT EXISTS nutrition_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        meal_type TEXT NOT NULL,
        description TEXT DEFAULT '',
        protein REAL DEFAULT 0,
        calories REAL DEFAULT 0,
        notes TEXT DEFAULT ''
      );

      CREATE TABLE IF NOT EXISTS water_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        glasses INTEGER NOT NULL DEFAULT 0,
        target INTEGER NOT NULL DEFAULT 8
      );

      CREATE TABLE IF NOT EXISTS breathing_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        pattern TEXT NOT NULL,
        duration INTEGER NOT NULL DEFAULT 0,
        rounds INTEGER NOT NULL DEFAULT 0,
        notes TEXT DEFAULT ''
      );

      CREATE TABLE IF NOT EXISTS goals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        description TEXT NOT NULL,
        target_value REAL NOT NULL,
        target_unit TEXT NOT NULL DEFAULT '',
        current_value REAL DEFAULT 0,
        deadline TEXT DEFAULT '',
        status TEXT NOT NULL DEFAULT 'active',
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS achievements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        slug TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        description TEXT DEFAULT '',
        icon TEXT DEFAULT '🏆',
        unlocked_at TEXT,
        session_id INTEGER REFERENCES sessions(id)
      );

      CREATE TABLE IF NOT EXISTS outfit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        description TEXT NOT NULL,
        photo_url TEXT DEFAULT '',
        body_notes TEXT DEFAULT '',
        yumi_rating INTEGER DEFAULT 3
      );

      CREATE TABLE IF NOT EXISTS flexibility_progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        stretch_type TEXT NOT NULL,
        distance_from_floor REAL,
        hold_time INTEGER DEFAULT 0,
        comfort_level INTEGER DEFAULT 3,
        notes TEXT DEFAULT ''
      );

      CREATE TABLE IF NOT EXISTS yumi_notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        session_id INTEGER REFERENCES sessions(id),
        visibility TEXT NOT NULL DEFAULT 'shared',
        content TEXT NOT NULL,
        category TEXT DEFAULT 'observation'
      );

      CREATE TABLE IF NOT EXISTS pr_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        exercise_id INTEGER NOT NULL REFERENCES exercises(id),
        value REAL NOT NULL,
        unit TEXT NOT NULL DEFAULT 'seconds',
        date TEXT NOT NULL,
        session_id INTEGER NOT NULL REFERENCES sessions(id),
        previous_record REAL
      );

      CREATE TABLE IF NOT EXISTS fluid_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        type TEXT NOT NULL,
        amount_ml INTEGER NOT NULL,
        note TEXT DEFAULT '',
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `)
  }

  return _db!
}

export * from './schema'
