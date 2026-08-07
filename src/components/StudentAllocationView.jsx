import { useState, useEffect } from 'react'
import { API_URL } from '../config'

function StudentAllocationView() {
  const [summary, setSummary] = useState([])
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [students, setStudents] = useState([])

  const authHeaders = { 'Authorization': `Bearer ${localStorage.getItem('token')}` }

  const loadSummary = () => {
    fetch(`${API_URL}/api/students/allocation-summary`, { headers: authHeaders })
      .then((res) => res.json())
      .then((data) => setSummary(data))
  }

  useEffect(() => {
    loadSummary()
  }, [])

  const handleGroupClick = (semester, section) => {
    setSelectedGroup({ semester, section })
    fetch(`${API_URL}/api/students?Semester=${semester}&Section=${section}`, { headers: authHeaders })
      .then((res) => res.json())
      .then((data) => setStudents(data))
  }

  const handleRemove = async (id, usn) => {
    const confirmed = window.confirm(`Remove ${usn} from ${selectedGroup.semester} / ${selectedGroup.section}?`)
    if (!confirmed) return

    const res = await fetch(`${API_URL}/api/students/${id}/unallocate`, {
      method: 'PATCH',
      headers: authHeaders,
    })
    const data = await res.json()

    if (res.ok) {
      setStudents((prev) => prev.filter((s) => s._id !== id))
      loadSummary()
    } else {
      alert(data.error || 'Failed to remove student')
    }
  }

  if (selectedGroup) {
    return (
      <div>
        <button
          onClick={() => setSelectedGroup(null)}
          className="mb-4 text-blue-600 hover:underline"
        >
          ← Back to summary
        </button>

        <h3 className="text-lg font-semibold mb-4">
          Semester {selectedGroup.semester} — Section {selectedGroup.section} ({students.length} students)
        </h3>

        <table className="w-full border-collapse bg-white shadow-sm rounded overflow-hidden">
          <thead>
            <tr className="bg-slate-800 text-white text-left">
              <th className="px-4 py-2">USN</th>
              <th className="px-4 py-2">Student Name</th>
              <th className="px-4 py-2">Remove</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s._id} className="border-b hover:bg-blue-50">
                <td className="px-4 py-2">{s.USN}</td>
                <td className="px-4 py-2">{s.StudentName}</td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => handleRemove(s._id, s.USN)}
                    className="text-red-600 hover:underline text-sm"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <table className="w-full border-collapse bg-white shadow-sm rounded overflow-hidden">
      <thead>
        <tr className="bg-slate-800 text-white text-left">
          <th className="px-4 py-2">Semester</th>
          <th className="px-4 py-2">Section</th>
          <th className="px-4 py-2">No. of Students</th>
        </tr>
      </thead>
      <tbody>
        {summary.map((row) => (
          <tr key={`${row._id.Semester}-${row._id.Section}`} className="border-b hover:bg-blue-50">
            <td className="px-4 py-2">{row._id.Semester}</td>
            <td className="px-4 py-2">{row._id.Section}</td>
            <td className="px-4 py-2">
              <button
                onClick={() => handleGroupClick(row._id.Semester, row._id.Section)}
                className="text-blue-600 hover:underline font-medium"
              >
                {row.count}
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default StudentAllocationView