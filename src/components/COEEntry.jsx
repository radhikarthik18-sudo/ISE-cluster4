import { useEffect, useState } from 'react'
import { DAY_KEYS, EVENT_COLORS, getAutoHolidayColor } from '../utils/coeUtils'
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

function COEEntry() {
  const [docs, setDocs] = useState([])
  const [selectedId, setSelectedId] = useState('') // '' = New Calendar of Events
  const [loadingDoc, setLoadingDoc] = useState(false)

  const [header, setHeader] = useState(emptyHeader)
  const [entries, setEntries] = useState([])

  const [eventPopover, setEventPopover] = useState(null)
  const [newEventText, setNewEventText] = useState('')
  const [newEventColor, setNewEventColor] = useState(EVENT_COLORS[0].hex)

  const loadDocList = () => {
    fetch(`${API_URL}/api/coe`)
      .then((res) => res.json())
      .then(setDocs)
      .catch(() => setDocs([]))
  }

  useEffect(() => {
    loadDocList()
  }, [])

  // Switching the dropdown either resets to a blank "new" form
  // or loads the full saved document (header + weeks + events) for editing.
  useEffect(() => {
    if (!selectedId) {
      setHeader(emptyHeader)
      setEntries([])
      return
    }
    setLoadingDoc(true)
    fetch(`${API_URL}/api/coe/${selectedId}`)
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
      })
      .catch(() => alert('Failed to load selected calendar'))
      .finally(() => setLoadingDoc(false))
  }, [selectedId])

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

  // Generates one row per week (Sun–Sat) between StartDate and EndDate — only used for a brand-new calendar
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

      generated.push({
        Month: weekDates[0].toLocaleString('default', { month: 'long' }).toUpperCase(),
        Week: `W-${String(weekIndex).padStart(2, '0')}`,
        Sun: weekDates[0].getDate(),
        Mon: weekDates[1].getDate(),
        Tue: weekDates[2].getDate(),
        Wed: weekDates[3].getDate(),
        Thu: weekDates[4].getDate(),
        Fri: weekDates[5].getDate(),
        Sat: weekDates[6].getDate(),
        WorkingDays: '',
        Events: [],
      })

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

  const openEventPopover = (rowIndex, day) => {
    setEventPopover({ rowIndex, day })
    setNewEventText('')
    setNewEventColor(EVENT_COLORS[0].hex)
  }

  const confirmAddEvent = () => {
    if (!newEventText.trim() || !eventPopover) return
    const { rowIndex, day } = eventPopover
    setEntries((prev) =>
      prev.map((row, i) =>
        i === rowIndex
          ? {
              ...row,
              Events: [...row.Events, { Text: newEventText.trim(), Color: newEventColor, Day: day || null }],
            }
          : row
      )
    )
    setEventPopover(null)
  }

  const removeEvent = (rowIndex, eventIndex) => {
    setEntries((prev) =>
      prev.map((row, i) =>
        i === rowIndex
          ? { ...row, Events: row.Events.filter((_, ei) => ei !== eventIndex) }
          : row
      )
    )
  }

  const handleSaveDocument = async () => {
    const isUpdate = Boolean(selectedId)
    const url = isUpdate ? `${API_URL}/api/coe/${selectedId}` : `${API_URL}/api/coe`
    const method = isUpdate ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...header, Entries: entries }),
    })
    const data = await res.json()

    if (!res.ok) {
      alert(data.error || 'Failed to save')
      return
    }

    alert(isUpdate ? 'Calendar of Events updated!' : 'Calendar of Events saved!')
    loadDocList()
    if (!isUpdate) {
      setSelectedId(data._id) // future saves in this session now update this same document
    }
  }

  return (
    <div className="w-full font-mono">
      <div className="mb-4 flex items-center gap-3">
        <label className="text-sm font-medium">Select the Calendar:</label>
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
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

      {/* New calendar: full header form */}
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

          <button
            onClick={generateWeeks}
            className="bg-slate-700 text-white px-4 py-2 rounded hover:bg-slate-800"
          >
            Generate Weeks
          </button>
        </div>
      )}

      {/* Existing calendar: compact read-only summary, no re-entry needed */}
      {selectedId && !loadingDoc && header.Title && (
        <div className="border rounded-lg p-4 bg-white shadow-sm mb-6 text-sm">
          <p className="font-semibold text-base mb-1">{header.Title}</p>
          <p className="text-slate-600">
            {header.Semester} &nbsp;|&nbsp; {header.AcademicYear} &nbsp;|&nbsp; {header.Term}
          </p>
        </div>
      )}

      {entries.length > 0 && (
        <div className="overflow-x-auto">
          <p className="text-xs text-slate-500 mb-2">
            Tip: click any date number below to add an event for that specific date. Sundays and the
            1st/3rd Saturdays of each month are auto-marked as holidays.
          </p>

          {eventPopover && (
            <div className="mb-3 border rounded-lg p-3 bg-slate-50 shadow-sm max-w-sm">
              <p className="text-xs font-medium mb-2">
                {eventPopover.day
                  ? `Add event for ${entries[eventPopover.rowIndex][eventPopover.day]} ${entries[eventPopover.rowIndex].Month} (${eventPopover.day})`
                  : `Add general event for ${entries[eventPopover.rowIndex].Week}`}
              </p>
              <input
                type="text"
                value={newEventText}
                onChange={(e) => setNewEventText(e.target.value)}
                placeholder="Event text (e.g. Gandhi Jayanti)"
                className="border px-2 py-1 rounded text-xs w-full mb-2"
                autoFocus
              />
              <div className="flex gap-1 flex-wrap mb-2">
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
                <button onClick={confirmAddEvent} className="bg-blue-600 text-white px-2 py-0.5 rounded text-xs">
                  Add
                </button>
                <button onClick={() => setEventPopover(null)} className="px-2 py-0.5 rounded text-xs border">
                  Cancel
                </button>
              </div>
            </div>
          )}

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
              {entries.map((row, index) => (
                <tr key={index}>
                  <td className="border px-2 py-1">{row.Month}</td>
                  <td className="border px-2 py-1">{row.Week}</td>

                  {DAY_KEYS.map((dayKey) => {
                    const dayEvent = row.Events.find((ev) => ev.Day === dayKey)
                    const cellColor = dayEvent ? dayEvent.Color : getAutoHolidayColor(dayKey, row[dayKey])
                    return (
                      <td key={dayKey} className="border p-0 text-center">
                        <button
                          type="button"
                          onClick={() => openEventPopover(index, dayKey)}
                          style={{ backgroundColor: cellColor || 'transparent' }}
                          className={`w-full h-full px-2 py-1 ${cellColor ? 'text-white font-semibold' : ''}`}
                          title="Click to add an event for this date"
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
                      {row.Events.map((ev, ei) => (
                        <span
                          key={ei}
                          style={{ backgroundColor: ev.Color }}
                          className="text-white text-xs px-2 py-1 rounded flex items-center gap-1"
                        >
                          {ev.Day ? `${ev.Day}: ` : ''}
                          {ev.Text}
                          <button
                            onClick={() => removeEvent(index, ei)}
                            className="ml-1 font-bold leading-none"
                            title="Remove event"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={() => openEventPopover(index, null)}
                      className="text-xs text-blue-600 underline"
                    >
                      + Add General Event
                    </button>
                  </td>
                </tr>
              ))}
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
    </div>
  )
}

export default COEEntry