// Shared helpers for Calendar-of-Events style documents.

export const DAY_KEYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export const EVENT_COLORS = [
  { name: 'Red', hex: '#d9534f' },
  { name: 'Crimson', hex: '#c0392b' },
  { name: 'Coral', hex: '#e0705f' },
  { name: 'Orange', hex: '#e0904f' },
  { name: 'Gold', hex: '#b8860b' },
  { name: 'Tan', hex: '#b39a5f' },
  { name: 'Olive', hex: '#7c9a3f' },
  { name: 'Green', hex: '#4f8a5f' },
  { name: 'Teal', hex: '#3f8f7f' },
  { name: 'Cyan', hex: '#3fa6a6' },
  { name: 'Sky', hex: '#4a90d9' },
  { name: 'Blue', hex: '#6fa2d8' },
  { name: 'Indigo', hex: '#6a5fc0' },
  { name: 'Purple', hex: '#8e5fc0' },
  { name: 'Lavender', hex: '#b8a3dd' },
  { name: 'Magenta', hex: '#c05fa0' },
  { name: 'Pink', hex: '#e08aa8' },
  { name: 'Rose', hex: '#d46a86' },
  { name: 'Brown', hex: '#8a5a3f' },
  { name: 'Slate', hex: '#64748b' },
]

// Soft red used for auto-marked holidays (Sundays, 1st & 3rd Saturdays)
export const HOLIDAY_COLOR = '#f2a6a2'

// Solid red used for fetched government holidays (same tone as the "Red" swatch)
export const GOVT_HOLIDAY_COLOR = '#d9534f'

// A Saturday's "occurrence number" within its month can be derived
// from the date number alone: occurrence = ceil(dateNumber / 7).
function isFirstOrThirdSaturday(dateNum) {
  const n = Number(dateNum)
  if (!n) return false
  const occurrence = Math.ceil(n / 7)
  return occurrence === 1 || occurrence === 3
}

// Automatic Sunday / 1st & 3rd Saturday holiday tint (independent of manual events)
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

// Working days = non-blank days in this row that are NOT an auto-holiday
// (Sunday / 1st & 3rd Saturday) and don't have an event flagged IsHoliday.
export function computeWorkingDays(row, events) {
  let working = 0
  DAY_KEYS.forEach((dayKey) => {
    const dateNum = row[dayKey]
    if (dateNum === '' || dateNum === undefined || dateNum === null) return
    const iso = cellToISODate(row, dayKey)
    const isAutoHoliday = Boolean(getAutoHolidayColor(dayKey, dateNum))
    const isEventHoliday = events.some((ev) => ev.Date === iso && ev.IsHoliday)
    if (!isAutoHoliday && !isEventHoliday) working++
  })
  return working
}

function isNextDay(isoDate, nextIsoDate) {
  const d = new Date(isoDate)
  d.setDate(d.getDate() + 1)
  return d.toISOString().slice(0, 10) === nextIsoDate
}

// Merges consecutive-date events sharing the same Text + Color into one
// logical range, so a multi-day event shows as a single chip.
export function groupEventsIntoRanges(events) {
  const sorted = [...events].sort((a, b) => a.Date.localeCompare(b.Date))
  const groups = []

  sorted.forEach((ev) => {
    const last = groups[groups.length - 1]
    const isConsecutive =
      last && last.Text === ev.Text && last.Color === ev.Color && isNextDay(last.EndDate, ev.Date)

    if (isConsecutive) {
      last.EndDate = ev.Date
    } else {
      groups.push({ Text: ev.Text, Color: ev.Color, StartDate: ev.Date, EndDate: ev.Date })
    }
  })

  return groups.sort((a, b) => a.StartDate.localeCompare(b.StartDate))
}

// "14 Sep: Ganesha Chaturthi" for a single day, "01-04 Sep: PAC Meeting" for a range.
export function formatEventLabel(group) {
  const start = new Date(group.StartDate)
  const end = new Date(group.EndDate)
  const startDay = start.getDate()
  const endDay = end.getDate()
  const monthShort = start.toLocaleString('default', { month: 'short' })

  if (group.StartDate === group.EndDate) {
    return `${startDay} ${monthShort}: ${group.Text}`
  }
  if (start.getMonth() === end.getMonth()) {
    return `${startDay}-${endDay} ${monthShort}: ${group.Text}`
  }
  const endMonthShort = end.toLocaleString('default', { month: 'short' })
  return `${startDay} ${monthShort} - ${endDay} ${endMonthShort}: ${group.Text}`
}

// Common events that repeat every semester, with a suggested color each.
export const COMMON_EVENTS = [
  { label: 'Commencement of Semester Classes', color: '#4f8a5f' },
  { label: 'Last Working Day of Semester Classes', color: '#4f8a5f' },
  { label: 'Announcement of Continuous Comprehensive Assessment (CCA) - CCA1 and CCA2', color: '#6fa2d8' },
  { label: 'Evaluation of CCA1', color: '#3f8f7f' },
  { label: 'Evaluation of CCA2', color: '#3f8f7f' },
  { label: 'Finalization of CCA1', color: '#3fa6a6' },
  { label: 'Finalization of CCA2', color: '#3fa6a6' },
  { label: 'Faculty Feedback-1 by Students', color: '#b39a5f' },
  { label: 'Faculty Feedback-2 by Students', color: '#b39a5f' },
  { label: 'Internal Assessment 1', color: '#d9534f' },
  { label: 'Internal Assessment 2', color: '#d9534f' },
  { label: 'Last Date to enter IA1 Marks in Contineo Portal', color: '#e0904f' },
  { label: 'Last Date to enter IA2 Marks in Contineo Portal', color: '#e0904f' },
  { label: 'IA1 QPs Scrutiny', color: '#4a90d9' },
  { label: 'IA2 QPs Scrutiny', color: '#4a90d9' },
  { label: 'Major Project Phase II Review 1', color: '#8e5fc0' },
  { label: 'Major Project Phase II Review 2', color: '#8e5fc0' },
  { label: 'Dropping of the courses', color: '#e08aa8' },
  { label: 'Parents Teachers Meeting', color: '#c05fa0' },
  { label: 'Withdrawal of the courses', color: '#d46a86' },
  { label: 'Freezing of CIE Marks and Attendance in Contineo Portal', color: '#8a5a3f' },
]