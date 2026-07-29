import { useState, useEffect } from 'react'
import InstituteHeader from './InstituteHeader'
import { API_URL } from '../config'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function AttendanceLedger() {
  const [courses, setCourses] = useState([])
  const [selectedCourseId, setSelectedCourseId] = useState('')
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [section, setSection] = useState('')
  const [month, setMonth] = useState('')
  const [year, setYear] = useState('')

  const [students, setStudents] = useState([])
  const [records, setRecords] = useState([])

  useEffect(() => {
    fetch(`${API_URL}/api/courses`)
      .then((res) => res.json())
      .then((data) => setCourses(data))
  }, [])

  useEffect(() => {
    if (!selectedCourseId) {
      setSelectedCourse(null)
      return
    }
    fetch(`${API_URL}/api/courses/${selectedCourseId}`)
      .then((res) => res.json())
      .then((data) => setSelectedCourse(data))
  }, [selectedCourseId])

  useEffect(() => {
    if (!selectedCourse || !section) {
      setStudents([])
      return
    }
    fetch(`${API_URL}/api/students/by-semester/list?Semester=${selectedCourse.Semester}`)
      .then((res) => res.json())
      .then((data) => {
        const inSection = data.filter((s) => s.Section === section)
        setStudents([...inSection].sort((a, b) => a.USN.localeCompare(b.USN)))
      })
  }, [selectedCourse, section])

  useEffect(() => {
    if (!selectedCourse || !section) {
      setRecords([])
      return
    }
    fetch(`${API_URL}/api/attendance?CourseCode=${selectedCourse.CourseCode}&Section=${section}`)
      .then((res) => res.json())
      .then((data) => setRecords(data))
  }, [selectedCourse, section])

  const showLedger = Boolean(selectedCourse && section && month && year)

  // All session dates that fall inside the chosen Month + Year, sorted
  const monthIndex = MONTHS.indexOf(month)
  const sessionsInMonth = records
    .filter((r) => {
      const d = new Date(r.Date)
      return d.getMonth() === monthIndex && d.getFullYear() === Number(year)
    })
    .sort((a, b) => a.Date.localeCompare(b.Date))

  const sessionDates = [...new Set(sessionsInMonth.map((r) => r.Date))]

  const getStatus = (usn, date) => {
    const session = sessionsInMonth.find((r) => r.Date === date)
    const mark = session?.Marks.find((m) => m.USN === usn)
    return mark ? mark.Status : ''
  }

  const getMonthlyTotal = (usn) => {
    let present = 0
    let total = 0
    sessionDates.forEach((date) => {
      const status = getStatus(usn, date)
      if (status) {
        total++
        if (status === 'P') present++
      }
    })
    return { present, total }
  }

  return (
    <div className="w-full font-mono">
      <div className="flex flex-wrap items-end gap-4 mb-6 p-4 bg-slate-50 rounded-lg border print:hidden">
        <div>
          <label className="block text-sm font-medium mb-1">Course Code</label>
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="border px-2 py-1 rounded"
          >
            <option value="">-- Select --</option>
            {courses.map((c) => (
              <option key={c._id} value={c._id}>{c.CourseCode}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Section</label>
          <select
            value={section}
            onChange={(e) => setSection(e.target.value)}
            className="border px-2 py-1 rounded"
          >
            <option value="">-- Select --</option>
            {['10-J', '11-K', '12-L'].map((sec) => (
              <option key={sec} value={sec}>{sec}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Month</label>
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="border px-2 py-1 rounded"
          >
            <option value="">-- Select --</option>
            {MONTHS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Year</label>
          <input
            type="text"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder="2026"
            className="border px-2 py-1 rounded w-24"
          />
        </div>

        {showLedger && (
          <button
            onClick={() => window.print()}
            className="bg-slate-700 text-white px-3 py-1.5 rounded hover:bg-slate-800 text-sm"
          >
            Print / Export
          </button>
        )}
      </div>

      {showLedger && (
        <div className="border-2 border-slate-800 bg-white text-xs" id="coe-print-area">
          <InstituteHeader
            title={`Attendance Ledger — ${selectedCourse.CourseTitle} (${selectedCourse.CourseCode})`}
            semester={selectedCourse.Semester}
            academic={year}
            term={`${month} ${section}`}
          />

          {sessionDates.length === 0 ? (
            <p className="p-4 text-slate-500">No attendance sessions found for {month} {year}.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="border-collapse text-xs w-full">
                <thead>
                  <tr className="bg-slate-800 text-white">
                    <th className="border px-2 py-1 sticky left-0 bg-slate-800">USN</th>
                    <th className="border px-2 py-1 sticky left-16 bg-slate-800">Name</th>
                    {sessionDates.map((d) => (
                      <th key={d} className="border px-1 py-1">
                        {new Date(d).getDate()}
                      </th>
                    ))}
                    <th className="border px-2 py-1">Total (P/T)</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s) => {
                    const { present, total } = getMonthlyTotal(s.USN)
                    return (
                      <tr key={s._id}>
                        <td className="border px-2 py-1">{s.USN}</td>
                        <td className="border px-2 py-1">{s.StudentName}</td>
                        {sessionDates.map((d) => {
                          const status = getStatus(s.USN, d)
                          return (
                            <td
                              key={d}
                              className={`border px-1 py-1 text-center ${
                                status === 'P' ? 'text-green-700 font-semibold' :
                                status === 'A' ? 'text-red-700 font-semibold' : ''
                              }`}
                            >
                              {status}
                            </td>
                          )
                        })}
                        <td className="border px-2 py-1 text-center font-semibold">
                          {present}/{total}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default AttendanceLedger