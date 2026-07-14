import { useState, useEffect } from 'react'
import { API_URL } from '../config'

function ViewStudents() {
  const [years, setYears] = useState([])
  const [selectedYear, setSelectedYear] = useState('')
  const [students, setStudents] = useState([])
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredStudents = students
  .filter((s) =>
    s.USN.toLowerCase().includes(searchTerm.toLowerCase())
  )
  .sort((a, b) => a.USN.localeCompare(b.USN))


  useEffect(() => {
    fetch(`${API_URL}/api/students/years`)
      .then((res) => res.json())
      .then((data) => setYears(data))
  }, [])

  useEffect(() => {
    if (!selectedYear) {
      setStudents([])
      return
    }
    fetch(`${API_URL}/api/students?Year=${selectedYear}`)
      .then((res) => res.json())
      .then((data) => setStudents(data))
  }, [selectedYear])

  const handleRowClick = async (id) => {
    const res = await fetch(`${API_URL}/api/students/${id}`)
    const data = await res.json()
    setSelectedStudent(data)
  }

  if (selectedStudent) {
    const groups = [
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
      <div>
        <button
          onClick={() => setSelectedStudent(null)}
          className="mb-4 text-blue-600 hover:underline"
        >
          ← Back to list
        </button>

        <h2 className="text-xl font-bold mb-4">{selectedStudent.StudentName}</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {groups.map((group) => (
            <div key={group.title} className="border rounded-lg p-4 bg-white shadow-sm">
              <h3 className="text-lg font-semibold mb-3 border-b pb-2">
                {group.title}:
              </h3>
              {group.fields.map((field) => (
              <div key={field} className="flex justify-between py-1.5 border-b last:border-0 text-sm">
                <span className="font-medium text-black ">
                  {field.replace(/([A-Z])/g, ' $1')} :
                </span>
                <span className="text-slate-900">{selectedStudent[field] || '—'}</span>
              </div>
            ))}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <label className="font-semibold">Year:</label>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="border px-2 py-1 rounded"
        >
          <option value="">-- Select Year --</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      {selectedYear && (
        <div className="mb-4">
          <label className="font-semibold pr-2">Search by USN :</label>
          <input
            type="text"
            placeholder="e.g. 1BY25CS001"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border px-3 py-1 rounded w-64"
          />
        </div>
      )}

      {selectedYear && (
        <table className="w-full border-collapse bg-white shadow-sm rounded overflow-hidden">
          <thead>
            <tr className="bg-slate-800 text-white text-left">
              <th className="px-4 py-2">USN</th>
              <th className="px-4 py-2">Student Name</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((s) => (
              <tr
                key={s._id}
                onClick={() => handleRowClick(s._id)}
                className="cursor-pointer hover:bg-blue-50 border-b"
              >
                <td className="px-4 py-2">{s.USN}</td>
                <td className="px-4 py-2">{s.StudentName}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default ViewStudents