import { useState } from 'react'
import Sidebar from '../components/sidebar'
import EntryForm from '../components/StudentEntryForm'
import ViewStudents from '../components/StudentEntryView'
import StudentAllocation from '../components/StudentAllocation'

function Admission() {
  const [activeItem, setActiveItem] = useState('studentEnrollment')
  const [activeTab, setActiveTab] = useState('entry')

  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const roles = user.Roles || []
  const hasAnyRole = (allowedRoles) => allowedRoles.some((r) => roles.includes(r))

  const allSidebarItems = [
    { key: 'studentEnrollment', label: 'Student Enrollment', allowedRoles: ['Admin', 'StudentCoordinator'] },
    { key: 'studentList', label: 'Student List', allowedRoles: ['Admin', 'StudentCoordinator'] },
  ]
  const sidebarItems = allSidebarItems.filter((item) => hasAnyRole(item.allowedRoles))

  const tabClass = (tab) =>
    `pb-2.5 px-1 text-sm font-medium border-b-2 transition-colors ${
      activeTab === tab
        ? 'border-blue-600 text-blue-600'
        : 'border-transparent text-slate-500 hover:text-slate-700'
    }`

  return (
    <div className="flex">
      <Sidebar
        items={sidebarItems}
        activeItem={activeItem}
        onSelect={setActiveItem}
      />

      <div className="flex-1 p-8 font-mono">
        {activeItem === 'studentEnrollment' && (
          <div>
            <h1 className="text-xl font-bold text-slate-800 mb-5">Student Enrollment</h1>

            <div className="flex gap-6 border-b border-slate-200 mb-6">
              <button
                onClick={() => setActiveTab('entry')}
                className={tabClass('entry')}
              >
                Entry
              </button>
              <button
                onClick={() => setActiveTab('view')}
                className={tabClass('view')}
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
            <h1 className="text-xl font-bold text-slate-800 mb-5">Student List</h1>

            <div className="flex gap-6 border-b border-slate-200 mb-6">
              <span className="pb-2.5 px-1 text-sm font-medium border-b-2 border-blue-600 text-blue-600">
                Allocation
              </span>
            </div>

            <StudentAllocation />
          </div>
        )}
      </div>
    </div>
  )
}

export default Admission