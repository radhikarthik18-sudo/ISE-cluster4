import { useState, useEffect } from 'react'
import { API_URL } from '../config'

const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8]
const SECTIONS = ['10-J', '11-K', '12-L']

function ProctorAllotment() {
  const [semester, setSemester] = useState('')
  const [section, setSection] = useState('')
  const [allStudents, setAllStudents] = useState([])
  const [facultyList, setFacultyList] = useState([])
  const [selectedFacultyId, setSelectedFacultyId] = useState('')
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [lastClickedIndex, setLastClickedIndex] = useState(null)
  const [overview, setOverview] = useState([])
  const [showAssigned, setShowAssigned] = useState(false)

  const [reportAcademicYear, setReportAcademicYear] = useState('')
  const [reportTerm, setReportTerm] = useState('ODD')
  const [downloadingReport, setDownloadingReport] = useState(false)

  const authHeaders = { Authorization: `Bearer ${localStorage.getItem('token')}` }

  useEffect(() => {
    fetch(`${API_URL}/api/faculty?status=all`, { headers: authHeaders })
      .then((res) => res.json())
      .then(setFacultyList)
    loadOverview()
  }, [])

  const loadOverview = () => {
    fetch(`${API_URL}/api/proctor/overview`, { headers: authHeaders })
      .then((res) => res.json())
      .then(setOverview)
  }

  const loadStudents = () => {
    if (!semester || !section) return
    fetch(`${API_URL}/api/proctor/summary?Semester=${semester}&Section=${section}`, { headers: authHeaders })
      .then((res) => res.json())
      .then((data) => {
        setAllStudents(data)
        setSelectedIds(new Set())
        setLastClickedIndex(null)
      })
  }

  useEffect(() => {
    loadStudents()
  }, [semester, section])

  const students = showAssigned ? allStudents : allStudents.filter((s) => !s.ProctorFacultyID)
  const assignedCount = allStudents.length - allStudents.filter((s) => !s.ProctorFacultyID).length

  const handleRowClick = (e, index) => {
    const student = students[index]
    if (e.shiftKey && lastClickedIndex !== null) {
      const start = Math.min(lastClickedIndex, index)
      const end = Math.max(lastClickedIndex, index)
      setSelectedIds(new Set(students.slice(start, end + 1).map((s) => s._id)))
    } else if (e.ctrlKey || e.metaKey) {
      setSelectedIds((prev) => {
        const next = new Set(prev)
        if (next.has(student._id)) next.delete(student._id)
        else next.add(student._id)
        return next
      })
      setLastClickedIndex(index)
    } else {
      setSelectedIds(new Set([student._id]))
      setLastClickedIndex(index)
    }
  }

  const handleSelectAll = () => setSelectedIds(new Set(students.map((s) => s._id)))
  const handleClearSelection = () => setSelectedIds(new Set())

  const handleAssign = async () => {
    if (selectedIds.size === 0) return alert('Select at least one student')
    if (!selectedFacultyId) return alert('Select a faculty to assign as proctor')
    const faculty = facultyList.find((f) => f.FacultyID === selectedFacultyId)

    const res = await fetch(`${API_URL}/api/proctor/assign`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
      body: JSON.stringify({
        studentIds: [...selectedIds],
        FacultyID: faculty.FacultyID,
        FacultyName: faculty.Name,
      }),
    })
    const data = await res.json()
    if (!res.ok) {
      alert(data.error || 'Assignment failed')
      return
    }
    alert(data.message)
    loadStudents()
    loadOverview()
  }

  const unassignIds = async (ids) => {
    const res = await fetch(`${API_URL}/api/proctor/unassign`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
      body: JSON.stringify({ studentIds: ids }),
    })
    const data = await res.json()
    if (!res.ok) {
      alert(data.error || 'Unassign failed')
      return
    }
    loadStudents()
    loadOverview()
  }

  const handleUnassign = () => {
    if (selectedIds.size === 0) return alert('Select at least one student')
    unassignIds([...selectedIds])
  }

  const handleQuickUnassign = (e, studentId) => {
    e.stopPropagation()
    unassignIds([studentId])
  }

  const handleDownloadReport = async () => {
    if (!semester) return alert('Select a Semester first')
    setDownloadingReport(true)
    try {
      const params = new URLSearchParams({ Semester: semester, AcademicYear: reportAcademicYear, Term: reportTerm })
      const res = await fetch(`${API_URL}/api/proctor/report?${params}`, { headers: authHeaders })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        alert(err.error || 'Failed to generate report')
        return
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Proctor_Allotment_Sem${semester}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      alert('Failed to generate report')
    } finally {
      setDownloadingReport(false)
    }
  }

  return (
    <div className="w-full font-mono">
      {overview.length > 0 && (
        <div className="border rounded-lg p-4 bg-white shadow-sm mb-6">
          <h3 className="text-sm font-semibold mb-2">Current Proctor Load (all sections)</h3>
          <div className="flex flex-wrap gap-2">
            {overview.map((row) => (
              <span key={row._id.FacultyID} className="bg-slate-100 rounded px-2 py-1 text-xs">
                {row._id.FacultyName}: <strong>{row.count}</strong>
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Semester</label>
          <select value={semester} onChange={(e) => setSemester(e.target.value)} className="border px-2 py-1 rounded w-32">
            <option value="">-- Select --</option>
            {SEMESTERS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Section</label>
          <select value={section} onChange={(e) => setSection(e.target.value)} className="border px-2 py-1 rounded w-32">
            <option value="">-- Select --</option>
            {SECTIONS.map((sec) => <option key={sec} value={sec}>{sec}</option>)}
          </select>
        </div>
      </div>

      <div className="flex items-end gap-3 mb-6 border-t pt-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Academic Year</label>
          <input
            type="text"
            value={reportAcademicYear}
            onChange={(e) => setReportAcademicYear(e.target.value)}
            placeholder="2026-27"
            className="border px-2 py-1 rounded w-28"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Term</label>
          <select value={reportTerm} onChange={(e) => setReportTerm(e.target.value)} className="border px-2 py-1 rounded w-28">
            <option value="ODD">ODD</option>
            <option value="EVEN">EVEN</option>
          </select>
        </div>
        <button
          onClick={handleDownloadReport}
          disabled={!semester || downloadingReport}
          className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700 disabled:opacity-50"
        >
          {downloadingReport ? 'Generating...' : 'Download Proctor Report (PDF)'}
        </button>
      </div>

      {semester && section && allStudents.length === 0 && (
        <p className="text-sm text-slate-500">No students found for Semester {semester}, Section {section}.</p>
      )}

      {allStudents.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-slate-500">
              Click a row to select it. Shift-click to select a continuous range. Ctrl/Cmd-click to add or remove individual students.
            </p>
            <label className="flex items-center gap-1.5 text-xs text-slate-600 shrink-0 ml-4">
              <input
                type="checkbox"
                checked={showAssigned}
                onChange={(e) => setShowAssigned(e.target.checked)}
              />
              Show already-assigned ({assignedCount})
            </label>
          </div>

          {students.length === 0 ? (
            <p className="text-sm text-slate-500 py-4">
              All students in this section already have a proctor assigned. Check "Show already-assigned" above to review, quick-unassign, or reassign them.
            </p>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-3">
                <button onClick={handleSelectAll} className="text-xs text-blue-600 underline">Select All</button>
                <button onClick={handleClearSelection} className="text-xs text-blue-600 underline">Clear Selection</button>
                <span className="text-xs text-slate-500">{selectedIds.size} selected</span>
              </div>

              <div className="max-h-[500px] overflow-y-auto border rounded">
                <table className="w-full border-collapse bg-white text-sm">
                  <thead className="sticky top-0">
                    <tr className="bg-slate-800 text-white text-left">
                      <th className="px-3 py-2 w-10"></th>
                      <th className="px-3 py-2">USN</th>
                      <th className="px-3 py-2">Student Name</th>
                      <th className="px-3 py-2">Current Proctor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s, index) => (
                      <tr
                        key={s._id}
                        onClick={(e) => handleRowClick(e, index)}
                        className={`border-b cursor-pointer select-none ${
                          selectedIds.has(s._id) ? 'bg-blue-100' : 'hover:bg-blue-50'
                        }`}
                      >
                        <td className="px-3 py-1.5">
                          <input type="checkbox" checked={selectedIds.has(s._id)} readOnly className="pointer-events-none" />
                        </td>
                        <td className="px-3 py-1.5">{s.USN}</td>
                        <td className="px-3 py-1.5">{s.StudentName}</td>
                        <td className="px-3 py-1.5 text-slate-500">
                          {s.ProctorFacultyName ? (
                            <span className="flex items-center gap-2">
                              {s.ProctorFacultyName}
                              <button
                                onClick={(e) => handleQuickUnassign(e, s._id)}
                                className="text-red-500 hover:text-red-700 text-xs underline"
                                title="Unassign this student"
                              >
                                Unassign
                              </button>
                            </span>
                          ) : (
                            <span className="text-slate-300">Unassigned</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-end gap-3 mt-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Assign Selected To</label>
                  <select
                    value={selectedFacultyId}
                    onChange={(e) => setSelectedFacultyId(e.target.value)}
                    className="border px-2 py-1 rounded w-56"
                  >
                    <option value="">-- Select Faculty --</option>
                    {facultyList.map((f) => (
                      <option key={f.FacultyID} value={f.FacultyID}>{f.Name} ({f.FacultyID})</option>
                    ))}
                  </select>
                </div>
                <button onClick={handleAssign} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                  Assign as Proctor
                </button>
                <button onClick={handleUnassign} className="bg-slate-500 text-white px-4 py-2 rounded hover:bg-slate-600">
                  Unassign Selected
                </button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}

export default ProctorAllotment