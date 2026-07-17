import { useState, useEffect } from 'react'
import { API_URL } from '../config'

const TEACHING_METHODS = ['Chalk and Board', 'Presentation', 'Video']

function LessonPlanEntry() {
  const [courses, setCourses] = useState([])
  const [plans, setPlans] = useState([])
  const [selectedPlanId, setSelectedPlanId] = useState('')

  const [selectedCourseId, setSelectedCourseId] = useState('')
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [modules, setModules] = useState([])

  useEffect(() => {
    fetch(`${API_URL}/api/courses`)
      .then((res) => res.json())
      .then((data) => setCourses(data))

    loadPlanList()
  }, [])

  const loadPlanList = () => {
    fetch(`${API_URL}/api/lesson-plan`)
      .then((res) => res.json())
      .then((data) => setPlans(data))
  }

  // Loading an existing plan for editing
  useEffect(() => {
    if (!selectedPlanId) {
      setSelectedCourseId('')
      setSelectedCourse(null)
      setModules([])
      return
    }
    fetch(`${API_URL}/api/lesson-plan/${selectedPlanId}`)
      .then((res) => res.json())
      .then((data) => {
        setModules(data.Modules || [])
        setSelectedCourse({ CourseCode: data.CourseCode, CourseTitle: data.CourseTitle })
      })
  }, [selectedPlanId])

  useEffect(() => {
    if (!selectedCourseId) {
      setSelectedCourse(null)
      return
    }
    fetch(`${API_URL}/api/courses/${selectedCourseId}`)
      .then((res) => res.json())
      .then((data) => setSelectedCourse(data))
  }, [selectedCourseId])

  const addModule = () => {
    setModules((prev) => [
      ...prev,
      { ModuleNumber: String(prev.length + 1), Hours: '', Topics: [] },
    ])
  }

  const removeModule = (moduleIndex) => {
    setModules((prev) => prev.filter((_, i) => i !== moduleIndex))
  }

  const updateModuleField = (moduleIndex, field, value) => {
    setModules((prev) =>
      prev.map((mod, i) => (i === moduleIndex ? { ...mod, [field]: value } : mod))
    )
  }

  const addTopic = (moduleIndex) => {
    setModules((prev) =>
      prev.map((mod, i) =>
        i === moduleIndex
          ? { ...mod, Topics: [...mod.Topics, { TopicName: '', TeachingMethod: TEACHING_METHODS[0] }] }
          : mod
      )
    )
  }

  const removeTopic = (moduleIndex, topicIndex) => {
    setModules((prev) =>
      prev.map((mod, i) =>
        i === moduleIndex
          ? { ...mod, Topics: mod.Topics.filter((_, ti) => ti !== topicIndex) }
          : mod
      )
    )
  }

  const updateTopicField = (moduleIndex, topicIndex, field, value) => {
    setModules((prev) =>
      prev.map((mod, i) =>
        i === moduleIndex
          ? {
              ...mod,
              Topics: mod.Topics.map((t, ti) =>
                ti === topicIndex ? { ...t, [field]: value } : t
              ),
            }
          : mod
      )
    )
  }

  const handleSave = async () => {
    if (!selectedCourse) {
      alert('Please select a Course')
      return
    }

    const isUpdate = Boolean(selectedPlanId)
    const url = isUpdate ? `${API_URL}/api/lesson-plan/${selectedPlanId}` : `${API_URL}/api/lesson-plan`
    const method = isUpdate ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        CourseCode: selectedCourse.CourseCode,
        CourseTitle: selectedCourse.CourseTitle,
        Modules: modules,
      }),
    })
    const data = await res.json()

    if (!res.ok) {
      alert(data.error || 'Failed to save')
      return
    }
    alert(isUpdate ? 'Lesson Plan updated!' : 'Lesson Plan saved!')
    loadPlanList()
    if (!isUpdate) setSelectedPlanId(data._id)
  }

  return (
    <div className="w-full font-mono">
      <div className="mb-4 flex items-center gap-3">
        <label className="text-sm font-medium">Select Lesson Plan:</label>
        <select
          value={selectedPlanId}
          onChange={(e) => setSelectedPlanId(e.target.value)}
          className="border px-2 py-1 rounded"
        >
          <option value="">+ New Lesson Plan</option>
          {plans.map((p) => (
            <option key={p._id} value={p._id}>{p.CourseCode} - {p.CourseTitle}</option>
          ))}
        </select>
      </div>

      {!selectedPlanId && (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1 text-gray-700">Course Code</label>
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="border px-2 py-1 rounded w-64"
          >
            <option value="">-- Select --</option>
            {courses.map((c) => (
              <option key={c._id} value={c._id}>{c.CourseCode}</option>
            ))}
          </select>
        </div>
      )}

      {selectedCourse && (
        <div className="mb-4 text-sm">
          <span className="font-semibold">Course:</span> {selectedCourse.CourseTitle} ({selectedCourse.CourseCode})
        </div>
      )}

      {selectedCourse && (
        <div className="space-y-4">
          {modules.map((mod, moduleIndex) => (
            <div key={moduleIndex} className="border rounded-lg p-4 bg-white shadow-sm">
              <div className="flex items-center gap-4 mb-3">
                <span className="font-semibold">Module {mod.ModuleNumber}</span>
                <label className="text-sm">Hours:</label>
                <input
                  type="text"
                  value={mod.Hours}
                  onChange={(e) => updateModuleField(moduleIndex, 'Hours', e.target.value)}
                  className="border px-2 py-1 rounded w-16"
                />
                <button
                  onClick={() => removeModule(moduleIndex)}
                  className="ml-auto text-red-600 text-sm hover:underline"
                >
                  Remove Module
                </button>
              </div>

              <table className="w-full border-collapse text-sm mb-2">
                <thead>
                  <tr className="bg-slate-800 text-white text-left">
                    <th className="border px-2 py-1">Topic Name</th>
                    <th className="border px-2 py-1 w-56">Teaching Method</th>
                    <th className="border px-2 py-1 w-16">Remove</th>
                  </tr>
                </thead>
                <tbody>
                  {mod.Topics.map((topic, topicIndex) => (
                    <tr key={topicIndex}>
                      <td className="border px-2 py-1">
                        <input
                          type="text"
                          value={topic.TopicName}
                          onChange={(e) => updateTopicField(moduleIndex, topicIndex, 'TopicName', e.target.value)}
                          className="w-full border-0 focus:outline-none"
                        />
                      </td>
                      <td className="border px-2 py-1">
                        <select
                          value={topic.TeachingMethod}
                          onChange={(e) => updateTopicField(moduleIndex, topicIndex, 'TeachingMethod', e.target.value)}
                          className="w-full border-0 focus:outline-none"
                        >
                          {TEACHING_METHODS.map((m) => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                      </td>
                      <td className="border px-2 py-1 text-center">
                        <button
                          onClick={() => removeTopic(moduleIndex, topicIndex)}
                          className="text-red-600 font-bold"
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <button
                onClick={() => addTopic(moduleIndex)}
                className="text-blue-600 text-sm hover:underline"
              >
                + Add Topic
              </button>
            </div>
          ))}

          <button
            onClick={addModule}
            className="bg-slate-700 text-white px-4 py-2 rounded hover:bg-slate-800"
          >
            + Add Module
          </button>

          <div>
            <button
              onClick={handleSave}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              {selectedPlanId ? 'Update Lesson Plan' : 'Save Lesson Plan'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default LessonPlanEntry