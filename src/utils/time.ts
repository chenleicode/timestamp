import type {
  ConversionResult,
  DateTimeParts,
  TimestampUnit,
  TimezoneMode,
} from '../types/time'

const DATE_TIME_PATTERN =
  /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/

const TIMEZONE_IDS: Record<TimezoneMode, string> = {
  beijing: 'Asia/Shanghai',
  tokyo: 'Asia/Tokyo',
  seoul: 'Asia/Seoul',
  singapore: 'Asia/Singapore',
  london: 'Europe/London',
  'new-york': 'America/New_York',
  'los-angeles': 'America/Los_Angeles',
  sydney: 'Australia/Sydney',
  utc: 'UTC',
}

function pad(value: number) {
  return `${value}`.padStart(2, '0')
}

const formatterCache = new Map<TimezoneMode, Intl.DateTimeFormat>()

function parseDateTimeParts(value: string): DateTimeParts | null {
  const matches = DATE_TIME_PATTERN.exec(value)
  if (!matches) {
    return null
  }

  const [, year, month, day, hour, minute, second] = matches

  return {
    year: Number(year),
    month: Number(month),
    day: Number(day),
    hour: Number(hour),
    minute: Number(minute),
    second: Number(second),
  }
}

function getFormatter(timezone: TimezoneMode) {
  const cachedFormatter = formatterCache.get(timezone)
  if (cachedFormatter) {
    return cachedFormatter
  }

  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE_IDS[timezone],
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  })

  formatterCache.set(timezone, formatter)

  return formatter
}

function partsToComparableValue(parts: DateTimeParts) {
  return Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
  )
}

function formatDateTimeParts(parts: DateTimeParts) {
  return `${parts.year}-${pad(parts.month)}-${pad(parts.day)} ${pad(parts.hour)}:${pad(parts.minute)}:${pad(parts.second)}`
}

function extractDateTimeParts(milliseconds: number, timezone: TimezoneMode) {
  const formattedParts = getFormatter(timezone).formatToParts(
    new Date(milliseconds),
  )

  const values = {
    year: 0,
    month: 0,
    day: 0,
    hour: 0,
    minute: 0,
    second: 0,
  }

  for (const part of formattedParts) {
    if (
      part.type === 'year' ||
      part.type === 'month' ||
      part.type === 'day' ||
      part.type === 'hour' ||
      part.type === 'minute' ||
      part.type === 'second'
    ) {
      values[part.type] = Number(part.value)
    }
  }

  return values
}

function partsToMilliseconds(parts: DateTimeParts, timezone: TimezoneMode) {
  let candidateMilliseconds = partsToComparableValue(parts)

  for (let index = 0; index < 4; index += 1) {
    const renderedParts = extractDateTimeParts(candidateMilliseconds, timezone)
    const delta =
      partsToComparableValue(parts) - partsToComparableValue(renderedParts)

    if (delta === 0) {
      return candidateMilliseconds
    }

    candidateMilliseconds += delta
  }

  return formatDateTimeParts(
    extractDateTimeParts(candidateMilliseconds, timezone),
  ) === formatDateTimeParts(parts)
    ? candidateMilliseconds
    : null
}

export function datetimeStringToTimestamp(
  value: string,
  timezone: TimezoneMode,
): ConversionResult | null {
  const parts = parseDateTimeParts(value)
  if (!parts) {
    return null
  }

  const milliseconds = partsToMilliseconds(parts, timezone)
  if (milliseconds === null) {
    return null
  }

  return {
    seconds: `${Math.trunc(milliseconds / 1000)}`,
    milliseconds: `${milliseconds}`,
  }
}

export function timestampToMilliseconds(
  rawValue: string,
  unit: TimestampUnit,
): number | null {
  const trimmed = rawValue.trim()
  if (!trimmed || !/^-?\d+$/.test(trimmed)) {
    return null
  }

  const numericValue = Number(trimmed)
  if (!Number.isSafeInteger(numericValue)) {
    return null
  }

  const milliseconds =
    unit === 'seconds' ? numericValue * 1000 : numericValue

  return Number.isSafeInteger(milliseconds) ? milliseconds : null
}

export function millisecondsToDatetime(
  milliseconds: number,
  timezone: TimezoneMode,
) {
  const candidate = new Date(milliseconds)
  if (Number.isNaN(candidate.getTime())) {
    return null
  }

  return formatDateTimeParts(extractDateTimeParts(milliseconds, timezone))
}

export function millisecondsToTimestamp(
  milliseconds: number,
  unit: TimestampUnit,
) {
  return unit === 'seconds'
    ? `${Math.trunc(milliseconds / 1000)}`
    : `${milliseconds}`
}
