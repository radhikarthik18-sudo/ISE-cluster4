import { useState, useEffect } from 'react'
import { API_URL } from '../config'

function CourseStudentMap() {
  const [courses, setCourses] = useState([])
  const [selectedCourseId, setSelectedCourseId] = useState('')
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [students, setStudents] = useState([])

  useEffect(() => {
    fetch(`${API_URL}/api/courses`)
      .then((res) => res.json())
      .then((data) => setCourses(data))
  }, [])

  useEffect(() => {
    if (!selectedCourseId) {
      setSelectedCourse(null)
      return
    }
    fetch(`${API_URL}/api/courses/${selectedCourseId}`)
      .then((res) => res.json())
      .then((data) => setSelectedCourse(data))
  }, [selectedCourseId])

  useEffect(() => {
    if (!selectedCourse) {
      setStudents([])
      return
    }
    console.log('Fetching students for semester:', selectedCourse.Semester)
    fetch(`${API_URL}/api/students/by-semester/list?Semester=${selectedCourse.Semester}`)
      .then((res) => res.json())
      .then((data) => {
        const sorted = [...data].sort((a, b) => a.USN.localeCompare(b.USN))
        setStudents(sorted)
      })
  }, [selectedCourse])

  return (
    <div className="w-full font-mono">
      <div className="flex items-center gap-4 mb-6 p-4 bg-slate-50 rounded-lg border">
        <div>
          <label className="text-sm font-semibold mr-2">Course Code:</label>
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="border px-2 py-1 rounded"
          >
            <option value="">-- Select --</option>
            {courses.map((c) => (
              <option key={c._id} value={c._id}>{c.CourseCode}</option>
            ))}
          </select>
        </div>

        {selectedCourse && (
          <>
            <div className="text-sm">
              <span className="font-semibold">Subject:</span> {selectedCourse.CourseTitle}
            </div>
            <div className="text-sm">
              <span className="font-semibold">Semester:</span> {selectedCourse.Semester}
            </div>
          </>
        )}
      </div>

      {selectedCourse && (
        <table className="w-full border-collapse bg-white shadow-sm rounded overflow-hidden">
          <thead>
            <tr className="bg-slate-800 text-white text-left">
              <th className="px-4 py-2">USN</th>
              <th className="px-4 py-2">Student Name</th>
              <th className="px-4 py-2">Section</th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-3 text-center text-slate-500">
                  No students found for Semester {selectedCourse.Semester}
                </td>
              </tr>
            )}
            {students.map((s) => (
              <tr key={s._id} className="border-b hover:bg-blue-50">
                <td className="px-4 py-2">{s.USN}</td>
                <td className="px-4 py-2">{s.StudentName}</td>
                <td className="px-4 py-2">{s.Section || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default CourseStudentMap