import { useState } from 'react'
import CourseList from './CourseList'
import CourseListView from './CourseListView'

function CourseListPage() {
  const [editingCourse, setEditingCourse] = useState(null)
  const [showList, setShowList] = useState(false)

  const handleEditRequest = (course) => {
    setEditingCourse(course)
    setShowList(false)
  }

  const handleSaveComplete = () => {
    setEditingCourse(null)
    setShowList(true)
  }

  return (
    <div>
      <CourseList existingCourse={editingCourse} onSaveComplete={handleSaveComplete} />

      <div className="mt-4">
        <button
          onClick={() => setShowList((prev) => !prev)}
          className="bg-slate-700 text-white px-4 py-2 rounded hover:bg-slate-800"
        >
          {showList ? 'Hide List' : 'View'}
        </button>
      </div>

      {showList && (
        <div className="mt-6">
          <CourseListView onEditRequest={handleEditRequest} />
        </div>
      )}
    </div>
  )
}

export default CourseListPage