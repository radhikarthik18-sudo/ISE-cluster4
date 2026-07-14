// Shared helpers for Calendar-of-Events style documents.
// Keeping this separate means COEEntry and COEView (and any future
// document types) always agree on colors and holiday rules.

export const DAY_KEYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export const EVENT_COLORS = [
  { name: 'Red', hex: '#d9534f' },
  { name: 'Lavender', hex: '#b8a3dd' },
  { name: 'Teal', hex: '#3f8f7f' },
  { name: 'Orange', hex: '#e0904f' },
  { name: 'Pink', hex: '#e08aa8' },
  { name: 'Tan', hex: '#b39a5f' },
  { name: 'Blue', hex: '#6fa2d8' },
  { name: 'Green', hex: '#4f8a5f' },
]

// Soft red used for auto-marked holidays (Sundays, 1st & 3rd Saturdays)
export const HOLIDAY_COLOR = '#f2a6a2'

// A Saturday's "occurrence number" within its month can be derived
// from the date number alone: occurrence = ceil(dateNumber / 7).
// e.g. Sat 6 -> 1st Saturday, Sat 13 -> 2nd, Sat 20 -> 3rd, Sat 27 -> 4th.
function isFirstOrThirdSaturday(dateNum) {
  const n = Number(dateNum)
  if (!n) return false
  const occurrence = Math.ceil(n / 7)
  return occurrence === 1 || occurrence === 3
}

// Returns the automatic holiday color for a given day-column + date number,
// or null if it isn't an auto-holiday. Manual event colors always take
// priority over this (checked by the caller).
export function getAutoHolidayColor(dayKey, dateNum) {
  if (dateNum === '' || dateNum === undefined || dateNum === null) return null
  if (dayKey === 'Sun') return HOLIDAY_COLOR
  if (dayKey === 'Sat' && isFirstOrThirdSaturday(dateNum)) return HOLIDAY_COLOR
  return null
}