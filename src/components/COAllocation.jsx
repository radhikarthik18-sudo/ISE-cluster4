import { useState, useEffect } from 'react'
import { API_URL } from '../config'

function COAllocation() {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const authHeaders = { 'Authorization': `Bearer ${localStorage.getItem('token')}` }

  const [myMappings, setMyMappings] = useState([])
  const [selectedMappingId, setSelectedMappingId] = useState('')
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [cos, setCos] = useState([])

  useEffect(() => {
    fetch(`${API_URL}/api/course-faculty-map/by-faculty/${user.FacultyID}`, { headers: authHeaders })
      .then((res) => res.json())
      .then((data) => setMyMappings(data))
  }, [])

  useEffect(() => {
    const found = myMappings.find((m) => m._id === selectedMappingId)
    setSelectedCourse(found || null)

    if (found) {
      fetch(`${API_URL}/api/co-allocation/by-course/${found.CourseCode}`, { headers: authHeaders })
        .then((res) => res.json())
        .then((data) => {
          setCos(data?.COs?.length ? data.COs : [{ Label: 'CO1', Description: '' }])
        })
    } else {
      setCos([])
    }
  }, [selectedMappingId, myMappings])

  const addCo = () => {
    setCos((prev) => [...prev, { Label: `CO${prev.length + 1}`, Description: '' }])
  }

  const removeCo = (index) => {
    setCos((prev) =>
      prev.filter((_, i) => i !== index).map((co, i) => ({ ...co, Label: `CO${i + 1}` }))
    )
  }

  const updateCo = (index, value) => {
    setCos((prev) => prev.map((co, i) => (i === index ? { ...co, Description: value } : co)))
  }

  const handleSave = async () => {
    if (!selectedCourse) {
      alert('Please select a subject')
      return
    }
    const res = await fetch(`${API_URL}/api/co-allocation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
      body: JSON.stringify({
        CourseCode: selectedCourse.CourseCode,
        CourseTitle: selectedCourse.CourseTitle,
        COs: cos,
      }),
    })
    const data = await res.json()
    if (!res.ok) {
      alert(data.error || 'Failed to save')
      return
    }
    alert('CO Allocation saved!')
  }

  return (
    <div className="w-full font-mono">
      <div className="mb-6">
        <label className="field-label">Allocated Subject</label>
        <select
          value={selectedMappingId}
          onChange={(e) => setSelectedMappingId(e.target.value)}
          className="field-input max-w-md"
        >
          <option value="">-- Select --</option>
          {myMappings.map((m) => (
            <option key={m._id} value={m._id}>{m.CourseCode} - {m.Section}</option>
          ))}
        </select>
      </div>

      {selectedCourse && (
        <div className="card max-w-2xl">
          <h3 className="section-title">{selectedCourse.CourseTitle} — Course Outcomes</h3>

          <div className="space-y-3">
            {cos.map((co, index) => (
              <div key={index} className="flex gap-3 items-start">
                <span className="font-semibold text-sm mt-2 w-12 shrink-0">{co.Label}</span>
                <textarea
                  value={co.Description}
                  onChange={(e) => updateCo(index, e.target.value)}
                  rows={2}
                  className="field-input flex-1"
                />
                <button
                  onClick={() => removeCo(index)}
                  className="text-red-600 font-bold mt-2"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-3 mt-4">
            <button onClick={addCo} className="btn-outline text-sm">+ Add CO</button>
            <button onClick={handleSave} className="btn-primary text-sm">Save</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default COAllocation