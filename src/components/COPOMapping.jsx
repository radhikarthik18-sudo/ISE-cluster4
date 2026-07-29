import { useState, useEffect } from 'react'
import { API_URL } from '../config'

const PO_LABELS = Array.from({ length: 12 }, (_, i) => `PO${i + 1}`)
const PSO_LABELS = ['PSO1', 'PSO2', 'PSO3']
const ALL_COLUMNS = [...PO_LABELS, ...PSO_LABELS]

function COPOMapping() {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const authHeaders = { 'Authorization': `Bearer ${localStorage.getItem('token')}` }

  const [myMappings, setMyMappings] = useState([])
  const [selectedMappingId, setSelectedMappingId] = useState('')
  const [selectedCourse, setSelectedCourse] = useState(null)

  const [cos, setCos] = useState([])
  const [poTexts, setPoTexts] = useState({})   // { PO1: 'text', ... }
  const [psoTexts, setPsoTexts] = useState({})
  const [levels, setLevels] = useState({})      // { 'CO1_PO1': '2', ... }

  useEffect(() => {
    fetch(`${API_URL}/api/course-faculty-map/by-faculty/${user.FacultyID}`, { headers: authHeaders })
      .then((res) => res.json())
      .then((data) => setMyMappings(data))
  }, [])

  useEffect(() => {
    const found = myMappings.find((m) => m._id === selectedMappingId)
    setSelectedCourse(found || null)
    if (!found) return

    // Load this course's COs (from CO Allocation)
    fetch(`${API_URL}/api/co-allocation/by-course/${found.CourseCode}`, { headers: authHeaders })
      .then((res) => res.json())
      .then((data) => setCos(data?.COs || []))

    // Load existing CO-PO Mapping, if any
    fetch(`${API_URL}/api/copo-mapping/by-course/${found.CourseCode}`, { headers: authHeaders })
      .then((res) => res.json())
      .then((data) => {
        const poObj = {}
        PO_LABELS.forEach((p) => {
          poObj[p] = data?.POs?.find((x) => x.Label === p)?.Text || ''
        })
        setPoTexts(poObj)

        const psoObj = {}
        PSO_LABELS.forEach((p) => {
          psoObj[p] = data?.PSOs?.find((x) => x.Label === p)?.Text || ''
        })
        setPsoTexts(psoObj)

        const levelObj = {}
        ;(data?.Mapping || []).forEach((cell) => {
          levelObj[`${cell.CO}_${cell.Outcome}`] = cell.Level
        })
        setLevels(levelObj)
      })
  }, [selectedMappingId, myMappings])

  const updateLevel = (co, outcome, value) => {
    setLevels((prev) => ({ ...prev, [`${co}_${outcome}`]: value }))
  }

  const handleSave = async () => {
    if (!selectedCourse) {
      alert('Please select a subject')
      return
    }

    const POs = PO_LABELS.map((p) => ({ Label: p, Text: poTexts[p] || '' }))
    const PSOs = PSO_LABELS.map((p) => ({ Label: p, Text: psoTexts[p] || '' }))

    const Mapping = []
    cos.forEach((co) => {
      ALL_COLUMNS.forEach((col) => {
        const level = levels[`${co.Label}_${col}`]
        if (level) {
          Mapping.push({ CO: co.Label, Outcome: col, Level: level })
        }
      })
    })

    const res = await fetch(`${API_URL}/api/copo-mapping`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
      body: JSON.stringify({
        CourseCode: selectedCourse.CourseCode,
        CourseTitle: selectedCourse.CourseTitle,
        POs, PSOs, Mapping,
      }),
    })
    const data = await res.json()
    if (!res.ok) {
      alert(data.error || 'Failed to save')
      return
    }
    alert('CO-PO Mapping saved!')
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

      {selectedCourse && cos.length === 0 && (
        <p className="text-sm text-slate-500">
          No Course Outcomes found for this subject. Please complete CO Allocation first.
        </p>
      )}

      {selectedCourse && cos.length > 0 && (
        <>
          <div className="card mb-6">
            <h3 className="section-title">Program Outcomes (PO) — Text</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {PO_LABELS.map((p) => (
                <div key={p} className="flex gap-2 items-center">
                  <span className="text-xs font-semibold w-10 shrink-0">{p}</span>
                  <input
                    type="text"
                    value={poTexts[p] || ''}
                    onChange={(e) => setPoTexts((prev) => ({ ...prev, [p]: e.target.value }))}
                    className="field-input text-sm"
                  />
                </div>
              ))}
            </div>

            <h3 className="section-title mt-6">Program Specific Outcomes (PSO) — Text</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {PSO_LABELS.map((p) => (
                <div key={p} className="flex gap-2 items-center">
                  <span className="text-xs font-semibold w-10 shrink-0">{p}</span>
                  <input
                    type="text"
                    value={psoTexts[p] || ''}
                    onChange={(e) => setPsoTexts((prev) => ({ ...prev, [p]: e.target.value }))}
                    className="field-input text-sm"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto card">
            <h3 className="section-title">CO-PO / CO-PSO Mapping (Level 1-3)</h3>
            <table className="border-collapse text-xs w-full">
              <thead>
                <tr className="bg-slate-800 text-white">
                  <th className="border px-2 py-1">CO</th>
                  {ALL_COLUMNS.map((col) => (
                    <th key={col} className="border px-2 py-1">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cos.map((co) => (
                  <tr key={co.Label}>
                    <td className="border px-2 py-1 font-semibold">{co.Label}</td>
                    {ALL_COLUMNS.map((col) => (
                      <td key={col} className="border p-0">
                        <select
                          value={levels[`${co.Label}_${col}`] || ''}
                          onChange={(e) => updateLevel(co.Label, col, e.target.value)}
                          className="w-full text-center border-0 focus:outline-none py-1"
                        >
                          <option value=""></option>
                          <option value="1">1</option>
                          <option value="2">2</option>
                          <option value="3">3</option>
                        </select>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>

            <button onClick={handleSave} className="btn-primary text-sm mt-4">
              Save Mapping
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default COPOMapping