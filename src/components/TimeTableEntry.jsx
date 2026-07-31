import { useState, useEffect } from 'react'
import { API_URL } from '../config'
import { DAYS, PERIOD_SLOTS, SECTIONS } from '../utils/timetableConstants'

function normalizeSlots(rawSlots) {
  return (rawSlots || []).map((s) => {
    if (s.Items) return s
    const { Day, PeriodIndex, CourseCode, CourseTitle, FacultyID, FacultyName, ManualText } = s
    const item = ManualText
      ? { ManualText }
      : { CourseCode, CourseTitle, FacultyID, FacultyName }
    return { Day, PeriodIndex, Items: [item] }
  })
}

const emptyHeaderMeta = {
  ClassSemester: '',
  RoomNumber: '',
  ClassTeacherName: '',
  WEF: '',
  AcademicYear: '',
  Term: '',
}

function TimeTableEntry() {
  const [section, setSection] = useState('')
  const [sectionCourses, setSectionCourses] = useState([])
  const [slots, setSlots] = useState([])
  const [headerMeta, setHeaderMeta] = useState(emptyHeaderMeta)

  const authHeaders = { 'Authorization': `Bearer ${localStorage.getItem('token')}` }

  useEffect(() => {
    if (!section) {
      setSectionCourses([])
      setSlots([])
      setHeaderMeta(emptyHeaderMeta)
      return
    }

    fetch(`${API_URL}/api/course-faculty-map`, { headers: authHeaders })
      .then((res) => res.json())
      .then((allMappings) => {
        const filtered = allMappings.filter((m) => m.Section === section)
        setSectionCourses(filtered)
      })

    fetch(`${API_URL}/api/timetable/by-section/${section}`, { headers: authHeaders })
      .then((res) => res.json())
      .then((data) => {
        setSlots(normalizeSlots(data?.Slots))
        setHeaderMeta({
          ClassSemester: data?.ClassSemester || '',
          RoomNumber: data?.RoomNumber || '',
          ClassTeacherName: data?.ClassTeacherName || '',
          WEF: data?.WEF || '',
          AcademicYear: data?.AcademicYear || '',
          Term: data?.Term || '',
        })
      })
  }, [section])

  const handleHeaderMetaChange = (e) => {
    const { name, value } = e.target
    setHeaderMeta((prev) => ({ ...prev, [name]: value }))
  }

  const getSlot = (day, periodIndex) =>
    slots.find((s) => s.Day === day && s.PeriodIndex === periodIndex)

  const addItemToSlot = (day, periodIndex, item) => {
    setSlots((prev) => {
      const existing = prev.find((s) => s.Day === day && s.PeriodIndex === periodIndex)
      if (existing) {
        return prev.map((s) =>
          s === existing ? { ...s, Items: [...s.Items, item] } : s
        )
      }
      return [...prev, { Day: day, PeriodIndex: periodIndex, Items: [item] }]
    })
  }

  const removeItemFromSlot = (day, periodIndex, itemIndex) => {
    setSlots((prev) =>
      prev
        .map((s) => {
          if (s.Day !== day || s.PeriodIndex !== periodIndex) return s
          return { ...s, Items: s.Items.filter((_, i) => i !== itemIndex) }
        })
        .filter((s) => s.Items.length > 0)
    )
  }

  const handleAddChange = (day, periodIndex, e) => {
    const value = e.target.value
    if (!value) return

    if (value === '__manual__') {
      const text = window.prompt('Enter event/activity name:')
      if (text) addItemToSlot(day, periodIndex, { ManualText: text })
    } else {
      const mapping = sectionCourses.find((m) => m.CourseCode === value)
      addItemToSlot(day, periodIndex, {
        CourseCode: mapping.CourseCode,
        CourseTitle: mapping.CourseTitle,
        Initial: mapping.Initial,
        FacultyID: mapping.FacultyID,
        FacultyName: mapping.FacultyName,
      })
    }
    e.target.value = ''
  }

  const handleSave = async () => {
    if (!section) {
      alert('Please select a Section')
      return
    }
    const res = await fetch(`${API_URL}/api/timetable`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
      body: JSON.stringify({ Section: section, Slots: slots, ...headerMeta }),
    })
    const data = await res.json()
    if (!res.ok) {
      alert(data.error || 'Failed to save timetable')
      return
    }
    alert('Timetable saved!')
  }

  return (
    <div className="w-full font-mono">
      <div className="mb-6">
        <label className="field-label">Section</label>
        <select
          value={section}
          onChange={(e) => setSection(e.target.value)}
          className="field-input max-w-xs"
        >
          <option value="">-- Select --</option>
          {SECTIONS.map((sec) => (
            <option key={sec} value={sec}>{sec}</option>
          ))}
        </select>
      </div>

      {section && (
        <div className="border rounded-lg p-4 bg-white shadow-sm mb-6">
          <h3 className="text-sm font-semibold mb-3">Timetable Header Details <span className="text-xs text-slate-400 font-normal">(for the printed TT View — optional)</span></h3>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Class (e.g. VII)</label>
              <input type="text" name="ClassSemester" value={headerMeta.ClassSemester} onChange={handleHeaderMetaChange} className="border px-2 py-1 rounded w-full text-sm" />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Room</label>
              <input type="text" name="RoomNumber" value={headerMeta.RoomNumber} onChange={handleHeaderMetaChange} className="border px-2 py-1 rounded w-full text-sm" />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Class Teacher</label>
              <input type="text" name="ClassTeacherName" value={headerMeta.ClassTeacherName} onChange={handleHeaderMetaChange} className="border px-2 py-1 rounded w-full text-sm" />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">WEF</label>
              <input type="date" name="WEF" value={headerMeta.WEF} onChange={handleHeaderMetaChange} className="border px-2 py-1 rounded w-full text-sm" />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Academic Year</label>
              <input type="text" name="AcademicYear" value={headerMeta.AcademicYear} onChange={handleHeaderMetaChange} placeholder="2026-27" className="border px-2 py-1 rounded w-full text-sm" />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Term</label>
              <select name="Term" value={headerMeta.Term} onChange={handleHeaderMetaChange} className="border px-2 py-1 rounded w-full text-sm">
                <option value="">-- Select --</option>
                <option value="ODD">ODD</option>
                <option value="EVEN">EVEN</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {section && sectionCourses.length === 0 && (
        <p className="text-sm text-slate-500">
          No courses allocated to this section yet. Please complete Course-Faculty Map first.
        </p>
      )}

      {section && sectionCourses.length > 0 && (
        <div className="overflow-x-auto">
          <p className="text-xs text-slate-500 mb-2">
            A slot can hold more than one subject (e.g. parallel lab batches or electives) — use "+ Add subject" inside a cell to add more.
          </p>
          <table className="border-collapse text-xs w-full">
            <thead>
              <tr className="bg-slate-800 text-white">
                <th className="border px-2 py-2 w-24">Day</th>
                {PERIOD_SLOTS.map((period, idx) => (
                  <th key={idx} className="border px-2 py-2">
                    {period.label}
                    {period.type === 'break' && (
                      <div className="text-[10px] font-normal text-slate-300">{period.name}</div>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DAYS.map((day) => (
                <tr key={day}>
                  <td className="border px-2 py-2 font-semibold bg-slate-50">{day}</td>

                  {PERIOD_SLOTS.map((period, periodIndex) => {
                    if (period.type === 'break') {
                      return (
                        <td
                          key={periodIndex}
                          className="border px-2 py-2 text-center bg-amber-50 text-amber-700 font-medium"
                        >
                          {period.name}
                        </td>
                      )
                    }

                    const current = getSlot(day, periodIndex)
                    const items = current?.Items || []
                    const usedCourseCodes = new Set(items.map((it) => it.CourseCode).filter(Boolean))

                    return (
                      <td key={periodIndex} className="border p-1 align-top min-w-[110px]">
                        {items.map((item, idx) =>
                          item.ManualText ? (
                            <div
                              key={idx}
                              className="flex items-center justify-between gap-1 bg-purple-50 rounded px-1 py-0.5 mb-1"
                            >
                              <span className="text-purple-700 italic truncate">{item.ManualText}</span>
                              <button
                                onClick={() => removeItemFromSlot(day, periodIndex, idx)}
                                className="text-purple-400 hover:text-purple-700 font-bold text-xs shrink-0"
                                title="Remove"
                              >
                                ×
                              </button>
                            </div>
                          ) : (
                            <div
                              key={idx}
                              className="flex items-start justify-between gap-1 bg-blue-50 rounded px-1 py-0.5 mb-1"
                            >
                              <div className="min-w-0">
                                <div className="text-blue-700 font-semibold truncate leading-tight">
                                  {item.CourseCode}
                                </div>
                                {item.FacultyName && (
                                  <div className="text-[9px] text-slate-500 truncate leading-tight">
                                    {item.FacultyName}
                                  </div>
                                )}
                              </div>
                              <button
                                onClick={() => removeItemFromSlot(day, periodIndex, idx)}
                                className="text-blue-400 hover:text-blue-700 font-bold text-xs shrink-0"
                                title="Remove"
                              >
                                ×
                              </button>
                            </div>
                          )
                        )}

                        <select
                          defaultValue=""
                          onChange={(e) => handleAddChange(day, periodIndex, e)}
                          className="w-full text-[10px] border rounded focus:outline-none py-0.5 px-1 text-slate-500"
                        >
                          <option value="">+ Add subject</option>
                          {sectionCourses
                            .filter((m) => !usedCourseCodes.has(m.CourseCode))
                            .map((m) => (
                              <option key={m.CourseCode} value={m.CourseCode}>
                                {m.CourseCode}
                              </option>
                            ))}
                          <option value="__manual__">+ Add Manually</option>
                        </select>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>

          <button onClick={handleSave} className="btn-primary text-sm mt-4">
            Save Timetable
          </button>
        </div>
      )}
    </div>
  )
}

export default TimeTableEntry