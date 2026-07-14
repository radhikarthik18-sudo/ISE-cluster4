import { useState } from 'react'
import CourseListView from './CourseListView'
import { API_URL } from '../config'
function CourseList() {
  const [formData, setFormData] = useState({
    CourseCategory: '',
    CourseCode: '',
    CourseTitle: '',
    Semester: '',
    L: '',
    T: '',
    P: '',
    S: '',
    Credits: '',
  })
  const [showList, setShowList] = useState(false)

  const categories = ['HSMC', 'IPCC', 'PCC', 'PCCL', 'PEC', 'PW', 'AEC', 'MC', 'NCMC']
  const hourOptions = [0, 1, 2, 3, 4]
  const creditOptions = [1, 2, 3, 4]

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    const res = await fetch(`${API_URL}/api/courses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })
    const data = await res.json()

    if (!res.ok) {
      alert(data.error || 'Failed to save course')
      return
    }
    alert('Course saved!')
    setFormData({
      CourseCategory: '', CourseCode: '', CourseTitle: '', Semester: '',
      L: '', T: '', P: '', S: '', Credits: '',
    })
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
              className="border px-2 py-1 rounded w-full"
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

      </div>

      <div className="flex gap-3 mt-4">
        <button
          onClick={handleSave}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Save
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
          <CourseListView />
        </div>
      )}
    </div>
  )
}

export default CourseList