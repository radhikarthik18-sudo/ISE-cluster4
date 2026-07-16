import { useState } from 'react'
import Sidebar from '../components/sidebar'
import CourseList from '../components/CourseList'
import CourseStudentMap from '../components/CourseStudentMap'
import CourseFacultyMap from '../components/CourseFacultyMap'
import CourseFacultyTTMap from '../components/CourseFacultyTTMap'
import AttendanceRegister from '../components/AttendanceRegister'
import Ledger from '../components/AttendanceLedger'
import LessonPlanUpload from '../components/LessonPlanUpload'
import LessonPlanManual from '../components/LessonPlanManual'
import CoursePlan from '../components/CoursePlan'
import AttendanceLedger from '../components/AttendanceLedger'
import COEEntry from '../components/COEEntry'
import COEView from '../components/COEView'

function Academics() {
  const [activeItem, setActiveItem] = useState('courses')
  const [activeTab, setActiveTab] = useState('')

  const sidebarItems = [
    { key: 'attendance', label: 'Attendance' },
    { key: 'courses', label: 'Courses' },
    { key: 'coursePlan', label: 'Course Plan' },
    { key: 'lessonPlan', label: 'Lesson Plan' },
    { key: 'departmentCOE', label: 'Department COE' }, 
    
  ]

  const tabsByItem = {
    attendance: [
      { key: 'register', label: 'Attendance Register' },
      { key: 'ledger', label: 'Ledger' },
    ],
    courses: [
      { key: 'courseList', label: 'Course List' },
      { key: 'courseStudentMap', label: 'Course-Student Map' },
      { key: 'courseFacultyMap', label: 'Course-Faculty Map' },
      { key: 'courseFacultyTTMap', label: 'Course-Faculty-TT Map' },
    ],
    lessonPlan: [
      { key: 'upload', label: 'Upload' },
      { key: 'manual', label: 'Manual Entry' },
    ],
    coursePlan: [],
    departmentCOE: [
      { key: 'entry', label: 'Entry' },
      { key: 'view', label: 'View' },
    ],
  }

  const handleSidebarSelect = (key) => {
    setActiveItem(key)
    const firstTab = tabsByItem[key][0]
    setActiveTab(firstTab ? firstTab.key : '')
  }

  const renderContent = () => {
    if (activeItem === 'courses') {
      if (activeTab === 'courseList') return <CourseList />
      if (activeTab === 'courseStudentMap') return <CourseStudentMap />
      if (activeTab === 'courseFacultyMap') return <CourseFacultyMap />
      if (activeTab === 'courseFacultyTTMap') return <CourseFacultyTTMap />
    }
    if (activeItem === 'attendance') {
      if (activeTab === 'register') return <AttendanceRegister />
      if (activeTab === 'ledger') return <AttendanceLedger />
    }
    if (activeItem === 'lessonPlan') {
      if (activeTab === 'upload') return <LessonPlanUpload />
      if (activeTab === 'manual') return <LessonPlanManual />
    }
    if (activeItem === 'coursePlan') return <CoursePlan />
    if (activeItem === 'departmentCOE') {
      if (activeTab === 'entry') return <COEEntry />
      if (activeTab === 'view') return <COEView />
    }
    return null
  }

  const currentTabs = tabsByItem[activeItem] || []

  return (
    <div className="flex">
      <Sidebar
        items={sidebarItems}
        activeItem={activeItem}
        onSelect={handleSidebarSelect}
      />

      <div className="flex-1 p-6">
        {currentTabs.length > 0 && (
          <div className="flex gap-4 border-b mb-4">
            {currentTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`pb-2 px-2 ${activeTab === tab.key ? 'border-b-2 border-blue-600 font-semibold' : 'text-gray-500'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {renderContent()}
      </div>
    </div>
  )
}

export default Academics
