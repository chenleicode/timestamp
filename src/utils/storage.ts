import type { TimestampUnit, TimezoneMode } from '../types/time'

export interface SavedPreferences {
  pickedDateTime: string
  timezoneMode: TimezoneMode
  timestampValue: string
  timestampUnit: TimestampUnit
  isTickerPaused: boolean
}

const STORAGE_KEY = 'timestamp-studio/preferences'

export const DEFAULT_PREFERENCES: SavedPreferences = {
  pickedDateTime: '',
  timezoneMode: 'beijing',
  timestampValue: '',
  timestampUnit: 'seconds',
  isTickerPaused: false,
}

function normalizeTimezoneMode(value: unknown): TimezoneMode {
  switch (value) {
    case 'beijing':
    case 'tokyo':
    case 'seoul':
    case 'singapore':
    case 'london':
    case 'new-york':
    case 'los-angeles':
    case 'sydney':
    case 'utc':
      return value
    default:
      return DEFAULT_PREFERENCES.timezoneMode
  }
}

export function loadPreferences(): SavedPreferences {
  let rawValue: string | null = null

  try {
    rawValue = window.localStorage.getItem(STORAGE_KEY)
  } catch {
    return DEFAULT_PREFERENCES
  }

  if (!rawValue) {
    return DEFAULT_PREFERENCES
  }

  try {
    const parsed = JSON.parse(rawValue) as Partial<SavedPreferences>

    return {
      pickedDateTime:
        typeof parsed.pickedDateTime === 'string'
          ? parsed.pickedDateTime
          : DEFAULT_PREFERENCES.pickedDateTime,
      timezoneMode:
        typeof parsed.timezoneMode === 'string'
          ? normalizeTimezoneMode(parsed.timezoneMode)
          : parsed.timeToTimestampTimezone === 'utc' ||
                parsed.timestampToTimeTimezone === 'utc'
            ? 'utc'
            : DEFAULT_PREFERENCES.timezoneMode,
      timestampValue:
        typeof parsed.timestampValue === 'string'
          ? parsed.timestampValue
          : DEFAULT_PREFERENCES.timestampValue,
      timestampUnit:
        parsed.timestampUnit === 'milliseconds'
          ? 'milliseconds'
          : 'seconds',
      isTickerPaused:
        typeof parsed.isTickerPaused === 'boolean'
          ? parsed.isTickerPaused
          : DEFAULT_PREFERENCES.isTickerPaused,
    }
  } catch {
    return DEFAULT_PREFERENCES
  }
}

export function savePreferences(preferences: SavedPreferences) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences))
  } catch {
    // Ignore storage failures so the tool still works in restricted contexts.
  }
}
