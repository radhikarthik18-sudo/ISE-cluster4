import { useState, useEffect } from 'react'
import { API_URL } from '../config'

const PO_TEXTS = {
  PO1: 'Engineering Knowledge: Apply knowledge of mathematics, natural science, computing, engineering fundamentals and an engineering specialization as specified in WK1 to WK4 respectively to develop to the solution of complex engineering problems.',
  PO2: 'Problem Analysis: Identify, formulate, review research literature and analyze complex engineering problems reaching substantiated conclusions with consideration for sustainable development. (WK1 to WK4)',
  PO3: 'Design/Development of Solutions: Design creative solutions for complex engineering problems and design/develop systems/components/processes to meet identified needs with consideration for the public health and safety, whole-life cost, net zero carbon, culture, society and environment as required. (WK5)',
  PO4: 'Conduct Investigations of Complex Problems: Conduct investigations of complex engineering problems using research-based knowledge including design of experiments, modelling, analysis & interpretation of data to provide valid conclusions. (WK8)',
  PO5: 'Engineering Tool Usage: Create, select and apply appropriate techniques, resources and modern engineering & IT tools, including prediction and modelling recognizing their limitations to solve complex engineering problems. (WK2 and WK6)',
  PO6: 'The Engineer and The World: Analyze and evaluate societal and environmental aspects while solving complex engineering problems for its impact on sustainability with reference to economy, health, safety, legal framework, culture and environment. (WK1, WK5, and WK7)',
  PO7: 'Ethics: Apply ethical principles and commit to professional ethics, human values, diversity and inclusion; adhere to national & international laws. (WK9)',
  PO8: 'Individual and Collaborative Team work: Function effectively as an individual, and as a member or leader in diverse/multi-disciplinary teams.',
  PO9: 'Communication: Communicate effectively and inclusively within the engineering community and society at large, such as being able to comprehend and write effective reports and design documentation, make effective presentations considering cultural, language, and learning differences.',
  PO10: 'Project Management and Finance: Apply knowledge and understanding of engineering management principles and economic decision-making and apply these to one\u2019s own work, as a member and leader in a team, and to manage projects and in multidisciplinary environments.',
  PO11: 'Life-Long Learning: Recognize the need for, and have the preparation and ability for i) independent and life-long learning ii) adaptability to new and emerging technologies and iii) critical thinking in the broadest context of technological change. (WK8)',
}

const PSO_TEXTS = {
  PSO1: 'Apply theoretical foundations, Algorithmic principles and software engineering practices to develop efficient and scalable IT solutions.',
  PSO2: 'Design effective systems by leveraging principles of computing and communication technologies.',
}

const WK_TEXTS = {
  WK1: 'A systematic, theory-based understanding of the natural sciences applicable to the discipline and awareness of relevant social sciences.',
  WK2: 'Conceptually-based mathematics, numerical analysis, data analysis, statistics and formal aspects of computer and information science to support detailed analysis and modelling applicable to the discipline.',
  WK3: 'A systematic, theory-based formulation of engineering fundamentals required in the engineering discipline.',
  WK4: 'Engineering specialist knowledge that provides theoretical frameworks and bodies of knowledge for the accepted practice areas in the engineering discipline; much is at the forefront of the discipline.',
  WK5: 'Knowledge, including efficient resource use, environmental impacts, whole-life cost, reuse of resources, net zero carbon, and similar concepts, that supports engineering design and operations in a practice area.',
  WK6: 'Knowledge of engineering practice (technology) in the practice areas in the engineering discipline.',
  WK7: 'Knowledge of the role of engineering in society and identified issues in engineering practice in the discipline, such as the professional responsibility of an engineer to public safety and sustainable development.',
  WK8: 'Engagement with selected knowledge in the current research literature of the discipline, awareness of the power of critical thinking and creative approaches to evaluate emerging issues.',
  WK9: 'Ethics, inclusive behavior and conduct. Knowledge of professional ethics, responsibilities, and norms of engineering practice. Awareness of the need for diversity by reason of ethnicity, gender, age, physical ability etc. with mutual understanding and respect, and of inclusive attitudes.',
}

const PO_LABELS = Array.from({ length: 11 }, (_, i) => `PO${i + 1}`)
const PSO_LABELS = ['PSO1', 'PSO2']
const ALL_COLUMNS = [...PO_LABELS, ...PSO_LABELS]

function COPOMapping() {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const authHeaders = { 'Authorization': `Bearer ${localStorage.getItem('token')}` }

  const [myMappings, setMyMappings] = useState([])
  const [selectedMappingId, setSelectedMappingId] = useState('')
  const [selectedCourse, setSelectedCourse] = useState(null)

  const [cos, setCos] = useState([])
  const [levels, setLevels] = useState({})
  const [showReference, setShowReference] = useState(false)

  useEffect(() => {
    fetch(`${API_URL}/api/course-faculty-map/by-faculty/${user.FacultyID}`, { headers: authHeaders })
      .then((res) => res.json())
      .then((data) => setMyMappings(data))
  }, [])

  useEffect(() => {
    const found = myMappings.find((m) => m._id === selectedMappingId)
    setSelectedCourse(found || null)
    if (!found) return

    fetch(`${API_URL}/api/co-allocation/by-course/${found.CourseCode}`, { headers: authHeaders })
      .then((res) => res.json())
      .then((data) => setCos(data?.COs || []))

    fetch(`${API_URL}/api/copo-mapping/by-course/${found.CourseCode}`, { headers: authHeaders })
      .then((res) => res.json())
      .then((data) => {
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

    const POs = PO_LABELS.map((p) => ({ Label: p, Text: PO_TEXTS[p] }))
    const PSOs = PSO_LABELS.map((p) => ({ Label: p, Text: PSO_TEXTS[p] }))

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
          <div className="overflow-x-auto card mb-8">
            <h3 className="section-title">CO-PO / CO-PSO Mapping (Level 1-3) — {selectedCourse.CourseTitle}</h3>
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
                          <option value="">-</option>
                          <option value="1">L-1</option>
                          <option value="2">M-2</option>
                          <option value="3">H-3</option>
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

          <div className="card">
            <button
              onClick={() => setShowReference((prev) => !prev)}
              className="text-sm font-semibold text-slate-700 flex items-center gap-2"
            >
              {showReference ? '▾' : '▸'} PO / PSO / WK Reference
            </button>

            {showReference && (
              <div className="mt-4 space-y-8">
                <div>
                  <h4 className="font-semibold text-slate-800 mb-2 text-sm">Program Outcomes (PO)</h4>
                  <table className="border-collapse text-xs w-full">
                    <tbody>
                      {PO_LABELS.map((p) => (
                        <tr key={p} className="border-b">
                          <td className="border px-2 py-2 font-semibold align-top w-16 bg-slate-50">{p}</td>
                          <td className="border px-2 py-2">{PO_TEXTS[p]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-800 mb-2 text-sm">Program Specific Outcomes (PSO)</h4>
                  <table className="border-collapse text-xs w-full">
                    <tbody>
                      {PSO_LABELS.map((p) => (
                        <tr key={p} className="border-b">
                          <td className="border px-2 py-2 font-semibold align-top w-16 bg-slate-50">{p}</td>
                          <td className="border px-2 py-2">{PSO_TEXTS[p]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-800 mb-2 text-sm">Knowledge and Attitude Profile (WK)</h4>
                  <table className="border-collapse text-xs w-full">
                    <tbody>
                      {Object.keys(WK_TEXTS).map((w) => (
                        <tr key={w} className="border-b">
                          <td className="border px-2 py-2 font-semibold align-top w-16 bg-slate-50">{w}</td>
                          <td className="border px-2 py-2">{WK_TEXTS[w]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default COPOMapping