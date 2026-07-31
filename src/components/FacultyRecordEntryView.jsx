import { useState, useEffect } from 'react'
import { API_URL } from '../config'

function ViewFaculty({ onEditRequest }) {
  const [facultyList, setFacultyList] = useState([])
  const [selectedFaculty, setSelectedFaculty] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showInactive, setShowInactive] = useState(false)
  const authHeaders = { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  const [editingRolesFor, setEditingRolesFor] = useState(null)   // FacultyID currently being edited
  const [tempRoles, setTempRoles] = useState([])
  const ALL_ROLES = ['Principal', 'Admin', 'HOD', 'Faculty', 'StudentCoordinator', 'PlacementCoordinator', 'AcademicCoordinator', 'ProctorCoordinator', 'ChiefCourseCoordinator']

  useEffect(() => {
    const status = showInactive ? 'inactive' : 'active'
    fetch(`${API_URL}/api/faculty?status=${status}`, { headers: authHeaders })
      .then((res) => res.json())
      .then((data) => setFacultyList(data))
  }, [showInactive])

  const filteredFaculty = facultyList
    .filter((f) => f.Name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => a.Name.localeCompare(b.Name))

  const handleRowClick = async (facultyId) => {
    const res = await fetch(`${API_URL}/api/faculty/${facultyId}`)
    const data = await res.json()
    setSelectedFaculty(data)
  }
  const handleReactivate = async (facultyId, name) => {
  const confirmed = window.confirm(`Reactivate ${name}?`)
  if (!confirmed) return

  const res = await fetch(`${API_URL}/api/faculty/${facultyId}/reactivate`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
  })
  const data = await res.json()

  if (res.ok) {
    setFacultyList((prev) => prev.filter((f) => f.FacultyID !== facultyId))
    alert('Faculty reactivated')
  } else {
    alert(data.error || 'Failed to reactivate')
  }
}
  const handleDeactivate = async (facultyId, name) => {
  const remarks = window.prompt(`Enter a reason for deactivating ${name}:`)
  if (remarks === null) return   // user clicked Cancel

  const res = await fetch(`${API_URL}/api/faculty/${facultyId}/deactivate`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify({ remarks }),
  })
  const data = await res.json()

  if (res.ok) {
    setFacultyList((prev) => prev.filter((f) => f.FacultyID !== facultyId))
    alert('Faculty deactivated')
  } else {
    alert(data.error || 'Failed to deactivate')
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
  const startEditingRoles = (facultyId, currentRoles) => {
  setEditingRolesFor(facultyId)
  setTempRoles(currentRoles && currentRoles.length ? currentRoles : ['Faculty'])
}

const toggleTempRole = (role) => {
  setTempRoles((prev) =>
    prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
  )
}

const saveRoles = async (facultyId) => {
  const res = await fetch(`${API_URL}/api/faculty/${facultyId}/roles`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders },
    body: JSON.stringify({ Roles: tempRoles }),
  })
  const data = await res.json()

  if (res.ok) {
    setFacultyList((prev) =>
      prev.map((f) => (f.FacultyID === facultyId ? { ...f, Roles: tempRoles } : f))
    )
    setEditingRolesFor(null)
  } else {
    alert(data.error || 'Failed to update roles')
  }
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
      <button
        onClick={() => setShowInactive((prev) => !prev)}
        className="btn-outline text-sm mb-4"
      >
        {showInactive ? 'Show Active Faculty' : 'Show Deactivated Faculty'}
      </button>
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
            <th className="px-4 py-2">Roles</th>
            <th className="px-4 py-2">Deactivate</th>
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
                {editingRolesFor === f.FacultyID ? (
                  <div className="flex flex-col gap-1 bg-slate-50 p-2 rounded border">
                    {ALL_ROLES.map((role) => (
                      <label key={role} className="flex items-center gap-2 text-xs">
                        <input
                          type="checkbox"
                          checked={tempRoles.includes(role)}
                          onChange={() => toggleTempRole(role)}
                        />
                        {role}
                      </label>
                    ))}
                    <div className="flex gap-2 mt-1">
                      <button
                        onClick={() => saveRoles(f.FacultyID)}
                        className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingRolesFor(null)}
                        className="text-xs border px-2 py-0.5 rounded"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1 items-center">
                    {(f.Roles && f.Roles.length ? f.Roles : ['Faculty']).map((role) => (
                      <span key={role} className="text-xs bg-slate-200 px-2 py-0.5 rounded-full">
                        {role}
                      </span>
                    ))}
                    <button
                      onClick={() => startEditingRoles(f.FacultyID, f.Roles)}
                      className="text-xs text-blue-600 hover:underline ml-1"
                    >
                      Edit
                    </button>
                  </div>
                )}
              </td>
              <td className="px-4 py-2">
                {showInactive ? (
                  <button
                    onClick={() => handleReactivate(f.FacultyID, f.Name)}
                    className="text-green-600 hover:underline text-sm"
                  >
                    Reactivate
                  </button>
                ) : (
                  <button
                    onClick={() => handleDeactivate(f.FacultyID, f.Name)}
                    className="text-red-600 hover:underline text-sm"
                  >
                    Deactivate
                  </button>
                )}
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