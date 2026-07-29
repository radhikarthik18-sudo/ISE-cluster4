import { useState, useEffect } from 'react'
import { API_URL } from '../config'

function AttendanceRegister() {
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const [myMappings, setMyMappings] = useState([])
  const [selectedMappingId, setSelectedMappingId] = useState('')
  const [selectedMapping, setSelectedMapping] = useState(null)

  const [date, setDate] = useState('')
  const [lessonPlan, setLessonPlan] = useState(null)
  const [selectedModuleIndex, setSelectedModuleIndex] = useState('')
  const [selectedTopicIndex, setSelectedTopicIndex] = useState('')

  const [students, setStudents] = useState([])
  const [pastRecords, setPastRecords] = useState([])
  const [marks, setMarks] = useState({})

  // Load only THIS faculty's assigned Course+Section combinations
  useEffect(() => {
    fetch(`${API_URL}/api/course-faculty-map/by-faculty/${user.FacultyID}`)
      .then((res) => res.json())
      .then((data) => setMyMappings(data))
  }, [])

  useEffect(() => {
    const found = myMappings.find((m) => m._id === selectedMappingId)
    setSelectedMapping(found || null)
  }, [selectedMappingId, myMappings])

  // Load the course's own details (needed for Semester, used in roster lookup)
  const [courseDetails, setCourseDetails] = useState(null)
  useEffect(() => {
    if (!selectedMapping) {
      setCourseDetails(null)
      return
    }
    fetch(`${API_URL}/api/courses`)
      .then((res) => res.json())
      .then((courses) => {
        const match = courses.find((c) => c.CourseCode === selectedMapping.CourseCode)
        if (match) {
          fetch(`${API_URL}/api/courses/${match._id}`)
            .then((res) => res.json())
            .then((data) => setCourseDetails(data))
        }
      })
  }, [selectedMapping])

  useEffect(() => {
    if (!selectedMapping) {
      setLessonPlan(null)
      return
    }
    fetch(`${API_URL}/api/lesson-plan/by-course/${selectedMapping.CourseCode}`)
      .then((res) => res.json())
      .then((data) => setLessonPlan(data))
  }, [selectedMapping])

  useEffect(() => {
    if (!selectedMapping || !courseDetails) {
      setStudents([])
      return
    }
    fetch(`${API_URL}/api/students/by-semester/list?Semester=${courseDetails.Semester}`)
      .then((res) => res.json())
      .then((data) => {
        const inSection = data.filter((s) => s.Section === selectedMapping.Section)
        const sorted = [...inSection].sort((a, b) => a.USN.localeCompare(b.USN))
        setStudents(sorted)
        const initialMarks = {}
        sorted.forEach((s) => { initialMarks[s.USN] = 'P' })
        setMarks(initialMarks)
      })
  }, [selectedMapping, courseDetails])

  useEffect(() => {
    if (!selectedMapping) {
      setPastRecords([])
      return
    }
    fetch(`${API_URL}/api/attendance?CourseCode=${selectedMapping.CourseCode}&Section=${selectedMapping.Section}`)
      .then((res) => res.json())
      .then((data) => setPastRecords(data))
  }, [selectedMapping])

  const computeAttendanceStats = (usn) => {
    const relevant = pastRecords.flatMap((rec) => rec.Marks).filter((m) => m.USN === usn)
    const totalClasses = relevant.length
    if (totalClasses === 0) return { text: '—' }
    const present = relevant.filter((m) => m.Status === 'P').length
    const percent = Math.round((present / totalClasses) * 100)
    return { text: `${percent}% (${present}/${totalClasses})` }
  }

  const toggleMark = (usn) => {
    setMarks((prev) => ({ ...prev, [usn]: prev[usn] === 'P' ? 'A' : 'P' }))
  }

  const modules = lessonPlan?.Modules || []
  const topics = selectedModuleIndex !== '' ? modules[selectedModuleIndex]?.Topics || [] : []

  const handleSubmit = async () => {
    if (!selectedMapping || !date || selectedModuleIndex === '' || selectedTopicIndex === '') {
      alert('Please select Course/Section, Date, Module, and Topic before submitting')
      return
    }
    if (students.length === 0) {
      alert('No students found for this Course/Section')
      return
    }

    const payload = {
      CourseCode: selectedMapping.CourseCode,
      CourseTitle: selectedMapping.CourseTitle,
      Section: selectedMapping.Section,
      Date: date,
      ModuleNumber: modules[selectedModuleIndex].ModuleNumber,
      TopicName: topics[selectedTopicIndex].TopicName,
      Marks: students.map((s) => ({
        USN: s.USN,
        StudentName: s.StudentName,
        Status: marks[s.USN] || 'A',
      })),
    }

    const res = await fetch(`${API_URL}/api/attendance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await res.json()

    if (!res.ok) {
      alert(data.error || 'Failed to submit attendance')
      return
    }

    alert('Attendance submitted!')
    setSelectedMappingId('')
    setSelectedMapping(null)
    setDate('')
    setSelectedModuleIndex('')
    setSelectedTopicIndex('')
    setStudents([])
    setMarks({})
  }

  return (
    <div className="w-full font-mono">
      <div className="flex flex-wrap items-end gap-4 mb-6 p-4 bg-slate-50 rounded-lg border">
        <div>
          <label className="block text-sm font-medium mb-1">Course / Section</label>
          <select
            value={selectedMappingId}
            onChange={(e) => setSelectedMappingId(e.target.value)}
            className="border px-2 py-1 rounded"
          >
            <option value="">-- Select --</option>
            {myMappings.map((m) => (
              <option key={m._id} value={m._id}>
                {m.CourseCode} - {m.Section}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border px-2 py-1 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Module</label>
          <select
            value={selectedModuleIndex}
            onChange={(e) => {
              setSelectedModuleIndex(e.target.value)
              setSelectedTopicIndex('')
            }}
            className="border px-2 py-1 rounded"
          >
            <option value="">-- Select --</option>
            {modules.map((m, i) => (
              <option key={i} value={i}>Module {m.ModuleNumber}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Topic</label>
          <select
            value={selectedTopicIndex}
            onChange={(e) => setSelectedTopicIndex(e.target.value)}
            className="border px-2 py-1 rounded"
            disabled={selectedModuleIndex === ''}
          >
            <option value="">-- Select --</option>
            {topics.map((t, i) => (
              <option key={i} value={i}>{t.TopicName}</option>
            ))}
          </select>
        </div>
      </div>

      {students.length > 0 && (
        <div>
          <table className="w-full border-collapse bg-white shadow-sm rounded overflow-hidden">
            <thead>
              <tr className="bg-slate-800 text-white text-left">
                <th className="px-4 py-2">USN</th>
                <th className="px-4 py-2">Student Name</th>
                <th className="px-4 py-2">Attendance (Total Classes Taken)</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s._id} className="border-b">
                  <td className="px-4 py-2">{s.USN}</td>
                  <td className="px-4 py-2">{s.StudentName}</td>
                  <td className="px-4 py-2">{computeAttendanceStats(s.USN).text}</td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => toggleMark(s.USN)}
                      className={`px-4 py-1 rounded font-semibold text-white ${
                        marks[s.USN] === 'P' ? 'bg-green-600' : 'bg-red-600'
                      }`}
                    >
                      {marks[s.USN]}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button
            onClick={handleSubmit}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Submit Attendance
          </button>
        </div>
      )}
    </div>
  )
}

export default AttendanceRegister