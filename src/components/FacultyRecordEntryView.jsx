import { useState, useEffect } from 'react'
import { API_URL } from '../config'

function ViewFaculty({ onEditRequest }) {
  const [facultyList, setFacultyList] = useState([])
  const [selectedFaculty, setSelectedFaculty] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetch(`${API_URL}/api/faculty`)
      .then((res) => res.json())
      .then((data) => setFacultyList(data))
  }, [])

  const filteredFaculty = facultyList
    .filter((f) => f.Name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => a.Name.localeCompare(b.Name))

  const handleRowClick = async (facultyId) => {
    const res = await fetch(`${API_URL}/api/faculty/${facultyId}`)
    const data = await res.json()
    setSelectedFaculty(data)
  }

  const handleDelete = async (facultyId) => {
    const confirmed = window.confirm('Are you sure you want to delete this faculty member?')
    if (!confirmed) return

    const res = await fetch(`${API_URL}/api/faculty/${facultyId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    })
    const data = await res.json()

    if (res.ok) {
      setFacultyList((prev) => prev.filter((f) => f.FacultyID !== facultyId))
    } else {
      alert(data.error || 'Failed to delete')
    }
  }

  const handleResetPassword = async (facultyId, name) => {
    const confirmed = window.confirm(`Generate a new password for ${name}?`)
    if (!confirmed) return

    const firstName = name.trim().split(' ')[0].toLowerCase()
    const randomDigits = Math.floor(1000 + Math.random() * 9000)
    const newPassword = `${firstName}@${randomDigits}`

    const res = await fetch(`${API_URL}/api/faculty/${facultyId}/reset-password`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ newPassword }),
    })
    const data = await res.json()

    if (res.ok) {
      alert(`New password: ${newPassword}\n(Save this — it won't be shown again)`)
    } else {
      alert(data.error || 'Failed to reset password')
    }
  }

  const handleEditClick = async (facultyId) => {
    const res = await fetch(`${API_URL}/api/faculty/${facultyId}`)
    const data = await res.json()
    onEditRequest(data)
  }

  if (selectedFaculty) {
    const groups = [
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
      <div>
        <button
          onClick={() => setSelectedFaculty(null)}
          className="mb-4 text-blue-600 hover:underline"
        >
          ← Back to list
        </button>

        <h2 className="text-xl font-bold mb-4">{selectedFaculty.Name}</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {groups.map((group) => (
            <div key={group.title} className="border rounded-lg p-4 bg-white shadow-sm">
              <h3 className="text-lg font-semibold mb-3 border-b pb-2">
                {group.title}
              </h3>
              {group.fields.map((field) => (
                <div key={field} className="flex justify-between py-1.5 border-b last:border-0 text-sm">
                  <span className="font-medium text-slate-600">
                    {field.replace(/([A-Z])/g, ' $1')}
                  </span>
                  <span className="text-slate-900">{selectedFaculty[field] || '—'}</span>
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
      <input
        type="text"
        placeholder="Search by Name..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="border px-3 py-1 rounded w-64 mb-4"
      />

      <table className="w-full border-collapse bg-white shadow-sm rounded overflow-hidden">
        <thead>
          <tr className="bg-slate-800 text-white text-left">
            <th className="px-4 py-2">Faculty ID</th>
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">Edit</th>
            <th className="px-4 py-2">Delete</th>
            <th className="px-4 py-2">Reset Password</th>
          </tr>
        </thead>
        <tbody>
          {filteredFaculty.map((f) => (
            <tr key={f.FacultyID} className="hover:bg-blue-50 border-b">
              <td className="px-4 py-2 cursor-pointer" onClick={() => handleRowClick(f.FacultyID)}>{f.FacultyID}</td>
              <td className="px-4 py-2 cursor-pointer" onClick={() => handleRowClick(f.FacultyID)}>{f.Name}</td>
              <td className="px-4 py-2">
                <button
                  onClick={() => handleEditClick(f.FacultyID)}
                  className="text-blue-600 hover:underline text-sm"
                >
                  Edit
                </button>
              </td>
              <td className="px-4 py-2">
                <button
                  onClick={() => handleDelete(f.FacultyID)}
                  className="text-red-600 hover:underline text-sm"
                >
                  Delete
                </button>
              </td>
              <td className="px-4 py-2">
                <button
                  onClick={() => handleResetPassword(f.FacultyID, f.Name)}
                  className="text-amber-600 hover:underline text-sm"
                >
                  Reset
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ViewFaculty