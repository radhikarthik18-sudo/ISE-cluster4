import { useState, useEffect } from 'react'
import { API_URL } from '../config' 

function StudentAllocation() {
  const [years, setYears] = useState([])
  const [selectedYear, setSelectedYear] = useState('')
  const [semester, setSemester] = useState('')
  const [section, setSection] = useState('')
  const [students, setStudents] = useState([])
  const [selectedIds, setSelectedIds] = useState([])

  useEffect(() => {
    fetch(`${API_URL}/api/students/years`)
      .then((res) => res.json())
      .then((data) => setYears(data))
  }, [])

  useEffect(() => {
    if (!selectedYear) {
      setStudents([])
      return
    }
    fetch(`${API_URL}/api/students?Year=${selectedYear}`)
      .then((res) => res.json())
      .then((data) => {
      const sorted = [...data].sort((a, b) => a.USN.localeCompare(b.USN))
      setStudents(sorted)
    })
    setSelectedIds([])
  }, [selectedYear])

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === students.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(students.map((s) => s._id))
    }
  }

  const handleAllocate = async () => {
    if (!semester || !section) {
      alert('Please select Semester and Section')
      return
    }
    if (selectedIds.length === 0) {
      alert('Please select at least one student')
      return
    }

    const res = await fetch(`${API_URL}/api/students/allocate`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentIds: selectedIds, Semester: semester, Section: section }),
    })
    const data = await res.json()

    if (!res.ok) {
      alert(data.error || 'Allocation failed')
      return
    }
    alert(data.message)
    setSelectedIds([])
  }

  return (
    <div className="w-full font-mono">
      <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-slate-50 rounded-lg border">
        <div>
          <label className="text-sm font-semibold mr-2">Year:</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="border px-2 py-1 rounded"
          >
            <option value="">-- Select --</option>
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-semibold mr-2">Semester:</label>
          <select
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            className="border px-2 py-1 rounded"
          >
            <option value="">-- Select --</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
              <option key={sem} value={sem}>{sem}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-semibold mr-2">Section:</label>
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
      </div>

      {selectedYear && (
        <table className="w-full border-collapse bg-white shadow-sm rounded overflow-hidden">
          <thead>
            <tr className="bg-slate-800 text-white text-left">
              <th className="px-4 py-2">
                <input
                  type="checkbox"
                  checked={students.length > 0 && selectedIds.length === students.length}
                  onChange={toggleSelectAll}
                />
              </th>
              <th className="px-4 py-2">USN</th>
              <th className="px-4 py-2">Student Name</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s._id} className="border-b hover:bg-blue-50">
                <td className="px-4 py-2">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(s._id)}
                    onChange={() => toggleSelect(s._id)}
                  />
                </td>
                <td className="px-4 py-2">{s.USN}</td>
                <td className="px-4 py-2">{s.StudentName}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {selectedYear && (
        <button
          onClick={handleAllocate}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Allocate
        </button>
      )}
    </div>
  )
}

export default StudentAllocation