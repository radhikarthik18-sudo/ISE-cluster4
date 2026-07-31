import { useEffect, useState } from 'react'
import { API_URL } from '../config'
import { DAYS, PERIOD_SLOTS } from '../utils/timetableConstants'

function FacultyTimeTableView() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)

  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const facultyId = user.FacultyID
  const authHeaders = { Authorization: `Bearer ${localStorage.getItem('token')}` }

  useEffect(() => {
    if (!facultyId) {
      setLoading(false)
      return
    }
    fetch(`${API_URL}/api/timetable/by-faculty/${facultyId}`, { headers: authHeaders })
      .then((res) => res.json())
      .then((data) => setEntries(data || []))
      .finally(() => setLoading(false))
  }, [facultyId])

  const getEntries = (day, periodIndex) =>
    entries.filter((e) => e.Day === day && e.PeriodIndex === periodIndex)

  if (!facultyId) {
    return <p className="text-sm text-slate-500">Could not determine your Faculty ID. Please log in again.</p>
  }

  if (loading) {
    return <p className="text-sm text-slate-500">Loading your timetable...</p>
  }

  return (
    <div className="w-full font-mono">
      <p className="text-xs text-slate-500 mb-2">
        Your teaching timetable across all sections — {user.Name ? `${user.Name} (${facultyId})` : facultyId}
      </p>

      {entries.length === 0 ? (
        <p className="text-sm text-slate-500">No classes allocated to you yet.</p>
      ) : (
        <div className="overflow-x-auto">
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

                    const dayEntries = getEntries(day, periodIndex)
                    return (
                      <td key={periodIndex} className="border p-1 align-top min-w-[110px]">
                        {dayEntries.length === 0 ? (
                          <span className="text-slate-300">-</span>
                        ) : (
                          dayEntries.map((e, idx) => (
                            <div key={idx} className="bg-blue-50 rounded px-1 py-0.5 mb-1">
                              <div className="text-blue-700 font-semibold truncate leading-tight">
                                {e.CourseCode}
                              </div>
                              <div className="text-[9px] text-slate-500 truncate leading-tight">
                                Section {e.Section}
                              </div>
                            </div>
                          ))
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default FacultyTimeTableView