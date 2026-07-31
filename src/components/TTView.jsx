import { useEffect, useState } from 'react'
import { API_URL } from '../config'
import { DAYS, PERIOD_SLOTS, SECTIONS } from '../utils/timetableConstants'

const SIGNATORIES = ['Timetable Officer', 'C4 Head', 'HOD', 'CTTO', 'Dean Academics', 'Principal']

function TTView() {
  const [section, setSection] = useState('')
  const [doc, setDoc] = useState(null)
  const [courseLookup, setCourseLookup] = useState({}) // CourseCode -> { L, T, P, CourseCategory }
  const [loading, setLoading] = useState(false)

  const authHeaders = { Authorization: `Bearer ${localStorage.getItem('token')}` }

  useEffect(() => {
    fetch(`${API_URL}/api/courses`, { headers: authHeaders })
      .then((res) => res.json())
      .then((courses) => {
        const map = {}
        courses.forEach((c) => { map[c.CourseCode] = c })
        setCourseLookup(map)
      })
      .catch(() => setCourseLookup({}))
  }, [])

  useEffect(() => {
    if (!section) {
      setDoc(null)
      return
    }
    setLoading(true)
    fetch(`${API_URL}/api/timetable/by-section/${section}`, { headers: authHeaders })
      .then((res) => res.json())
      .then(setDoc)
      .catch(() => setDoc(null))
      .finally(() => setLoading(false))
  }, [section])

  const getSlot = (day, periodIndex) =>
    doc?.Slots?.find((s) => s.Day === day && s.PeriodIndex === periodIndex)

  // Unique legend rows: one per Course-Faculty-Map entry actually used in this timetable
  const legendRows = []
  if (doc?.Slots) {
    const seen = new Set()
    doc.Slots.forEach((slot) => {
      ;(slot.Items || []).forEach((item) => {
        if (!item.CourseCode || seen.has(item.CourseCode)) return
        seen.add(item.CourseCode)
        const course = courseLookup[item.CourseCode]
        legendRows.push({
          CourseCode: item.CourseCode,
          CourseTitle: item.CourseTitle,
          Initial: item.Initial,
          FacultyName: item.FacultyName,
          LTP: course ? `${course.L}-${course.T}-${course.P}` : '-',
        })
      })
    })
    legendRows.sort((a, b) => a.CourseCode.localeCompare(b.CourseCode))
  }

  return (
    <div className="w-full font-mono">
      <div className="mb-4 flex items-center gap-3 print:hidden">
        <label className="text-sm font-medium">Select Section:</label>
        <select
          value={section}
          onChange={(e) => setSection(e.target.value)}
          className="border px-2 py-1 rounded"
        >
          <option value="">-- Select --</option>
          {SECTIONS.map((sec) => (
            <option key={sec} value={sec}>{sec}</option>
          ))}
        </select>
        {doc && (
          <button
            onClick={() => window.print()}
            className="bg-slate-700 text-white px-3 py-1 rounded hover:bg-slate-800 text-sm"
          >
            Print / Export
          </button>
        )}
      </div>

      {loading && <p className="text-sm text-slate-500">Loading...</p>}
      {!doc && !loading && section && (
        <p className="text-sm text-slate-500">No timetable saved for this section yet.</p>
      )}

      {doc && (
        <div className="border-2 border-slate-800 bg-white p-4 text-xs" id="tt-print-area">
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div className="w-16 h-16 border rounded-full flex items-center justify-center text-[9px] text-slate-400 shrink-0">
              LOGO
            </div>
            <div className="flex-1 text-center">
              <div className="text-base font-bold">BMS Institute of Technology and Management</div>
              <div className="text-sm font-bold">Department of ISE</div>
              <div className="text-sm font-semibold mt-1">
                Time Table for the Academic Year {doc.AcademicYear || '____-__'} ({doc.Term || '___'} SEMESTER)
              </div>
            </div>
            <div className="w-16 shrink-0" />
          </div>

          {/* Class info row */}
          <div className="flex flex-wrap gap-x-6 gap-y-1 justify-center border-t border-b border-slate-800 py-2 mb-3 font-semibold">
            <span>Class: {doc.ClassSemester || '-'}</span>
            <span>SECTION: {doc.Section}</span>
            <span>Room: {doc.RoomNumber || '-'}</span>
            <span>Class Teacher: {doc.ClassTeacherName || '-'}</span>
            <span>WEF: {doc.WEF || '-'}</span>
          </div>

          {/* Grid: Days as rows, Time as columns */}
          <table className="w-full border-collapse mb-4">
            <thead>
              <tr>
                <th className="border border-slate-800 px-2 py-1 w-16">Time<br/>Day</th>
                {PERIOD_SLOTS.filter((p) => p.type !== 'break').map((period, idx) => (
                  <th key={idx} className="border border-slate-800 px-2 py-1 font-semibold">
                    {period.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DAYS.map((day, dayIndex) => (
                <tr key={day}>
                  <td className="border border-slate-800 px-2 py-2 font-bold text-center">{day}</td>

                  {PERIOD_SLOTS.map((period, periodIndex) => {
                    if (period.type === 'break') {
                      if (dayIndex !== 0) return null
                      return (
                        <td
                          key={periodIndex}
                          rowSpan={DAYS.length}
                          className="border border-slate-800 px-1 py-1 text-center font-bold"
                          style={{ writingMode: 'vertical-rl' }}
                        >
                          {period.name.toUpperCase()}
                        </td>
                      )
                    }

                    const slot = getSlot(day, periodIndex)
                    const items = slot?.Items || []

                    return (
                      <td key={periodIndex} className="border border-slate-800 p-0 text-center align-middle">
                        {items.length === 0 ? (
                          <div className="py-3">&nbsp;</div>
                        ) : (
                          <div className="flex divide-x divide-slate-400">
                            {items.map((item, idx) => (
                              <div key={idx} className="flex-1 min-w-0 py-2 px-1">
                                {item.ManualText ? (
                                  <span className="font-semibold">{item.ManualText}</span>
                                ) : (
                                  <span className="font-semibold">{item.Initial || item.CourseCode}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Subject legend */}
          <table className="w-full border-collapse mb-6">
            <thead>
              <tr className="bg-slate-100">
                <th className="border border-slate-800 px-2 py-1">CODE</th>
                <th className="border border-slate-800 px-2 py-1">Subject</th>
                <th className="border border-slate-800 px-2 py-1">L-T-P</th>
                <th className="border border-slate-800 px-2 py-1">Initial</th>
                <th className="border border-slate-800 px-2 py-1">Faculty Name</th>
              </tr>
            </thead>
            <tbody>
              {legendRows.map((row) => (
                <tr key={row.CourseCode}>
                  <td className="border border-slate-800 px-2 py-1">{row.CourseCode}</td>
                  <td className="border border-slate-800 px-2 py-1">{row.CourseTitle}</td>
                  <td className="border border-slate-800 px-2 py-1 text-center">{row.LTP}</td>
                  <td className="border border-slate-800 px-2 py-1 text-center">{row.Initial || '-'}</td>
                  <td className="border border-slate-800 px-2 py-1">{row.FacultyName}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Signatures */}
          <div className="flex justify-between flex-wrap gap-3 pt-4">
            {SIGNATORIES.map((s) => (
              <div key={s} className="text-center font-semibold">
                {s}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default TTView