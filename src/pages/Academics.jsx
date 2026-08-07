import { useState } from 'react'
import Sidebar from '../components/sidebar'
import CourseListPage from '../components/CourseListPage'
import CourseStudentMap from '../components/CourseStudentMap'
import CourseFacultyMap from '../components/CourseFacultyMap'
import CourseFacultyTTMap from '../components/CourseFacultyTTMap'
import AttendanceRegister from '../components/AttendanceRegister'
import LessonPlanUpload from '../components/LessonPlanUpload'
import LessonPlanManual from '../components/LessonPlanManual'
import CoursePlan from '../components/CoursePlan'
import COEEntry from '../components/COEEntry'
import COEView from '../components/COEView'
import AttendanceLedger from '../components/AttendanceLedger'
import COAllocation from '../components/COAllocation'
import COPOMapping from '../components/COPOMapping'
import TimeTableEntry from '../components/TimeTableEntry'
import FacultyTimeTableView from '../components/FacultyTimeTableView'
import TTView from '../components/TTView'
import ClassTeacherEntry from '../components/ClassTeacherEntry'
import ClassTeacherView from '../components/ClassTeacherView'

function Academics() {
  const [activeItem, setActiveItem] = useState('courses')
  const [activeTab, setActiveTab] = useState('')
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const roles = user.Roles || []
  const hasAnyRole = (allowedRoles) => allowedRoles.some((r) => roles.includes(r))
  const canEditTimetable = hasAnyRole(['Admin', 'HOD', 'AcademicCoordinator'])

  const allSidebarItems = [
    { key: 'departmentCOE', label: 'Department COE', allowedRoles: ['Admin', 'HOD', 'AcademicCoordinator'] },
    { key: 'timetable', label: 'Time Table', allowedRoles: ['Admin', 'HOD', 'AcademicCoordinator', 'Faculty', 'ChiefCourseCoordinator'] },
    { key: 'courses', label: 'Courses', allowedRoles: ['Admin', 'HOD', 'AcademicCoordinator'] },
    { key: 'copomapping', label: 'CO - PO mapping', allowedRoles: ['Admin', 'HOD', 'ChiefCourseCoordinator'] },
    { key: 'lessonPlan', label: 'Lesson Plan', allowedRoles: ['Admin', 'HOD', 'Faculty', 'ChiefCourseCoordinator'] },
    { key: 'attendance', label: 'Attendance', allowedRoles: ['Admin', 'HOD', 'Faculty', 'ChiefCourseCoordinator'] },
    { key: 'coursePlan', label: 'Course Plan', allowedRoles: ['Admin', 'HOD', 'Faculty', 'ChiefCourseCoordinator'] },
    { key: 'classTeacher', label: 'Class Teacher', allowedRoles: ['Admin', 'HOD', 'AcademicCoordinator'] },
  ]

  const sidebarItems = allSidebarItems.filter((item) => hasAnyRole(item.allowedRoles))

  const tabsByItem = {
    copomapping: [
      { key: 'coAllocation', label: 'CO Allotment'},
      { key: 'copoMappingTab', label: 'CO-PO Mapping'},
    ],
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
    timetable: [
      ...(canEditTimetable ? [{ key: 'sectionView', label: 'Section View' }] : []),
      { key: 'facultyView', label: 'Faculty View' },
      ...(canEditTimetable ? [{ key: 'ttView', label: 'TT View' }] : []),
    ],
    classTeacher: [
      { key: 'assign', label: 'Assign' },
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
      if (activeTab === 'courseList') return <CourseListPage />
      if (activeTab === 'courseStudentMap') return <CourseStudentMap />
      if (activeTab === 'courseFacultyMap') return <CourseFacultyMap />
      if (activeTab === 'courseFacultyTTMap') return <CourseFacultyTTMap />
    }
    if (activeItem === 'copomapping') {
      if (activeTab === 'coAllocation') return <COAllocation />
      if (activeTab === 'copoMappingTab') return <COPOMapping />
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
    if (activeItem === 'timetable') {
      if (activeTab === 'sectionView' && canEditTimetable) return <TimeTableEntry />
      if (activeTab === 'facultyView') return <FacultyTimeTableView />
      if (activeTab === 'ttView' && canEditTimetable) return <TTView />
    }
    if (activeItem === 'classTeacher') {
      if (activeTab === 'assign') return <ClassTeacherEntry />
      if (activeTab === 'view') return <ClassTeacherView />
    }
    return null
  }

  const currentTabs = tabsByItem[activeItem] || []
  const currentLabel = allSidebarItems.find((item) => item.key === activeItem)?.label || ''

  const tabClass = (tabKey) =>
    `pb-2.5 px-1 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
      activeTab === tabKey
        ? 'border-blue-600 text-blue-600'
        : 'border-transparent text-slate-500 hover:text-slate-700'
    }`

  return (
    <div className="flex">
      <Sidebar
        items={sidebarItems}
        activeItem={activeItem}
        onSelect={handleSidebarSelect}
      />

      <div className="flex-1 p-8 font-mono">
        <h1 className="text-xl font-bold text-slate-800 mb-5">{currentLabel}</h1>

        {currentTabs.length > 0 && (
          <div className="flex gap-6 border-b border-slate-200 mb-6 overflow-x-auto">
            {currentTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={tabClass(tab.key)}
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