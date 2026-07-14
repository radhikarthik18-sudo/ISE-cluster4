import { useState, useEffect } from 'react'
import CourseFacultyMapView from './CourseFacultyMapView'
function CourseFacultyMap() {
  const [courses, setCourses] = useState([])
  const [facultyList, setFacultyList] = useState([])

  const [selectedCourseId, setSelectedCourseId] = useState('')
  const [selectedFacultyId, setSelectedFacultyId] = useState('')
  const [section, setSection] = useState('')

  const [selectedCourse, setSelectedCourse] = useState(null)
  const [selectedFaculty, setSelectedFaculty] = useState(null)

  const [showList, setShowList] = useState(false)

  useEffect(() => {
    fetch('http://localhost:5000/api/courses')
      .then((res) => res.json())
      .then((data) => setCourses(data))

    fetch('http://localhost:5000/api/faculty')
      .then((res) => res.json())
      .then((data) => setFacultyList(data))
  }, [])

  // When course selection changes, fetch its full details (for CourseTitle + Credits)
  useEffect(() => {
    if (!selectedCourseId) {
      setSelectedCourse(null)
      return
    }
    fetch(`http://localhost:5000/api/courses/${selectedCourseId}`)
      .then((res) => res.json())
      .then((data) => setSelectedCourse(data))
  }, [selectedCourseId])

  // When faculty selection changes, fetch their full details (for current CreditsAllotted)
  useEffect(() => {
    if (!selectedFacultyId) {
      setSelectedFaculty(null)
      return
    }
    fetch(`http://localhost:5000/api/faculty/${selectedFacultyId}`)
      .then((res) => res.json())
      .then((data) => setSelectedFaculty(data))
  }, [selectedFacultyId])

  // Live preview: faculty's current total + this course's credits
  const previewCredits =
    selectedFaculty && selectedCourse
      ? (Number(selectedFaculty.CreditsAllotted) || 0) + Number(selectedCourse.Credits)
      : ''

  const handleAllocate = async () => {
    if (!selectedCourse || !selectedFaculty || !section) {
      alert('Please select Course, Faculty, and Section')
      return
    }

    const res = await fetch('http://localhost:5000/api/course-faculty-map', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        CourseCode: selectedCourse.CourseCode,
        CourseTitle: selectedCourse.CourseTitle,
        Section: section,
        FacultyID: selectedFaculty.FacultyID,
        FacultyName: selectedFaculty.Name,
        Credits: Number(selectedCourse.Credits),
      }),
    })
    const data = await res.json()

    if (!res.ok) {
      alert(data.error || 'Allocation failed')
      return
    }
    alert('Subject allocated!')
    setSelectedCourseId('')
    setSelectedFacultyId('')
    setSection('')
    setSelectedCourse(null)
    setSelectedFaculty(null)
  }

  return (
    <div className="w-full font-mono max-w-2xl">
      <div className="border rounded-lg p-4 bg-white shadow-sm space-y-4">

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Course Code</label>
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="border px-2 py-1 rounded w-full"
          >
            <option value="">-- Select --</option>
            {courses.map((c) => (
              <option key={c._id} value={c._id}>{c.CourseCode}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Subject Name</label>
          <input
            type="text"
            value={selectedCourse ? selectedCourse.CourseTitle : ''}
            readOnly
            className="border px-2 py-1 rounded w-full bg-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Section</label>
          <select
            value={section}
            onChange={(e) => setSection(e.target.value)}
            className="border px-2 py-1 rounded w-full"
          >
            <option value="">-- Select --</option>
            {['10-J', '11-K', '12-L'].map((sec) => (
              <option key={sec} value={sec}>{sec}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Faculty</label>
          <select
            value={selectedFacultyId}
            onChange={(e) => setSelectedFacultyId(e.target.value)}
            className="border px-2 py-1 rounded w-full"
          >
            <option value="">-- Select --</option>
            {facultyList.map((f) => (
              <option key={f._id} value={f._id}>{f.Name} ({f.FacultyID})</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Already Allocated
            </label>
            <input
              type="text"
              value={selectedFaculty ? (Number(selectedFaculty.CreditsAllotted) || 0) : ''}
              readOnly
              className="border px-2 py-1 rounded w-full bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              After This Allocation
            </label>
            <input
              type="text"
              value={previewCredits}
              readOnly
              className="border px-2 py-1 rounded w-full bg-gray-100"
            />
          </div>
        </div>

      </div>

      <button
        onClick={handleAllocate}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Allocate Subject
      </button>
      <div className="flex gap-3 mt-4">
        <button
          onClick={handleAllocate}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {isReassignMode ? 'Reassign Faculty' : 'Allocate Subject'}
        </button>

        <button
          onClick={() => setShowList((prev) => !prev)}
          className="bg-slate-700 text-white px-4 py-2 rounded hover:bg-slate-800"
        >
          {showList ? 'Hide List' : 'View'}
        </button>
      </div>

      {showList && (
        <div className="mt-6">
          <CourseFacultyMapView />
        </div>
      )}
    </div>
  )
}

export default CourseFacultyMap