import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { API_URL } from '../config'
import { slugify } from '../utils/slugify'

function CourseFileParticularPage() {
  const { courseFileId, slug } = useParams()
  const [courseFile, setCourseFile] = useState(null)
  const [loading, setLoading] = useState(true)

  const authHeaders = { Authorization: `Bearer ${localStorage.getItem('token')}` }

  useEffect(() => {
    fetch(`${API_URL}/api/course-file/${courseFileId}`, { headers: authHeaders })
      .then((res) => res.json())
      .then(setCourseFile)
      .finally(() => setLoading(false))
  }, [courseFileId])

  if (loading) return <p className="p-8 text-sm text-slate-500 font-mono">Loading...</p>
  if (!courseFile) return <p className="p-8 text-sm text-slate-500 font-mono">Course file not found.</p>

  const particular = courseFile.Particulars.find((p) => slugify(p.Name) === slug)
  if (!particular) return <p className="p-8 text-sm text-slate-500 font-mono">Particular not found.</p>

  return (
    <div className="p-8 font-mono max-w-3xl">
      <p className="text-xs text-slate-400 mb-1">
        {courseFile.CourseCode} — {courseFile.CourseTitle}
      </p>
      <h1 className="text-xl font-bold text-slate-800 mb-6">
        {particular.SlNo}. {particular.Name}
      </h1>

      <div className="border rounded-lg p-6 bg-white shadow-sm">
        <p className="text-sm text-slate-500">
          This page will hold the actual entry form for this particular — content coming soon.
        </p>
      </div>
    </div>
  )
}

export default CourseFileParticularPage