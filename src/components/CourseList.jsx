import { useState, useEffect } from 'react'
import { API_URL } from '../config'

function CourseList({ existingCourse, onSaveComplete }) {
  const [formData, setFormData] = useState({
    CourseCategory: '',
    CourseCode: '',
    CourseTitle: '',
    Initial: '',
    Semester: '',
    L: '',
    T: '',
    P: '',
    S: '',
    Credits: '',
  })
  const [syllabusFile, setSyllabusFile] = useState(null)

  const isEditMode = Boolean(existingCourse)
  const authHeaders = { 'Authorization': `Bearer ${localStorage.getItem('token')}` }

  const categories = ['HSMC', 'IPCC', 'PCC', 'PCCL', 'PEC', 'PW', 'AEC', 'MC', 'NCMC']
  const hourOptions = [0, 1, 2, 3, 4]
  const creditOptions = [1, 2, 3, 4]

  useEffect(() => {
    if (existingCourse) {
      setFormData({
        CourseCategory: existingCourse.CourseCategory || '',
        CourseCode: existingCourse.CourseCode || '',
        CourseTitle: existingCourse.CourseTitle || '',
        Initial: existingCourse.Initial || '',
        Semester: existingCourse.Semester || '',
        L: existingCourse.L || '',
        T: existingCourse.T || '',
        P: existingCourse.P || '',
        S: existingCourse.S || '',
        Credits: existingCourse.Credits || '',
      })
    }
  }, [existingCourse])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSyllabusChange = (e) => {
    const file = e.target.files[0]
    if (file && file.type !== 'application/pdf') {
      alert('Please select a PDF file')
      e.target.value = ''
      return
    }
    setSyllabusFile(file || null)
  }

  const handleSave = async () => {
    const payload = new FormData()
    Object.entries(formData).forEach(([key, value]) => payload.append(key, value))
    if (syllabusFile) {
      payload.append('SyllabusPDF', syllabusFile)
    }

    const url = isEditMode ? `${API_URL}/api/courses/${existingCourse._id}` : `${API_URL}/api/courses`
    const method = isEditMode ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: authHeaders,
      body: payload,
    })
    const data = await res.json()

    if (!res.ok) {
      alert(data.error || 'Failed to save course')
      return
    }
    alert(isEditMode ? 'Course updated!' : 'Course saved!')

    if (isEditMode) {
      if (onSaveComplete) onSaveComplete()
    } else {
      setFormData({
        CourseCategory: '', CourseCode: '', CourseTitle: '', Initial: '', Semester: '',
        L: '', T: '', P: '', S: '', Credits: '',
      })
      setSyllabusFile(null)
    }
  }

  return (
    <div className="w-full font-mono max-w-3xl">
      <div className="border rounded-lg p-4 bg-white shadow-sm space-y-4">

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Course Category</label>
          <select
            name="CourseCategory"
            value={formData.CourseCategory}
            onChange={handleChange}
            className="border px-2 py-1 rounded w-full"
          >
            <option value="">-- Select --</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Course Code</label>
            <input
              type="text"
              name="CourseCode"
              value={formData.CourseCode}
              onChange={handleChange}
              disabled={isEditMode}
              className="border px-2 py-1 rounded w-full disabled:bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Course Title</label>
            <input
              type="text"
              name="CourseTitle"
              value={formData.CourseTitle}
              onChange={handleChange}
              className="border px-2 py-1 rounded w-full"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">
            Initial <span className="text-xs text-gray-400 font-normal">(short code shown on compact timetable views, e.g. INS, PC, PE)</span>
          </label>
          <input
            type="text"
            name="Initial"
            value={formData.Initial}
            onChange={handleChange}
            maxLength={6}
            className="border px-2 py-1 rounded w-32"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Semester</label>
          <select
            name="Semester"
            value={formData.Semester}
            onChange={handleChange}
            className="border px-2 py-1 rounded w-32"
          >
            <option value="">-- Select --</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
              <option key={sem} value={sem}>{sem}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">Teaching Hours</label>
          <div className="grid grid-cols-4 gap-4">
            {['L', 'T', 'P', 'S'].map((field) => (
              <div key={field}>
                <label className="block text-xs font-semibold mb-1 text-gray-500">{field}</label>
                <select
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                  className="border px-2 py-1 rounded w-full"
                >
                  <option value="">-</option>
                  {hourOptions.map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Credits</label>
          <select
            name="Credits"
            value={formData.Credits}
            onChange={handleChange}
            className="border px-2 py-1 rounded w-32"
          >
            <option value="">-</option>
            {creditOptions.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">
            Syllabus (ONLY PDF) {isEditMode && <span className="text-xs text-gray-400 font-normal">— leave blank to keep existing file</span>}
          </label>
          <input
            type="file"
            accept="application/pdf"
            onChange={handleSyllabusChange}
            className="block text-sm border rounded px-2 py-1.5 w-full"
          />
          {syllabusFile && (
            <p className="text-xs text-slate-500 mt-1">Selected: {syllabusFile.name}</p>
          )}
        </div>

      </div>

      <div className="flex gap-3 mt-4">
        <button
          onClick={handleSave}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {isEditMode ? 'Update' : 'Save'}
        </button>
      </div>
    </div>
  )
}

export default CourseList