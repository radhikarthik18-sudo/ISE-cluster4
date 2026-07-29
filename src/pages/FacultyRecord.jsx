import { useState } from 'react'
import Sidebar from '../components/sidebar'
import FacultyEntryForm from '../components/FacultyRecordEntryForm'
import ViewFaculty from '../components/FacultyRecordEntryView'

function Faculty() {
  const [activeItem, setActiveItem] = useState('facultyRecords')
  const [activeTab, setActiveTab] = useState('entry')
  const [editingFaculty, setEditingFaculty] = useState(null)

  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const roles = user.Roles || []
  const hasAnyRole = (allowedRoles) => allowedRoles.some((r) => roles.includes(r))

  const allSidebarItems = [
    { key: 'facultyRecords', label: 'Faculty Records', allowedRoles: ['Admin'] },
    { key: 'proctorAllotment', label: 'Proctor Allotment', allowedRoles: ['Admin', 'ProctorCoordinator'] },
  ]
  const sidebarItems = allSidebarItems.filter((item) => hasAnyRole(item.allowedRoles))

  const handleEditRequest = (facultyRecord) => {
    setEditingFaculty(facultyRecord)
    setActiveTab('entry')
  }

  const handleSaveComplete = () => {
    setEditingFaculty(null)
    setActiveTab('view')
  }

  const tabClass = (tab) =>
    `pb-2.5 px-1 text-sm font-medium border-b-2 transition-colors ${
      activeTab === tab
        ? 'border-blue-600 text-blue-600'
        : 'border-transparent text-slate-500 hover:text-slate-700'
    }`

  return (
    <div className="flex">
      <Sidebar items={sidebarItems} activeItem={activeItem} onSelect={setActiveItem} />

      <div className="flex-1 p-8 font-mono">
        {activeItem === 'facultyRecords' && (
          <div>
            <h1 className="text-xl font-bold text-slate-800 mb-5">Faculty Records</h1>

            <div className="flex gap-6 border-b border-slate-200 mb-6">
              <button
                onClick={() => {
                  setActiveTab('entry')
                  setEditingFaculty(null)
                }}
                className={tabClass('entry')}
              >
                New Faculty
              </button>
              <button
                onClick={() => setActiveTab('view')}
                className={tabClass('view')}
              >
                All Faculty
              </button>
            </div>

            {activeTab === 'entry' && (
              <FacultyEntryForm
                existingFaculty={editingFaculty}
                onSaveComplete={handleSaveComplete}
              />
            )}
            {activeTab === 'view' && <ViewFaculty onEditRequest={handleEditRequest} />}
          </div>
        )}

        {activeItem === 'proctorAllotment' && (
          <div>
            <h1 className="text-xl font-bold text-slate-800 mb-5">Proctor Allotment</h1>
            <p className="text-sm text-slate-500">Coming soon.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Faculty