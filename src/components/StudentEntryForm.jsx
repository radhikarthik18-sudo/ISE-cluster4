import { useState } from 'react'

function EntryForm() {
  const [Year, setYear] = useState('')
  const [formData, setFormData] = useState({
    USN: '',
    StudentName: '',
    StudentEmail: '',
    StudentPhone: '',
    FatherName: '',
    FatherOccupation: '',
    FatherCompany: '',
    FatherDesignation: '',
    FatherEmail: '',
    FatherPhone: '',
    MotherName: '',
    MotherOccupation: '',
    MotherCompany: '',
    MotherDesignation: '',
    MotherEmail: '',
    MotherPhone: '',
  })
  const [file, setFile] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e) => {
    setFile(e.target.files[0])
  }

  const handleManualSave = async () => {
    const res = await fetch('http://localhost:5000/api/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ Year, ...formData }),
    })
    const data = await res.json()

    if(!res.ok){
      alert(data.error || 'USN already exist')
      return
    }
    console.log('Saved:', data)
    alert('Student saved!')
  }

  const handleFileUpload = async () => {
    const uploadData = new FormData()
    uploadData.append('file', file)
    uploadData.append('Year', Year)

    const res = await fetch('http://localhost:5000/api/students/upload', {
      method: 'POST',
      body: uploadData,
    })
    const data = await res.json()
    console.log('Uploaded:', data)
    alert(`${data.count} students uploaded!`)
  }

  const fieldGroups = [
  {
    title: 'Student Information',
    fields: ['USN', 'StudentName', 'StudentEmail', 'StudentPhone'],
  },
  {
    title: "Father's Information",
    fields: ['FatherName', 'FatherOccupation', 'FatherCompany', 'FatherDesignation', 'FatherEmail', 'FatherPhone'],
  },
  {
    title: "Mother's Information",
    fields: ['MotherName', 'MotherOccupation', 'MotherCompany', 'MotherDesignation', 'MotherEmail', 'MotherPhone'],
  },
    ]
  return (
    <div className="w-full font-mono">
      <div className="flex flex-wrap items-center gap-6 mb-6 p-4 bg-slate-50 rounded-lg border">
        <div className="flex items-center gap-2">
            <label className="font-semibold whitespace-nowrap">Year:</label>
            <input
            type="text"
            value={Year}
            onChange={(e) => setYear(e.target.value)}
            className="border px-2 py-1 rounded w-24"
            placeholder="e.g. 2025"
            />
        </div>

        <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 whitespace-nowrap">
            If you have an excel sheet, upload here:
            </span>
            
            <input
            type="file"
            accept=".xlsx"
            
            onClick={(e)=>{
              if(!Year){
                e.preventDefault()
                alert('Please enter the Year before choosing a file.')
              }
            }}
            onChange={handleFileChange}
            className={`text-sm text-gray-600
                      file:mr-3 file:py-1 file:px-3
                      file:rounded file:border-0
                      file:font-medium
                      cursor-pointer
                      ${Year
                        ? 'file:bg-slate-900 file:text-white hover:file:bg-green-800'
                        : 'file:bg-gray-100 file:text-gray-400 file:cursor-not-allowed opacity-60'
                      }`}
            />
            <button
            onClick={handleFileUpload}
            disabled={!file}
            className={`px-3 py-1 rounded text-white whitespace-nowrap ${
                file ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-300 cursor-not-allowed'
            }`}
            >
            Upload
            </button>
        </div>
        </div>

      <div className="space-y-6">
        {fieldGroups.map((group) => (
            <div key={group.title} className="border rounded-lg p-4 bg-white shadow-sm">
            <h3 className="text-lg font-semibold mb-3 text-slate-800 border-b pb-2">
                {group.title}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {group.fields.map((field) => (
                <div key={field}>
                    <label className="block text-sm font-medium mb-1 capitalize text-gray-700">
                    {field.replace(/([A-Z])/g, ' $1')}
                    </label>
                    <input
                    type="text"
                    name={field}
                    value={formData[field]}
                    onChange={handleChange}
                    className="border px-2 py-1 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                </div>
                ))}
            </div>
            </div>
        ))}
        </div>

      <button
        onClick={handleManualSave}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Save
      </button>
    </div>
  )
}

export default EntryForm