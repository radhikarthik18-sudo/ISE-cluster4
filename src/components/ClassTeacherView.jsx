import { useState, useEffect } from 'react'
import { API_URL } from '../config'

function ClassTeacherView() {
  const [assignments, setAssignments] = useState([])
  const authHeaders = { 'Authorization': `Bearer ${localStorage.getItem('token')}` }

  useEffect(() => {
    fetch(`${API_URL}/api/class-teacher`, { headers: authHeaders })
      .then((res) => res.json())
      .then((data) => setAssignments(data))
  }, [])

  const sorted = [...assignments].sort((a, b) => {
    if (a.Semester !== b.Semester) return a.Semester - b.Semester
    return a.Section.localeCompare(b.Section)
  })

  return (
    <table className="w-full border-collapse bg-white shadow-sm rounded overflow-hidden">
      <thead>
        <tr className="bg-slate-800 text-white text-left">
          <th className="px-4 py-2">Semester</th>
          <th className="px-4 py-2">Section</th>
          <th className="px-4 py-2">Class Teacher</th>
        </tr>
      </thead>
      <tbody>
        {sorted.map((a) => (
          <tr key={a._id} className="border-b hover:bg-blue-50">
            <td className="px-4 py-2">{a.Semester}</td>
            <td className="px-4 py-2">{a.Section}</td>
            <td className="px-4 py-2">{a.FacultyName}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default ClassTeacherView