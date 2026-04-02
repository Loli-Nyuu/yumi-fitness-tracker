import { useDB } from '../../db'
import Database from 'better-sqlite3'
import { mkdirSync, existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'

const settingsPath = './data/settings.json'

interface Settings {
  theme: string
  colorMode: 'light' | 'dark' | 'system'
}

const defaults: Settings = {
  theme: 'yumi',
  colorMode: 'system',
}

function loadSettings(): Settings {
  if (existsSync(settingsPath)) {
    try {
      return { ...defaults, ...JSON.parse(readFileSync(settingsPath, 'utf-8')) }
    } catch { return defaults }
  }
  return defaults
}

function saveSettings(settings: Settings) {
  mkdirSync(dirname(settingsPath), { recursive: true })
  writeFileSync(settingsPath, JSON.stringify(settings, null, 2))
}

export default defineEventHandler(async (event) => {
  if (event.method === 'GET') {
    return loadSettings()
  }

  if (event.method === 'PATCH') {
    const body = await readBody(event)
    const current = loadSettings()
    const updated: Settings = {
      theme: body.theme ?? current.theme,
      colorMode: body.colorMode ?? current.colorMode,
    }
    saveSettings(updated)
    return { message: 'Settings saved!', ...updated }
  }
})
