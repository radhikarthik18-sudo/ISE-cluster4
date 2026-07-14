// Shared helpers for Calendar-of-Events style documents.

export const DAY_KEYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export const EVENT_COLORS = [
  { name: 'Red', hex: '#8e2521' },
  { name: 'Lavender', hex: '#7436e0' },
  { name: 'Teal', hex: '#16f5c8' },
  { name: 'Orange', hex: '#ed6f08' },
  { name: 'Pink', hex: '#d40e53' },
  { name: 'Tan', hex: '#8f6504' },
  { name: 'Blue', hex: '#0679f4' },
  { name: 'Green', hex: '#08f046' },
]

// Soft red used for auto-marked holidays (Sundays, 1st & 3rd Saturdays)
export const HOLIDAY_COLOR = '#fc1104'

// Solid red used for fetched government holidays
export const GOVT_HOLIDAY_COLOR = '#fc1104'

// A Saturday's "occurrence number" within its month can be derived
// from the date number alone: occurrence = ceil(dateNumber / 7).
function isFirstOrThirdSaturday(dateNum) {
  const n = Number(dateNum)
  if (!n) return false
  const occurrence = Math.ceil(n / 7)
  return occurrence === 1 || occurrence === 3
}

// Automatic Sunday / 1st & 3rd Saturday holiday tint (independent of any manual event)
export function getAutoHolidayColor(dayKey, dateNum) {
  if (dateNum === '' || dateNum === undefined || dateNum === null) return null
  if (dayKey === 'Sun') return HOLIDAY_COLOR
  if (dayKey === 'Sat' && isFirstOrThirdSaturday(dateNum)) return HOLIDAY_COLOR
  return null
}

const MONTH_INDEX = {
  JANUARY: 0, FEBRUARY: 1, MARCH: 2, APRIL: 3, MAY: 4, JUNE: 5,
  JULY: 6, AUGUST: 7, SEPTEMBER: 8, OCTOBER: 9, NOVEMBER: 10, DECEMBER: 11,
}

// Reconstructs the real ISO date (YYYY-MM-DD) for a grid cell, using the
// row's Month name + Year + the date number in that day column.
// Returns null for blank cells (e.g. days that belong to the other month
// in a split week row).
export function cellToISODate(row, dayKey) {
  const dateNum = row[dayKey]
  if (dateNum === '' || dateNum === undefined || dateNum === null) return null
  const monthIdx = MONTH_INDEX[row.Month]
  if (monthIdx === undefined || !row.Year) return null
  const d = new Date(row.Year, monthIdx, Number(dateNum))
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

// All ISO dates from fromISO to toISO inclusive
export function datesInRange(fromISO, toISO) {
  const dates = []
  let cur = new Date(fromISO)
  const end = new Date(toISO)
  while (cur <= end) {
    dates.push(cur.toISOString().slice(0, 10))
    cur.setDate(cur.getDate() + 1)
  }
  return dates
}

const MONTH_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

// True when isoB is exactly one calendar day after isoA.
function isNextDay(isoA, isoB) {
  const a = new Date(isoA)
  const b = new Date(isoB)
  const diffDays = Math.round((b - a) / (1000 * 60 * 60 * 24))
  return diffDays === 1
}

// Collapses a flat, date-keyed events list (one entry per date, e.g. a
// 3-day range saved as 3 separate same-Text/Color entries) into contiguous
// ranges: [{ Text, Color, StartDate, EndDate }, ...]. Events are grouped
// only when Text AND Color match AND their dates are back-to-back.
export function groupEventsIntoRanges(events) {
  if (!events || events.length === 0) return []

  const sorted = [...events].sort((a, b) => {
    if (a.Text !== b.Text) return a.Text < b.Text ? -1 : 1
    if (a.Color !== b.Color) return a.Color < b.Color ? -1 : 1
    return a.Date < b.Date ? -1 : 1
  })

  const groups = []
  let current = null

  sorted.forEach((ev) => {
    if (
      current &&
      current.Text === ev.Text &&
      current.Color === ev.Color &&
      isNextDay(current.EndDate, ev.Date)
    ) {
      current.EndDate = ev.Date
    } else {
      current = { Text: ev.Text, Color: ev.Color, StartDate: ev.Date, EndDate: ev.Date }
      groups.push(current)
    }
  })

  return groups
}

// "12 Jul" style day+month label for a single ISO date.
function formatDayMonth(iso) {
  const d = new Date(iso)
  const day = String(d.getDate()).padStart(2, '0')
  return `${day} ${MONTH_SHORT[d.getMonth()]}`
}

// Formats a grouped event for display:
//  - single date:        "12 Jul : Event Name"
//  - same-month range:   "10 - 12 Jul : Event Name"
//  - cross-month range:  "30 Jul - 02 Aug : Event Name"
export function formatEventLabel(group) {
  if (group.StartDate === group.EndDate) {
    return `${formatDayMonth(group.StartDate)} : ${group.Text}`
  }

  const start = new Date(group.StartDate)
  const end = new Date(group.EndDate)
  const startDay = String(start.getDate()).padStart(2, '0')
  const endDay = String(end.getDate()).padStart(2, '0')

  const sameMonth = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()
  const range = sameMonth
    ? `${startDay} - ${endDay} ${MONTH_SHORT[end.getMonth()]}`
    : `${startDay} ${MONTH_SHORT[start.getMonth()]} - ${endDay} ${MONTH_SHORT[end.getMonth()]}`

  return `${range} : ${group.Text}`
}

// Common events that repeat every semester, with a suggested color each.
export const COMMON_EVENTS = [
  { label: 'Commencement of Semester Classes', color: '#4f8a5f' },
  { label: 'Last Working Day of Semester Classes', color: '#4f8a5f' },
  { label: 'Announcement of Continuous Comprehensive Assessment (CCA) - CCA1 and CCA2', color: '#6fa2d8' },
  { label: 'Evaluation of CCA1', color: '#3f8f7f' },
  { label: 'Evaluation of CCA2', color: '#3f8f7f' },
  { label: 'Finalization of CCA1', color: '#3f8f7f' },
  { label: 'Finalization of CCA2', color: '#3f8f7f' },
  { label: 'Faculty Feedback-1 by Students', color: '#b39a5f' },
  { label: 'Faculty Feedback-2 by Students', color: '#b39a5f' },
  { label: 'Internal Assessment 1', color: '#d9534f' },
  { label: 'Internal Assessment 2', color: '#d9534f' },
  { label: 'Last Date to enter IA1 Marks in Contineo Portal', color: '#e0904f' },
  { label: 'Last Date to enter IA2 Marks in Contineo Portal', color: '#e0904f' },
  { label: 'IA1 QPs Scrutiny', color: '#6fa2d8' },
  { label: 'IA2 QPs Scrutiny', color: '#6fa2d8' },
  { label: 'Major Project Phase II Review 1', color: '#b8a3dd' },
  { label: 'Major Project Phase II Review 2', color: '#b8a3dd' },
  { label: 'Dropping of the courses', color: '#e08aa8' },
  { label: 'Parents Teachers Meeting', color: '#e08aa8' },
  { label: 'Withdrawal of the courses', color: '#e08aa8' },
  { label: 'Freezing of CIE Marks and Attendance in Contineo Portal', color: '#e0904f' },
]