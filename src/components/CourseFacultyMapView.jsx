import { useState, useEffect } from 'react'
import { API_URL } from '../config'

function CourseFacultyMapView() {
  const [mappings, setMappings] = useState([])

  const fetchMappings = () => {
    fetch(`${API_URL}/api/course-faculty-map`)
      .then((res) => res.json())
      .then((data) => setMappings(data))
  }

  useEffect(() => {
    fetchMappings()
  }, [])

  const handleDelete = async (id, courseTitle, facultyName) => {
    const confirmed = window.confirm(
      `Remove ${courseTitle} allocation from ${facultyName}?`
    )
    if (!confirmed) return

    const res = await fetch(`${API_URL}/api/course-faculty-map/${id}`, {
      method: 'DELETE',
    })
    if (res.ok) {
      setMappings((prev) => prev.filter((m) => m._id !== id))
    } else {
      alert('Failed to delete')
    }
  }

  return (
    <table className="w-full border-collapse bg-white shadow-sm rounded overflow-hidden">
      <thead>
        <tr className="bg-slate-800 text-white text-left">
          <th className="px-4 py-2">Course Code</th>
          <th className="px-4 py-2">Subject</th>
          <th className="px-4 py-2">Section</th>
          <th className="px-4 py-2">Faculty</th>
          <th className="px-4 py-2">Credits</th>
          <th className="px-4 py-2">Delete</th>
        </tr>
      </thead>
      <tbody>
        {mappings.map((m) => (
          <tr key={m._id} className="border-b hover:bg-blue-50">
            <td className="px-4 py-2">{m.CourseCode}</td>
            <td className="px-4 py-2">{m.CourseTitle}</td>
            <td className="px-4 py-2">{m.Section}</td>
            <td className="px-4 py-2">{m.FacultyName}</td>
            <td className="px-4 py-2">{m.Credits}</td>
            <td className="px-4 py-2">
              <button
                onClick={() => handleDelete(m._id, m.CourseTitle, m.FacultyName)}
                className="text-red-600 hover:underline text-sm"
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default CourseFacultyMapView