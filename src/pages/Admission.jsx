import { useState } from 'react'
import Sidebar from '../components/sidebar'
import EntryForm from '../components/StudentEntryForm'
import ViewStudents from '../components/StudentEntryView'
import StudentAllocation from '../components/StudentAllocation'

function Admission() {
  const [activeItem, setActiveItem] = useState('studentEnrollment')
  const [activeTab, setActiveTab] = useState('entry')

  const sidebarItems = [
    { key: 'studentEnrollment', label: 'Student Enrollment' },
    { key: 'studentList', label: 'Student List' },
  ]

  return (
    <div className="flex">
      <Sidebar
        items={sidebarItems}
        activeItem={activeItem}
        onSelect={setActiveItem}
      />

      <div className="flex-1 p-6">
        {activeItem === 'studentEnrollment' && (
          <div>
            <div className="flex gap-4 border-b mb-4">
              <button
                onClick={() => setActiveTab('entry')}
                className={`pb-2 px-2 ${activeTab === 'entry' ? 'border-b-2 border-blue-600 font-semibold' : 'text-gray-500'}`}
              >
                Entry
              </button>
              <button
                onClick={() => setActiveTab('view')}
                className={`pb-2 px-2 ${activeTab === 'view' ? 'border-b-2 border-blue-600 font-semibold' : 'text-gray-500'}`}
              >
                View
              </button>
            </div>

            {activeTab === 'entry' && <EntryForm />}
            {activeTab === 'view' && <ViewStudents />}
          </div>
        )}

        {activeItem === 'studentList' && (
          <div>
            <div className="flex gap-4 border-b mb-4">
              <button className="pb-2 px-2 border-b-2 border-blue-600 font-semibold">
                Allocation
              </button>
            </div>
            <StudentAllocation />
          </div>
        )}
      </div>
    </div>
  )
}

export default Admission