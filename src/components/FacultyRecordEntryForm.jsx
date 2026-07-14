import { useState, useEffect } from 'react'
import { API_URL } from '../config'

function FacultyEntryForm({ existingFaculty, onSaveComplete }) {
  const [formData, setFormData] = useState({
    FacultyID: '',
    Name: '',
    Email: '',
    Phone: '',
    DateOfJoining: '',
    Designation: '',
    Qualification: '',
    Experience: '',
    Specialization: '',
    Password: '',
  })
  const [file, setFile] = useState(null)

  const isEditMode = Boolean(existingFaculty)

  // Pre-fill form when editing an existing faculty member
  useEffect(() => {
    if (existingFaculty) {
      setFormData({
        FacultyID: existingFaculty.FacultyID || '',
        Name: existingFaculty.Name || '',
        Email: existingFaculty.Email || '',
        Phone: existingFaculty.Phone || '',
        DateOfJoining: existingFaculty.DateOfJoining
          ? existingFaculty.DateOfJoining.slice(0, 10)
          : '',
        Designation: existingFaculty.Designation || '',
        Qualification: existingFaculty.Qualification || '',
        Experience: existingFaculty.Experience || '',
        Specialization: existingFaculty.Specialization || '',
        Password: '', // never pre-fill password
      })
    }
  }, [existingFaculty])

  const generatePassword = () => {
    if (!formData.Name) {
      alert('Please enter Name first')
      return
    }
    const randomDigits = Math.floor(1000 + Math.random() * 9000)
    const firstName = formData.Name.trim().split(' ')[0].toLowerCase()
    setFormData((prev) => ({ ...prev, Password: `${firstName}@${randomDigits}` }))
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    const url = isEditMode
      ? `${API_URL}/api/faculty/${existingFaculty._id}`
      : `${API_URL}/api/faculty`
    const method = isEditMode ? 'PUT' : 'POST'

    // In edit mode, don't send an empty Password (backend route ignores it anyway, but cleaner not to send it)
    const payload = isEditMode
      ? { ...formData, Password: undefined }
      : formData

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await res.json()

    if (!res.ok) {
      alert(data.error || 'Failed to save faculty')
      return
    }
    alert(isEditMode ? 'Faculty updated!' : 'Faculty saved!')
    if (onSaveComplete) onSaveComplete()
  }

  const handleFileChange = (e) => setFile(e.target.files[0])

  const handleFileUpload = async () => {
    const uploadData = new FormData()
    uploadData.append('file', file)

    const res = await fetch(`${API_URL}/api/faculty/upload`, {
      method: 'POST',
      body: uploadData,
    })
    const data = await res.json()

    if (!res.ok) {
      alert(data.error || 'Upload failed')
      return
    }
    alert(data.message || `${data.count} faculty uploaded!`)
  }

  const fieldGroups = [
    {
      title: 'Faculty Information',
      fields: ['FacultyID', 'Name', 'Email', 'Phone', 'DateOfJoining'],
    },
    {
      title: 'Professional Information',
      fields: ['Designation', 'Qualification', 'Experience', 'Specialization'],
    },
  ]

  return (
    <div className="w-full font-mono">
      {!isEditMode && (
        <div className="flex items-center gap-3 mb-6 p-4 bg-slate-50 rounded-lg border">
          <span className="text-sm text-gray-600 whitespace-nowrap">
            If you have an excel sheet, upload here:
          </span>
          <input
            type="file"
            accept=".xlsx"
            onChange={handleFileChange}
            className="text-sm text-gray-600 file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:bg-slate-900 file:text-white file:font-medium hover:file:bg-slate-700 cursor-pointer"
          />
          <button
            onClick={handleFileUpload}
            disabled={!file}
            className={`px-3 py-1 rounded text-white whitespace-nowrap ${file ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-300 cursor-not-allowed'}`}
          >
            Upload
          </button>
        </div>
      )}

      <div className="space-y-6">
        {fieldGroups.map((group) => (
          <div key={group.title} className="border rounded-lg p-4 bg-white shadow-sm">
            <h3 className="text-lg font-semibold mb-3 text-slate-800 border-b pb-2">
              {group.title}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {group.fields.map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium mb-1 text-gray-700">
                    {field.replace(/([A-Z])/g, ' $1')}
                  </label>
                  <input
                    type={field === 'DateOfJoining' ? 'date' : 'text'}
                    name={field}
                    value={formData[field]}
                    onChange={handleChange}
                    disabled={isEditMode && field === 'FacultyID'}
                    className="border px-2 py-1 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-100"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {!isEditMode && (
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Password</label>
          <div className="flex gap-2">
            <input
              type="text"
              name="Password"
              value={formData.Password}
              onChange={handleChange}
              className="border px-2 py-1 rounded w-full"
              readOnly
            />
            <button
              type="button"
              onClick={generatePassword}
              className="bg-slate-700 text-white px-3 py-1 rounded hover:bg-slate-800 whitespace-nowrap"
            >
              Generate
            </button>
          </div>
        </div>
      )}

      <button
        onClick={handleSave}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {isEditMode ? 'Update' : 'Save'}
      </button>
    </div>
  )
}

export default FacultyEntryForm