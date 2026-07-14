import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import FacultyEntryForm from '../components/FacultyRecordEntryForm'
import ViewFaculty from '../components/FacultyRecordEntryView'

function Faculty() {
  const [activeItem, setActiveItem] = useState('facultyRecords')
  const [activeTab, setActiveTab] = useState('entry')
  const [editingFaculty, setEditingFaculty] = useState(null)

  const sidebarItems = [
    { key: 'facultyRecords', label: 'Faculty Records' },
    { key: 'proctorAllotment', label: 'Proctor Allotment' },
  ]

  const handleEditRequest = (facultyRecord) => {
    setEditingFaculty(facultyRecord)
    setActiveTab('entry')
  }

  const handleSaveComplete = () => {
    setEditingFaculty(null)
    setActiveTab('view')
  }

  return (
    <div className="flex">
      <Sidebar items={sidebarItems} activeItem={activeItem} onSelect={setActiveItem} />

      <div className="flex-1 p-6">
        {activeItem === 'facultyRecords' && (
          <div>
            <div className="flex gap-4 border-b mb-4">
              <button
                onClick={() => {
                  setActiveTab('entry')
                  setEditingFaculty(null)
                }}
                className={`pb-2 px-2 ${activeTab === 'entry' ? 'border-b-2 border-blue-600 font-semibold' : 'text-gray-500'}`}
              >
                New Faculty
              </button>
              <button
                onClick={() => setActiveTab('view')}
                className={`pb-2 px-2 ${activeTab === 'view' ? 'border-b-2 border-blue-600 font-semibold' : 'text-gray-500'}`}
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

        {activeItem === 'proctorAllotment' && <p>Proctor Allotment coming soon</p>}
      </div>
    </div>
  )
}

export default Faculty