import { useState } from 'react'
import {
  DAY_KEYS,
  EVENT_COLORS,
  COMMON_EVENTS,
  GOVT_HOLIDAY_COLOR,
  getAutoHolidayColor,
  cellToISODate,
  datesInRange,
  groupEventsIntoRanges,
  formatEventLabel,
} from '../utils/coeUtils'
import { API_URL } from '../config'  
const emptyHeader = {
  Title: '',
  Semester: '',
  AcademicYear: '',
  Term: '',
  StartDate: '',
  EndDate: '',
  Vision: 'To emerge as one of the finest technical institutions of higher learning, to develop engineering professionals who are technically competent, ethical and environment friendly for betterment of the society.',
  Mission: 'Accomplish stimulating learning environment through high quality academic instruction, innovation and industry-institute interface.',
  Signatories: ['COE-Coordinator', 'Controller of Examinations', 'Dean Academics', 'Principal'],
}

// Builds one grid row limited to a single month's days within a 7-day
// Sun-Sat window (other days blank). Used to split weeks that cross a
// month boundary into two rows sharing the same Week label.
function buildWeekRow(weekDates, weekLabel, monthIndex) {
  const sampleDate = weekDates.find((d) => d.getMonth() === monthIndex)
  const dayVals = weekDates.map((d) => (d.getMonth() === monthIndex ? d.getDate() : ''))
  return {
    Month: sampleDate.toLocaleString('default', { month: 'long' }).toUpperCase(),
    Year: sampleDate.getFullYear(),
    Week: weekLabel,
    Sun: dayVals[0],
    Mon: dayVals[1],
    Tue: dayVals[2],
    Wed: dayVals[3],
    Thu: dayVals[4],
    Fri: dayVals[5],
    Sat: dayVals[6],
    WorkingDays: '',
  }
}

function COEEntry() {
  const [docs, setDocs] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [loadingDoc, setLoadingDoc] = useState(false)

  const [header, setHeader] = useState(emptyHeader)
  const [entries, setEntries] = useState([]) // grid rows (no embedded events anymore)
  const [events, setEvents] = useState([]) // flat, date-keyed: [{ Text, Color, Date }]

  // Single-date popup (click a date number)
  const [datePopup, setDatePopup] = useState(null) // { date: 'YYYY-MM-DD', label } | null
  const [newEventText, setNewEventText] = useState('')
  const [newEventColor, setNewEventColor] = useState(EVENT_COLORS[0].hex)

  // Range event form (per-row "+ Add General Event")
  const [rangeEventFor, setRangeEventFor] = useState(null) // rowIndex | null
  const [rangeFrom, setRangeFrom] = useState('')
  const [rangeTo, setRangeTo] = useState('')

  // Common/preset semester event picker
  const [commonLabel, setCommonLabel] = useState(COMMON_EVENTS[0].label)
  const [commonDate, setCommonDate] = useState('')
  const [commonColor, setCommonColor] = useState(COMMON_EVENTS[0].color)

  const [fetchingHolidays, setFetchingHolidays] = useState(false)

  const loadDocList = () => {
    fetch(`${API_URL}/api/coe`)
      .then((res) => res.json())
      .then(setDocs)
      .catch(() => setDocs([]))
  }

  useState(() => {
    loadDocList()
  })

  const loadSelectedDoc = (id) => {
    if (!id) {
      setHeader(emptyHeader)
      setEntries([])
      setEvents([])
      return
    }
    setLoadingDoc(true)
    fetch(`${API_URL}/api/coe/${id}`)
      .then((res) => res.json())
      .then((doc) => {
        setHeader({
          Title: doc.Title || '',
          Semester: doc.Semester || '',
          AcademicYear: doc.AcademicYear || '',
          Term: doc.Term || '',
          StartDate: doc.StartDate || '',
          EndDate: doc.EndDate || '',
          Vision: doc.Vision || '',
          Mission: doc.Mission || '',
          Signatories:
            doc.Signatories && doc.Signatories.length ? doc.Signatories : emptyHeader.Signatories,
        })
        setEntries(doc.Entries || [])
        setEvents(doc.Events || [])
      })
      .catch(() => alert('Failed to load selected calendar'))
      .finally(() => setLoadingDoc(false))
  }

  const handleSelectDoc = (id) => {
    setSelectedId(id)
    loadSelectedDoc(id)
  }

  const handleHeaderChange = (e) => {
    const { name, value } = e.target
    setHeader((prev) => ({ ...prev, [name]: value }))
  }

  const handleSignatoryChange = (index, value) => {
    setHeader((prev) => ({
      ...prev,
      Signatories: prev.Signatories.map((s, i) => (i === index ? value : s)),
    }))
  }

  // Generates week rows Sun-Sat between StartDate and EndDate.
  // A week that crosses a month boundary is split into two rows
  // (same Week label, each showing only that month's days).
  const generateWeeks = () => {
    if (!header.StartDate || !header.EndDate) {
      alert('Please select Start Date and End Date first')
      return
    }

    const start = new Date(header.StartDate)
    const end = new Date(header.EndDate)
    const firstSunday = new Date(start)
    firstSunday.setDate(start.getDate() - start.getDay())

    const generated = []
    let current = new Date(firstSunday)
    let weekIndex = 0

    while (current <= end) {
      const weekDates = []
      for (let i = 0; i < 7; i++) {
        const d = new Date(current)
        d.setDate(current.getDate() + i)
        weekDates.push(d)
      }

      const weekLabel = `W-${String(weekIndex).padStart(2, '0')}`
      const monthsInWeek = [...new Set(weekDates.map((d) => d.getMonth()))]
      monthsInWeek.forEach((m) => generated.push(buildWeekRow(weekDates, weekLabel, m)))

      current.setDate(current.getDate() + 7)
      weekIndex++
    }

    setEntries(generated)
  }

  const handleEntryChange = (index, field, value) => {
    setEntries((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    )
  }

  const addEvents = (newOnes) => {
    setEvents((prev) => [...prev, ...newOnes])
  }

  const removeEventAt = (globalIndex) => {
    setEvents((prev) => prev.filter((_, i) => i !== globalIndex))
  }

  // Removes every date belonging to a merged range/group in one go, since
  // it's now shown (and should be removable) as a single logical event.
  const removeEventGroup = (group) => {
    setEvents((prev) =>
      prev.filter(
        (ev) =>
          !(ev.Text === group.Text && ev.Color === group.Color && ev.Date >= group.StartDate && ev.Date <= group.EndDate)
      )
    )
  }

  // --- Single date-number click popup ---
  const openDatePopup = (row, dayKey) => {
    const iso = cellToISODate(row, dayKey)
    if (!iso) return // blank cell (belongs to the other month in a split week)
    setDatePopup({ date: iso, label: `${row[dayKey]} ${row.Month} (${dayKey})` })
    setNewEventText('')
    setNewEventColor(EVENT_COLORS[0].hex)
  }

  const confirmSingleDateEvent = () => {
    if (!newEventText.trim() || !datePopup) return
    addEvents([{ Text: newEventText.trim(), Color: newEventColor, Date: datePopup.date }])
    setDatePopup(null)
  }

  // --- Range event (Add General Event) ---
  const openRangeForm = (rowIndex) => {
    setRangeEventFor(rowIndex)
    setRangeFrom('')
    setRangeTo('')
    setNewEventText('')
    setNewEventColor(EVENT_COLORS[0].hex)
  }

  const confirmRangeEvent = () => {
    if (!newEventText.trim() || !rangeFrom || !rangeTo || rangeFrom > rangeTo) {
      alert('Please enter event text and a valid From/To date range')
      return
    }
    const dates = datesInRange(rangeFrom, rangeTo)
    addEvents(dates.map((d) => ({ Text: newEventText.trim(), Color: newEventColor, Date: d })))
    setRangeEventFor(null)
  }

  // --- Common/preset semester events ---
  const handleCommonLabelChange = (label) => {
    setCommonLabel(label)
    const preset = COMMON_EVENTS.find((c) => c.label === label)
    if (preset) setCommonColor(preset.color)
  }

  const addCommonEvent = () => {
    if (!commonDate) {
      alert('Pick a date for this event first')
      return
    }
    addEvents([{ Text: commonLabel, Color: commonColor, Date: commonDate }])
    setCommonDate('')
  }

  // --- Government holidays ---
  const fetchGovtHolidays = async () => {
    if (!header.StartDate || !header.EndDate) {
      alert('Please set Start Date and End Date first')
      return
    }
    const startYear = new Date(header.StartDate).getFullYear()
    const endYear = new Date(header.EndDate).getFullYear()
    const years = []
    for (let y = startYear; y <= endYear; y++) years.push(y)

    setFetchingHolidays(true)
    try {
      const results = await Promise.all(
        years.map((y) =>
          fetch(`https://date.nager.at/api/v3/PublicHolidays/${y}/IN`).then((r) => (r.ok ? r.json() : []))
        )
      )
      const holidays = results.flat().filter((h) => h.date >= header.StartDate && h.date <= header.EndDate)

      if (holidays.length === 0) {
        alert('No government holidays found in this date range')
        return
      }

      setEvents((prev) => {
        const existingKeys = new Set(prev.map((e) => `${e.Date}|${e.Text}`))
        const additions = holidays
          .filter((h) => !existingKeys.has(`${h.date}|${h.localName}`))
          .map((h) => ({ Text: h.localName, Color: GOVT_HOLIDAY_COLOR, Date: h.date }))
        return [...prev, ...additions]
      })
    } catch (err) {
      alert('Failed to fetch government holidays. Check your internet connection.')
    } finally {
      setFetchingHolidays(false)
    }
  }

  const handleSaveDocument = async () => {
    const isUpdate = Boolean(selectedId)
    const url = isUpdate ? `${API_URL}/api/coe/${selectedId}` : `${API_URL}/api/coe`
    const method = isUpdate ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...header, Entries: entries, Events: events }),
    })
    const data = await res.json()

    if (!res.ok) {
      alert(data.error || 'Failed to save')
      return
    }

    alert(isUpdate ? 'Calendar of Events updated!' : 'Calendar of Events saved!')
    loadDocList()
    if (!isUpdate) setSelectedId(data._id)
  }

  return (
    <div className="w-full font-mono">
      <div className="mb-4 flex items-center gap-3">
        <label className="text-sm font-medium">Select the Calendar:</label>
        <select
          value={selectedId}
          onChange={(e) => handleSelectDoc(e.target.value)}
          className="border px-2 py-1 rounded"
        >
          <option value="">+ New Calendar of Events</option>
          {docs.map((d) => (
            <option key={d._id} value={d._id}>
              {d.Title || 'Untitled'} ({d.Semester}, {d.AcademicYear} {d.Term})
            </option>
          ))}
        </select>
      </div>

      {loadingDoc && <p className="text-sm text-slate-500 mb-4">Loading calendar...</p>}

      {!selectedId && (
        <div className="border rounded-lg p-4 bg-white shadow-sm space-y-4 mb-6">
          <h3 className="text-lg font-semibold border-b pb-2">Document Header</h3>

          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              name="Title"
              value={header.Title}
              onChange={handleHeaderChange}
              placeholder="e.g. Tentative Calendar of Events (CoE) of B.E. III Semester 2026-27 (ODD)"
              className="border px-2 py-1 rounded w-full"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Semester</label>
              <input
                type="text"
                name="Semester"
                value={header.Semester}
                onChange={handleHeaderChange}
                className="border px-2 py-1 rounded w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Academic Year</label>
              <input
                type="text"
                name="AcademicYear"
                value={header.AcademicYear}
                onChange={handleHeaderChange}
                placeholder="2026-27"
                className="border px-2 py-1 rounded w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Term</label>
              <select
                name="Term"
                value={header.Term}
                onChange={handleHeaderChange}
                className="border px-2 py-1 rounded w-full"
              >
                <option value="">-- Select --</option>
                <option value="ODD">ODD</option>
                <option value="EVEN">EVEN</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <input
                type="date"
                name="StartDate"
                value={header.StartDate}
                onChange={handleHeaderChange}
                className="border px-2 py-1 rounded w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Date</label>
              <input
                type="date"
                name="EndDate"
                value={header.EndDate}
                onChange={handleHeaderChange}
                className="border px-2 py-1 rounded w-full"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Vision</label>
            <textarea
              name="Vision"
              value={header.Vision}
              onChange={handleHeaderChange}
              rows={2}
              className="border px-2 py-1 rounded w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Mission</label>
            <textarea
              name="Mission"
              value={header.Mission}
              onChange={handleHeaderChange}
              rows={2}
              className="border px-2 py-1 rounded w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Signatories (footer, left to right)</label>
            <div className="grid grid-cols-4 gap-2">
              {header.Signatories.map((s, i) => (
                <input
                  key={i}
                  type="text"
                  value={s}
                  onChange={(e) => handleSignatoryChange(i, e.target.value)}
                  className="border px-2 py-1 rounded w-full text-sm"
                />
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={generateWeeks}
              className="bg-slate-700 text-white px-4 py-2 rounded hover:bg-slate-800"
            >
              Generate Weeks
            </button>
            <button
              onClick={fetchGovtHolidays}
              disabled={fetchingHolidays}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
            >
              {fetchingHolidays ? 'Fetching Holidays...' : 'Fetch Government Holidays'}
            </button>
          </div>
        </div>
      )}

      {selectedId && !loadingDoc && header.Title && (
        <div className="border rounded-lg p-4 bg-white shadow-sm mb-6 text-sm flex items-center justify-between">
          <div>
            <p className="font-semibold text-base mb-1">{header.Title}</p>
            <p className="text-slate-600">
              {header.Semester} &nbsp;|&nbsp; {header.AcademicYear} &nbsp;|&nbsp; {header.Term}
            </p>
          </div>
          <button
            onClick={fetchGovtHolidays}
            disabled={fetchingHolidays}
            className="bg-red-600 text-white px-3 py-1.5 rounded hover:bg-red-700 disabled:opacity-50 text-xs"
          >
            {fetchingHolidays ? 'Fetching...' : 'Fetch Government Holidays'}
          </button>
        </div>
      )}

      {/* Common semester events — usable any time, even before weeks are generated */}
      <div className="border rounded-lg p-4 bg-white shadow-sm mb-6">
        <h3 className="text-sm font-semibold mb-2">Add Common Semester Event</h3>
        <div className="flex flex-wrap items-end gap-2">
          <div>
            <label className="block text-xs text-slate-500 mb-1">Event</label>
            <select
              value={commonLabel}
              onChange={(e) => handleCommonLabelChange(e.target.value)}
              className="border px-2 py-1 rounded text-sm max-w-xs"
            >
              {COMMON_EVENTS.map((c) => (
                <option key={c.label} value={c.label}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Date</label>
            <input
              type="date"
              value={commonDate}
              onChange={(e) => setCommonDate(e.target.value)}
              className="border px-2 py-1 rounded text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Color</label>
            <div className="flex gap-1">
              {EVENT_COLORS.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  title={c.name}
                  onClick={() => setCommonColor(c.hex)}
                  style={{ backgroundColor: c.hex }}
                  className={`w-5 h-5 rounded-full border-2 ${
                    commonColor === c.hex ? 'border-black' : 'border-transparent'
                  }`}
                />
              ))}
            </div>
          </div>
          <button
            onClick={addCommonEvent}
            className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700"
          >
            Add Event
          </button>
        </div>

        {events.length > 0 && (
          <div className="mt-3 pt-3 border-t">
            <p className="text-xs text-slate-500 mb-1">All events added so far ({events.length}):</p>
            <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
              {events.map((ev, ei) => (
                <span
                  key={ei}
                  style={{ backgroundColor: ev.Color }}
                  className="text-white text-xs px-2 py-1 rounded flex items-center gap-1"
                >
                  {ev.Date}: {ev.Text}
                  <button
                    onClick={() => removeEventAt(ei)}
                    className="ml-1 font-bold leading-none"
                    title="Remove event"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {entries.length > 0 && (
        <div className="overflow-x-auto">
          <p className="text-xs text-slate-500 mb-2">
            Click any date number to add an event for that date. Sundays and the 1st/3rd Saturdays of
            each month are auto-marked as holidays.
          </p>

          <table className="w-full border-collapse bg-white shadow-sm text-sm">
            <thead>
              <tr className="bg-slate-800 text-white">
                <th className="border px-2 py-1">Month</th>
                <th className="border px-2 py-1">Week</th>
                {DAY_KEYS.map((d) => (
                  <th key={d} className="border px-2 py-1">{d}</th>
                ))}
                <th className="border px-2 py-1">Working Days</th>
                <th className="border px-2 py-1 w-72">Events</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                const eventGroups = groupEventsIntoRanges(events)
                return entries.map((row, index) => {
                const rowDates = new Set(DAY_KEYS.map((k) => cellToISODate(row, k)).filter(Boolean))
                // Show each event/range once, on the row containing its start date
                const rowEventGroups = eventGroups.filter((g) => rowDates.has(g.StartDate))

                return (
                  <tr key={index}>
                    <td className="border px-2 py-1">{row.Month}</td>
                    <td className="border px-2 py-1">{row.Week}</td>

                    {DAY_KEYS.map((dayKey) => {
                      const iso = cellToISODate(row, dayKey)
                      const dayEvent = events.find((ev) => ev.Date === iso)
                      const cellColor = dayEvent ? dayEvent.Color : getAutoHolidayColor(dayKey, row[dayKey])
                      const isBlank = row[dayKey] === ''
                      return (
                        <td key={dayKey} className="border p-0 text-center">
                          <button
                            type="button"
                            disabled={isBlank}
                            onClick={() => openDatePopup(row, dayKey)}
                            style={{ backgroundColor: cellColor || 'transparent' }}
                            className={`w-full h-full px-2 py-1 ${cellColor ? 'text-white font-semibold' : ''} ${
                              isBlank ? 'cursor-default' : ''
                            }`}
                            title={isBlank ? '' : 'Click to add an event for this date'}
                          >
                            {row[dayKey]}
                          </button>
                        </td>
                      )
                    })}

                    <td className="border px-2 py-1">
                      <input
                        type="text"
                        value={row.WorkingDays}
                        onChange={(e) => handleEntryChange(index, 'WorkingDays', e.target.value)}
                        className="w-12 border-0 focus:outline-none"
                      />
                    </td>

                    <td className="border px-2 py-1 align-top">
                      <div className="flex flex-wrap gap-1 mb-1">
                        {rowEventGroups.map((g, gi) => (
                          <span
                            key={gi}
                            style={{ backgroundColor: g.Color }}
                            className="text-white text-xs px-2 py-1 rounded flex items-center gap-1"
                          >
                            {formatEventLabel(g)}
                            <button
                              onClick={() => removeEventGroup(g)}
                              className="ml-1 font-bold leading-none"
                              title="Remove event"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>

                      {rangeEventFor === index ? (
                        <div className="flex flex-col gap-1 border p-2 rounded bg-slate-50 w-64">
                          <div className="flex gap-1">
                            <div className="flex-1">
                              <label className="block text-[10px] text-slate-500">From</label>
                              <input
                                type="date"
                                value={rangeFrom}
                                onChange={(e) => setRangeFrom(e.target.value)}
                                className="border px-1 py-0.5 rounded text-xs w-full"
                              />
                            </div>
                            <div className="flex-1">
                              <label className="block text-[10px] text-slate-500">To</label>
                              <input
                                type="date"
                                value={rangeTo}
                                onChange={(e) => setRangeTo(e.target.value)}
                                className="border px-1 py-0.5 rounded text-xs w-full"
                              />
                            </div>
                          </div>
                          <input
                            type="text"
                            value={newEventText}
                            onChange={(e) => setNewEventText(e.target.value)}
                            placeholder="Event text (e.g. PAC Meeting)"
                            className="border px-2 py-1 rounded text-xs"
                            autoFocus
                          />
                          <div className="flex gap-1 flex-wrap">
                            {EVENT_COLORS.map((c) => (
                              <button
                                key={c.hex}
                                type="button"
                                title={c.name}
                                onClick={() => setNewEventColor(c.hex)}
                                style={{ backgroundColor: c.hex }}
                                className={`w-5 h-5 rounded-full border-2 ${
                                  newEventColor === c.hex ? 'border-black' : 'border-transparent'
                                }`}
                              />
                            ))}
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={confirmRangeEvent}
                              className="bg-blue-600 text-white px-2 py-0.5 rounded text-xs"
                            >
                              Add
                            </button>
                            <button
                              onClick={() => setRangeEventFor(null)}
                              className="px-2 py-0.5 rounded text-xs border"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => openRangeForm(index)}
                          className="text-xs text-blue-600 underline"
                        >
                          + Add General Event
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })
              })()}
            </tbody>
          </table>

          <button
            onClick={handleSaveDocument}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {selectedId ? 'Update Document' : 'Save Document'}
          </button>
        </div>
      )}

      {/* Single date-number click popup */}
      {datePopup && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={() => setDatePopup(null)}
        >
          <div className="bg-white rounded-lg shadow-lg p-4 w-80" onClick={(e) => e.stopPropagation()}>
            <h4 className="text-sm font-semibold mb-2">Add Event — {datePopup.label}</h4>
            <input
              type="text"
              value={newEventText}
              onChange={(e) => setNewEventText(e.target.value)}
              placeholder="Event text (e.g. Gandhi Jayanti)"
              className="border px-2 py-1 rounded text-sm w-full mb-2"
              autoFocus
            />
            <div className="flex gap-1 flex-wrap mb-3">
              {EVENT_COLORS.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  title={c.name}
                  onClick={() => setNewEventColor(c.hex)}
                  style={{ backgroundColor: c.hex }}
                  className={`w-6 h-6 rounded-full border-2 ${
                    newEventColor === c.hex ? 'border-black' : 'border-transparent'
                  }`}
                />
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDatePopup(null)} className="px-3 py-1 rounded text-sm border">
                Cancel
              </button>
              <button
                onClick={confirmSingleDateEvent}
                className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
              >
                Add
              </button>
            </div>

            {(() => {
              const dayEvents = events.map((ev, ei) => ({ ...ev, ei })).filter((ev) => ev.Date === datePopup.date)
              if (dayEvents.length === 0) return null
              return (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs text-slate-500 mb-1">Existing events for this date:</p>
                  <div className="flex flex-wrap gap-1">
                    {dayEvents.map((ev) => (
                      <span
                        key={ev.ei}
                        style={{ backgroundColor: ev.Color }}
                        className="text-white text-xs px-2 py-1 rounded flex items-center gap-1"
                      >
                        {ev.Text}
                        <button
                          onClick={() => removeEventAt(ev.ei)}
                          className="ml-1 font-bold leading-none"
                          title="Remove event"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )
            })()}
          </div>
        </div>
      )}
    </div>
  )
}

export default COEEntry