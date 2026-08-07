import { useState, useEffect } from 'react'
import { API_URL } from '../config'

function ClassTeacherEntry() {
  const [facultyList, setFacultyList] = useState([])
  const [semester, setSemester] = useState('')
  const [section, setSection] = useState('')
  const [selectedFacultyId, setSelectedFacultyId] = useState('')
  const [currentAssignment, setCurrentAssignment] = useState(null)

  const authHeaders = { 'Authorization': `Bearer ${localStorage.getItem('token')}` }

  useEffect(() => {
    fetch(`${API_URL}/api/faculty?status=all`, { headers: authHeaders })
      .then((res) => res.json())
      .then((data) => setFacultyList(data))
  }, [])

  useEffect(() => {
    if (!semester || !section) {
      setCurrentAssignment(null)
      return
    }
    fetch(`${API_URL}/api/class-teacher/by-section?Semester=${semester}&Section=${section}`, { headers: authHeaders })
      .then((res) => res.json())
      .then((data) => {
        setCurrentAssignment(data)
        setSelectedFacultyId(data ? data.FacultyID : '')
      })
  }, [semester, section])

  const handleSave = async () => {
    if (!semester || !section || !selectedFacultyId) {
      alert('Please select Semester, Section, and Faculty')
      return
    }
    const faculty = facultyList.find((f) => f.FacultyID === selectedFacultyId)

    const res = await fetch(`${API_URL}/api/class-teacher`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
      body: JSON.stringify({
        Semester: semester,
        Section: section,
        FacultyID: faculty.FacultyID,
        FacultyName: faculty.Name,
      }),
    })
    const data = await res.json()
    if (!res.ok) {
      alert(data.error || 'Failed to save')
      return
    }
    alert('Class Teacher assigned!')
    setCurrentAssignment(data)
  }

  return (
    <div className="w-full font-mono">
      <div className="card max-w-lg space-y-4">
        <div>
          <label className="field-label">Semester</label>
          <select
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            className="field-input"
          >
            <option value="">-- Select --</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="field-label">Section</label>
          <select
            value={section}
            onChange={(e) => setSection(e.target.value)}
            className="field-input"
          >
            <option value="">-- Select --</option>
            {['10-J', '11-K', '12-L'].map((sec) => (
              <option key={sec} value={sec}>{sec}</option>
            ))}
          </select>
        </div>

        {currentAssignment && (
          <div className="bg-amber-50 border border-amber-300 rounded px-3 py-2 text-sm text-amber-800">
            Currently assigned: <strong>{currentAssignment.FacultyName}</strong> — selecting a different faculty will reassign.
          </div>
        )}

        <div>
          <label className="field-label">Faculty</label>
          <select
            value={selectedFacultyId}
            onChange={(e) => setSelectedFacultyId(e.target.value)}
            className="field-input"
          >
            <option value="">-- Select --</option>
            {facultyList.map((f) => (
              <option key={f.FacultyID} value={f.FacultyID}>{f.Name} ({f.FacultyID})</option>
            ))}
          </select>
        </div>

        <button onClick={handleSave} className="btn-primary">
          {currentAssignment ? 'Reassign Class Teacher' : 'Assign Class Teacher'}
        </button>
      </div>
    </div>
  )
}

export default ClassTeacherEntry