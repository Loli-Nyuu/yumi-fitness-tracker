import type { Config } from 'drizzle-kit'

export default {
  schema: './server/db/schema/index.ts',
  out: './server/db/migrations',
  dialect: 'sqlite',
  dbCredentials: {
    url: './data/yumi-fitness.db',
  },
} satisfies Config
