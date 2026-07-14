import { useEffect, useState } from 'react'
import InstituteHeader from './InstituteHeader'
import { DAY_KEYS, getAutoHolidayColor } from '../utils/coeUtils'
import { API_URL } from '../config'
// Groups consecutive week rows that share the same Month so we can render
// a single vertical "Month" cell spanning all of that month's weeks.
function groupByMonth(entries) {
  const groups = []
  let current = null
  entries.forEach((row) => {
    if (!current || current.Month !== row.Month) {
      current = { Month: row.Month, rows: [] }
      groups.push(current)
    }
    current.rows.push(row)
  })
  return groups
}

function COEView() {
  const [docs, setDocs] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [doc, setDoc] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch(`${API_URL}/api/coe`)
      .then((res) => res.json())
      .then(setDocs)
      .catch(() => setDocs([]))
  }, [])

  useEffect(() => {
    if (!selectedId) {
      setDoc(null)
      return
    }
    setLoading(true)
    fetch(`${API_URL}/api/coe/${selectedId}`)
      .then((res) => res.json())
      .then(setDoc)
      .catch(() => setDoc(null))
      .finally(() => setLoading(false))
  }, [selectedId])

  const monthGroups = doc ? groupByMonth(doc.Entries || []) : []

  return (
    <div className="w-full font-mono">
      <div className="mb-4 flex items-center gap-3 print:hidden">
        <label className="text-sm font-medium">Select Calendar:</label>
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="border px-2 py-1 rounded"
        >
          <option value="">-- Select --</option>
          {docs.map((d) => (
            <option key={d._id} value={d._id}>
              {d.Title || 'Untitled'} ({d.Semester}, {d.AcademicYear} {d.Term})
            </option>
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

      {!doc && !loading && (
        <p className="text-sm text-slate-500">Select a saved Calendar of Events to view it here.</p>
      )}

      {doc && (
        <div className="border-2 border-slate-800 bg-white text-xs" id="coe-print-area">
          <InstituteHeader title={doc.Title} />

          {/* Vision / Mission bands */}
          <div className="flex border-b border-slate-300">
            <div className="bg-green-700 text-white font-semibold px-2 py-1 w-40 shrink-0 flex items-center">
              VISION OF THE INSTITUTE
            </div>
            <div className="px-2 py-1 flex-1 bg-green-50 flex items-center">{doc.Vision}</div>
          </div>
          <div className="flex border-b-2 border-slate-800">
            <div className="bg-orange-600 text-white font-semibold px-2 py-1 w-40 shrink-0 flex items-center">
              MISSION OF THE INSTITUTE
            </div>
            <div className="px-2 py-1 flex-1 bg-orange-50 flex items-center">{doc.Mission}</div>
          </div>

          {/* Calendar table */}
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-800 text-white">
                <th className="border px-1 py-1">Month</th>
                <th className="border px-1 py-1">Week</th>
                {DAY_KEYS.map((d) => (
                  <th key={d} className="border px-1 py-1">
                    {d}
                  </th>
                ))}
                <th className="border px-1 py-1">Working Days</th>
                <th className="border px-1 py-1 w-72">Events</th>
              </tr>
            </thead>
            <tbody>
              {monthGroups.map((group, gi) =>
                group.rows.map((row, ri) => (
                  <tr key={`${gi}-${ri}`}>
                    {ri === 0 && (
                      <td
                        rowSpan={group.rows.length}
                        className="border px-1 py-1 align-middle font-semibold text-center bg-slate-100"
                        style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                      >
                        {group.Month}
                      </td>
                    )}
                    <td className="border px-1 py-1 text-center">{row.Week}</td>

                    {DAY_KEYS.map((dayKey) => {
                      const dayEvent = (row.Events || []).find((ev) => ev.Day === dayKey)
                      const cellColor = dayEvent ? dayEvent.Color : getAutoHolidayColor(dayKey, row[dayKey])
                      return (
                        <td
                          key={dayKey}
                          className={`border px-1 py-1 text-center ${cellColor ? 'text-white font-semibold' : ''}`}
                          style={{ backgroundColor: cellColor || undefined }}
                        >
                          {row[dayKey]}
                        </td>
                      )
                    })}

                    <td className="border px-1 py-1 text-center">{row.WorkingDays}</td>
                    <td className="border px-1 py-1">
                      <div className="flex flex-wrap gap-1">
                        {(row.Events || []).map((ev, ei) => (
                          <span
                            key={ei}
                            style={{ backgroundColor: ev.Color }}
                            className="text-white px-2 py-0.5 rounded text-[10px]"
                          >
                            {ev.Text}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Footer */}
          <div className="p-2 border-t-2 border-slate-800 text-[10px] italic bg-blue-50">
            Variations in dates of events if any for valid reasons will be notified by the concerned
          </div>
          <div className="flex justify-between p-4 flex-wrap gap-2">
            {(doc.Signatories || []).map((s, i) => (
              <div key={i} className="text-center text-xs font-semibold">
                {s}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default COEView