import { useState, useEffect } from 'react'
import { API_URL } from '../config'
import { viewSyllabus } from '../utils/viewSyllabus'

const PRIVILEGED_ROLES = ['Admin', 'HOD', 'AcademicCoordinator']

function CourseListView({ onEditRequest }) {
  const [courses, setCourses] = useState([])
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  const authHeaders = { 'Authorization': `Bearer ${localStorage.getItem('token')}` }

  const currentUser = JSON.parse(localStorage.getItem('user') || 'null')
  const userRoles = currentUser?.Roles || []
  const canViewSyllabus = PRIVILEGED_ROLES.some((r) => userRoles.includes(r))

  useEffect(() => {
    fetch(`${API_URL}/api/courses`, { headers: authHeaders })
      .then((res) => res.json())
      .then((data) => setCourses(data))
  }, [])

  const filteredCourses = courses
    .filter((c) => c.CourseCode.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => a.CourseCode.localeCompare(b.CourseCode))

  const handleRowClick = async (id) => {
    const res = await fetch(`${API_URL}/api/courses/${id}`, { headers: authHeaders })
    const data = await res.json()
    setSelectedCourse(data)
  }

  const handleEditClick = async (id) => {
    const res = await fetch(`${API_URL}/api/courses/${id}`, { headers: authHeaders })
    const data = await res.json()
    onEditRequest(data)
  }

  const handleDelete = async (id, courseTitle) => {
    const confirmed = window.confirm(
      `Delete "${courseTitle}"? This will also remove its Lesson Plan, CO Allocation, CO-PO Mapping, and Faculty allocations. This cannot be undone.`
    )
    if (!confirmed) return

    const res = await fetch(`${API_URL}/api/courses/${id}`, {
      method: 'DELETE',
      headers: authHeaders,
    })
    const data = await res.json()

    if (res.ok) {
      setCourses((prev) => prev.filter((c) => c._id !== id))
      alert(data.message)
    } else {
      alert(data.error || 'Failed to delete')
    }
  }

  if (selectedCourse) {
    const fields = [
      'CourseCategory', 'CourseCode', 'CourseTitle', 'Initial', 'Semester',
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

          {canViewSyllabus && (
            <div className="pt-3 mt-2 border-t">
              <button
                onClick={() => viewSyllabus(selectedCourse._id)}
                className="text-blue-600 hover:underline text-sm"
              >
                View Syllabus
              </button>
            </div>
          )}
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
            {canViewSyllabus && <th className="px-4 py-2">Syllabus</th>}
            <th className="px-4 py-2">Edit</th>
            <th className="px-4 py-2">Delete</th>
          </tr>
        </thead>
        <tbody>
          {filteredCourses.map((c) => (
            <tr key={c._id} className="hover:bg-blue-50 border-b">
              <td className="px-4 py-2 cursor-pointer" onClick={() => handleRowClick(c._id)}>{c.CourseCode}</td>
              <td className="px-4 py-2 cursor-pointer" onClick={() => handleRowClick(c._id)}>{c.CourseTitle}</td>
              {canViewSyllabus && (
                <td className="px-4 py-2">
                  <button
                    onClick={() => viewSyllabus(c._id)}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    View Syllabus
                  </button>
                </td>
              )}
              <td className="px-4 py-2">
                <button
                  onClick={() => handleEditClick(c._id)}
                  className="text-blue-600 hover:underline text-sm"
                >
                  Edit
                </button>
              </td>
              <td className="px-4 py-2">
                <button onClick={() => handleDelete(c._id, c.CourseTitle)} className="text-red-600 hover:underline text-sm">
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default CourseListView