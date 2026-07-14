import { useState, useEffect } from 'react'
import { API_URL } from '../config'
function CourseListView() {
  const [courses, setCourses] = useState([])
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetch(`${API_URL}/api/courses`)
      .then((res) => res.json())
      .then((data) => setCourses(data))
  }, [])

  const filteredCourses = courses
    .filter((c) => c.CourseCode.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => a.CourseCode.localeCompare(b.CourseCode))

  const handleRowClick = async (id) => {
    const res = await fetch(`${API_URL}/api/courses/${id}`)
    const data = await res.json()
    setSelectedCourse(data)
  }

  if (selectedCourse) {
    const fields = [
      'CourseCategory', 'CourseCode', 'CourseTitle', 'Semester',
      'L', 'T', 'P', 'S', 'Credits',
    ]

    return (
      <div>
        <button
          onClick={() => setSelectedCourse(null)}
          className="mb-4 text-blue-600 hover:underline"
        >
          ← Back to list
        </button>

        <h2 className="text-xl font-bold mb-4">{selectedCourse.CourseTitle}</h2>

        <div className="border rounded-lg p-4 bg-white shadow-sm max-w-md">
          {fields.map((field) => (
            <div key={field} className="flex justify-between py-1.5 border-b last:border-0 text-sm">
              <span className="font-medium text-slate-600">
                {field.replace(/([A-Z])/g, ' $1')}
              </span>
              <span className="text-slate-900">{selectedCourse[field] || '—'}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <input
        type="text"
        placeholder="Search by Course Code..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="border px-3 py-1 rounded w-64 mb-4"
      />

      <table className="w-full border-collapse bg-white shadow-sm rounded overflow-hidden">
        <thead>
          <tr className="bg-slate-800 text-white text-left">
            <th className="px-4 py-2">Course Code</th>
            <th className="px-4 py-2">Course Title</th>
          </tr>
        </thead>
        <tbody>
          {filteredCourses.map((c) => (
            <tr
              key={c._id}
              onClick={() => handleRowClick(c._id)}
              className="cursor-pointer hover:bg-blue-50 border-b"
            >
              <td className="px-4 py-2">{c.CourseCode}</td>
              <td className="px-4 py-2">{c.CourseTitle}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default CourseListView