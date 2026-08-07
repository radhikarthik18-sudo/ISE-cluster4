import { useEffect, useState } from 'react'
import { API_URL } from '../config'

function MyProctees() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)

  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const facultyId = user.FacultyID
  const authHeaders = { Authorization: `Bearer ${localStorage.getItem('token')}` }

  useEffect(() => {
    if (!facultyId) {
      setLoading(false)
      return
    }
    fetch(`${API_URL}/api/proctor/by-faculty/${facultyId}`, { headers: authHeaders })
      .then((res) => res.json())
      .then(setStudents)
      .finally(() => setLoading(false))
  }, [facultyId])

  if (!facultyId) return <p className="text-sm text-slate-500">Could not determine your Faculty ID. Please log in again.</p>
  if (loading) return <p className="text-sm text-slate-500">Loading your proctees...</p>

  return (
    <div className="w-full font-mono">
      <p className="text-xs text-slate-500 mb-3">
        Students you are the proctor for — {user.Name ? `${user.Name} (${facultyId})` : facultyId}
      </p>

      {students.length === 0 ? (
        <p className="text-sm text-slate-500">No students allocated to you yet.</p>
      ) : (
        <table className="w-full border-collapse bg-white shadow-sm rounded overflow-hidden text-sm">
          <thead>
            <tr className="bg-slate-800 text-white text-left">
              <th className="px-4 py-2">USN</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Sem / Section</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Phone</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s._id} className="border-b hover:bg-blue-50">
                <td className="px-4 py-2">{s.USN}</td>
                <td className="px-4 py-2">{s.StudentName}</td>
                <td className="px-4 py-2">{s.Semester} / {s.Section}</td>
                <td className="px-4 py-2">{s.StudentEmail || '-'}</td>
                <td className="px-4 py-2">{s.StudentPhone || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default MyProctees