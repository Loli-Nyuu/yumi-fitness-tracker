const DEFAULT_DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
}

function normalizeDateInput(input: string | number | Date): Date {
  if (input instanceof Date) return input

  // Keep YYYY-MM-DD values in local time to avoid timezone day shifts.
  if (typeof input === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(input)) {
    const [year, month, day] = input.split('-').map(Number)
    return new Date(year, month - 1, day)
  }

  return new Date(input)
}

export function formatDate(
  input: string | number | Date,
  options: Intl.DateTimeFormatOptions = DEFAULT_DATE_OPTIONS,
  locales?: string | string[]
): string {
  if (input === null || input === undefined || input === '') return ''

  const date = normalizeDateInput(input)
  if (Number.isNaN(date.getTime())) return ''

  // locales omitted => browser/runtime default locale.
  return date.toLocaleDateString(locales, options)
}

export function formatDuration(seconds: number): string {
  if (!seconds) return '0s'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`
}