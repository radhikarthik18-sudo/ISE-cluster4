import { useState, useEffect } from 'react'
import { API_URL } from '../config'
import { slugify } from '../utils/slugify'

function CourseFile() {
  const [courses, setCourses] = useState([])
  const [selectedCourseId, setSelectedCourseId] = useState('')
  const [selectedCourse, setSelectedCourse] = useState(null)

  const [courseFile, setCourseFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [fileType, setFileType] = useState('Theory')

  const [courseCoordinatorText, setCourseCoordinatorText] = useState('')

  const [headerForm, setHeaderForm] = useState({
    Period: '', AcademicYear: '', Batch: '', CIEMarks: '', SEEMarks: '', CourseCoordinatorName: '',
  })

  const [activeParticular, setActiveParticular] = useState(null)
  const [popupStatus, setPopupStatus] = useState('Pending')
  const [popupDetails, setPopupDetails] = useState('')

  const authHeaders = { Authorization: `Bearer ${localStorage.getItem('token')}` }
  // These particulars already have a dedicated feature elsewhere in the app
  // (Department COE, Course List's syllabus upload) — no placeholder-page link needed.
  const NO_LINK_PARTICULARS = ['Calendar of Events', 'Syllabus']
  const [showCoeModal, setShowCoeModal] = useState(false)
  const [coeDocs, setCoeDocs] = useState([])
  const [coeSelectId, setCoeSelectId] = useState('')
  useEffect(() => {
    fetch(`${API_URL}/api/courses`, { headers: authHeaders })
      .then((res) => res.json())
      .then(setCourses)
  }, [])

  useEffect(() => {
    if (!selectedCourseId) {
      setSelectedCourse(null)
      setCourseFile(null)
      setCourseCoordinatorText('')
      return
    }
    fetch(`${API_URL}/api/courses/${selectedCourseId}`, { headers: authHeaders })
      .then((res) => res.json())
      .then((course) => {
        setSelectedCourse(course)
        setFileType(course.CourseCategory === 'PCCL' ? 'Laboratory' : 'Theory')
      })
  }, [selectedCourseId])

  useEffect(() => {
    if (!selectedCourse) return
    fetch(`${API_URL}/api/course-faculty-map`, { headers: authHeaders })
      .then((res) => res.json())
      .then((allMappings) => {
        const matches = allMappings.filter((m) => m.CourseCode === selectedCourse.CourseCode)
        const text = matches.length
          ? matches.map((m) => `${m.Section}: ${m.FacultyName}`).join(', ')
          : 'Not yet allocated in Course-Faculty Map'
        setCourseCoordinatorText(text)
        setHeaderForm((prev) => ({ ...prev, CourseCoordinatorName: text }))
      })
  }, [selectedCourse])

  useEffect(() => {
    if (!selectedCourse) return
    setLoading(true)
    fetch(`${API_URL}/api/course-file?CourseCode=${selectedCourse.CourseCode}`, { headers: authHeaders })
      .then((res) => res.json())
      .then((data) => {
        setCourseFile(data)
        if (data) {
          setHeaderForm((prev) => ({
            ...prev,
            Period: data.Period || '',
            AcademicYear: data.AcademicYear || '',
            Batch: data.Batch || '',
            CIEMarks: data.CIEMarks || '',
            SEEMarks: data.SEEMarks || '',
          }))
        }
      })
      .finally(() => setLoading(false))
  }, [selectedCourse])

  const handleInitialize = async () => {
    const res = await fetch(`${API_URL}/api/course-file`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
      body: JSON.stringify({
        CourseCode: selectedCourse.CourseCode,
        FileType: fileType,
        CourseTitle: selectedCourse.CourseTitle,
        Semester: selectedCourse.Semester,
        Credits: selectedCourse.Credits,
        LTP: `${selectedCourse.L}:${selectedCourse.T}:${selectedCourse.P}`,
        CourseCoordinatorName: courseCoordinatorText,
      }),
    })
    const data = await res.json()
    if (!res.ok) {
      alert(data.error || 'Failed to initialize course file')
      return
    }
    setCourseFile(data)
  }
  const openCoeModal = () => {
    setCoeSelectId('')
    setShowCoeModal(true)
    fetch(`${API_URL}/api/coe`)
      .then((res) => res.json())
      .then(setCoeDocs)
      .catch(() => setCoeDocs([]))
  }

  const printSignedCoe = async () => {
    if (!coeSelectId) return alert('Select a calendar first')

    const newTab = window.open('', '_blank') // opened synchronously so browsers don't block it
    try {
      const res = await fetch(`${API_URL}/api/coe/${coeSelectId}/signed-pdf`)
      if (!res.ok) {
        newTab.close()
        const err = await res.json().catch(() => ({}))
        alert(err.error || 'No signed copy uploaded for this calendar yet — upload one in Department COE > Upload first.')
        return
      }
      const blob = await res.blob()
      const blobUrl = URL.createObjectURL(blob)
      newTab.location.href = blobUrl
    } catch (err) {
      newTab.close()
      alert('Failed to load signed copy')
    }
  }
  const handleHeaderChange = (e) => {
    const { name, value } = e.target
    setHeaderForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSaveHeader = async () => {
    const res = await fetch(`${API_URL}/api/course-file/${courseFile._id}/header`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
      body: JSON.stringify({ ...headerForm, CourseCoordinatorName: courseCoordinatorText }),
    })
    const data = await res.json()
    if (!res.ok) {
      alert(data.error || 'Failed to save header details')
      return
    }
    setCourseFile(data)
    alert('Header details saved!')
  }

  // Status badge click -> entry popup (Status + Details)
  const openParticular = (p) => {
    setActiveParticular(p)
    setPopupStatus(p.Status)
    setPopupDetails(p.Details || '')
  }

  const handleSaveParticular = async () => {
    const res = await fetch(`${API_URL}/api/course-file/${courseFile._id}/particular/${activeParticular.SlNo}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
      body: JSON.stringify({ Status: popupStatus, Details: popupDetails }),
    })
    const data = await res.json()
    if (!res.ok) {
      alert(data.error || 'Failed to save')
      return
    }
    setCourseFile(data)
    setActiveParticular(null)
  }

  // Name hyperlink click -> open the dedicated page for this particular in a new tab
  const openParticularPage = (p) => {
    window.open(`/course-file/${courseFile._id}/particular/${slugify(p.Name)}`, '_blank')
  }

  // Print icon -> forced download (unchanged)
  const downloadPdf = async (url, filename) => {
    const res = await fetch(url, { headers: authHeaders })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      alert(err.error || 'Failed to generate PDF')
      return
    }
    const blob = await res.blob()
    const objectUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = objectUrl
    a.download = filename
    a.click()
    URL.revokeObjectURL(objectUrl)
  }

  return (
    <div className="w-full font-mono">
      <div className="mb-6">
        <label className="block text-sm font-medium mb-1 text-gray-700">Course</label>
        <select
          value={selectedCourseId}
          onChange={(e) => setSelectedCourseId(e.target.value)}
          className="border px-2 py-1 rounded w-72"
        >
          <option value="">-- Select --</option>
          {courses.map((c) => (
            <option key={c._id} value={c._id}>{c.CourseCode} - {c.CourseTitle}</option>
          ))}
        </select>
      </div>

      {loading && <p className="text-sm text-slate-500">Loading...</p>}

      {selectedCourse && !loading && !courseFile && (
        <div className="border rounded-lg p-4 bg-white shadow-sm max-w-md">
          <h3 className="text-sm font-semibold mb-3">No Course File yet for {selectedCourse.CourseCode} — initialize one</h3>
          <div className="mb-3 text-sm">
            <span className="text-slate-500">L:T:P:</span> {selectedCourse.L}:{selectedCourse.T}:{selectedCourse.P}
          </div>
          <div className="mb-3 text-sm">
            <span className="text-slate-500">Course Coordinator:</span> {courseCoordinatorText}
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1 text-gray-700">File Type</label>
            <select value={fileType} onChange={(e) => setFileType(e.target.value)} className="border px-2 py-1 rounded w-full">
              <option value="Theory">Theory</option>
              <option value="Laboratory">Laboratory</option>
            </select>
            <p className="text-xs text-slate-400 mt-1">
              Suggested from course category ({selectedCourse.CourseCategory}) — override if needed.
            </p>
          </div>
          <button onClick={handleInitialize} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Create Course File
          </button>
        </div>
      )}

      {courseFile && !loading && (
        <>
          <div className="border rounded-lg p-4 bg-white shadow-sm mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">Course File Header — {courseFile.FileType}</h3>
              <button
                onClick={() => downloadPdf(`${API_URL}/api/course-file/${courseFile._id}/pdf`, `CourseFile_${courseFile.CourseCode}.pdf`)}
                className="bg-emerald-600 text-white px-3 py-1.5 rounded text-xs hover:bg-emerald-700"
              >
                Download Full Checklist (PDF)
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm mb-3">
              <div><span className="text-slate-500">Course Code:</span> {courseFile.CourseCode}</div>
              <div><span className="text-slate-500">Course Title:</span> {courseFile.CourseTitle}</div>
              <div><span className="text-slate-500">Semester:</span> {courseFile.Semester}</div>
              <div><span className="text-slate-500">Credits:</span> {courseFile.Credits}</div>
              <div><span className="text-slate-500">L:T:P:</span> {courseFile.LTP}</div>
              <div><span className="text-slate-500">Course Coordinator:</span> {courseCoordinatorText}</div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                ['Period', 'Period'],
                ['AcademicYear', 'Academic Year'],
                ['Batch', 'Batch'],
                ['CIEMarks', 'CIE Marks'],
                ['SEEMarks', 'SEE Marks'],
              ].map(([field, label]) => (
                <div key={field}>
                  <label className="block text-xs text-slate-500 mb-1">{label}</label>
                  <input
                    type="text"
                    name={field}
                    value={headerForm[field]}
                    onChange={handleHeaderChange}
                    className="border px-2 py-1 rounded w-full text-sm"
                  />
                </div>
              ))}
            </div>
            <button
              onClick={handleSaveHeader}
              className="mt-3 bg-slate-700 text-white px-3 py-1.5 rounded text-sm hover:bg-slate-800"
            >
              Save Header Details
            </button>
          </div>

          <div className="overflow-x-auto">
            <p className="text-xs text-slate-500 mb-2">
              Click a particular's name to view its printout in a new tab. Click the status badge to enter details and mark it Completed / Pending.
            </p>
            <table className="w-full border-collapse bg-white shadow-sm rounded overflow-hidden text-sm">
              <thead>
                <tr className="bg-slate-800 text-white text-left">
                  <th className="px-3 py-2 w-14">Sl. No.</th>
                  <th className="px-3 py-2">Particulars</th>
                  <th className="px-3 py-2 w-32">Status</th>
                  <th className="px-3 py-2 w-16 text-center">Print</th>
                </tr>
              </thead>
              <tbody>
                {courseFile.Particulars.map((p) => (
                  <tr key={p.SlNo} className="border-b hover:bg-blue-50">
                    <td className="px-3 py-2">{p.SlNo}</td>
                    <td className="px-3 py-2">
                      {NO_LINK_PARTICULARS.includes(p.Name) ? (
                        <span>{p.Name}</span>
                      ) : (
                        <button
                          onClick={() => openParticularPage(p)}
                          title="Open this particular's page in a new tab"
                          className="text-blue-600 hover:underline text-left"
                        >
                          {p.Name}
                        </button>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <button
                        onClick={() => openParticular(p)}
                        title="Click to update status / details"
                        className={`px-2 py-0.5 rounded text-xs font-medium cursor-pointer ${
                          p.Status === 'Completed' ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                        }`}
                      >
                        {p.Status}
                      </button>
                    </td>
                    <td className="px-3 py-2 text-center">
                      {p.Name === 'Calendar of Events' ? (
                        <button
                          onClick={openCoeModal}
                          title="Select and print a saved Calendar of Events"
                          className="text-red-600 hover:text-red-800"
                        >
                          📄
                        </button>
                      ) : (
                        <button
                          onClick={() =>
                            downloadPdf(
                              `${API_URL}/api/course-file/${courseFile._id}/particular/${p.SlNo}/pdf`,
                              `${courseFile.CourseCode}_${p.SlNo}.pdf`
                            )
                          }
                          title="Download this particular as PDF"
                          className="text-red-600 hover:text-red-800"
                        >
                          📄
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {activeParticular && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={() => setActiveParticular(null)}
        >
          <div className="bg-white rounded-lg shadow-lg p-5 w-[480px]" onClick={(e) => e.stopPropagation()}>
            <h4 className="text-sm font-semibold mb-3">
              {activeParticular.SlNo}. {activeParticular.Name}
            </h4>

            <div className="mb-3">
              <label className="block text-xs text-slate-500 mb-1">Status</label>
              <select
                value={popupStatus}
                onChange={(e) => setPopupStatus(e.target.value)}
                className="border px-2 py-1 rounded w-full text-sm"
              >
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-xs text-slate-500 mb-1">Details / Notes</label>
              <textarea
                value={popupDetails}
                onChange={(e) => setPopupDetails(e.target.value)}
                rows={5}
                className="border px-2 py-1 rounded w-full text-sm"
                placeholder="Enter details for this particular (e.g. link, file location, remarks)..."
              />
            </div>

            <div className="flex justify-end gap-2">
              <button onClick={() => setActiveParticular(null)} className="px-3 py-1.5 rounded text-sm border">
                Cancel
              </button>
              <button onClick={handleSaveParticular} className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      {showCoeModal && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-6"
          onClick={() => setShowCoeModal(false)}
        >
          <div className="bg-white rounded-lg shadow-lg p-5 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold">Print Calendar of Events</h4>
              <button onClick={() => setShowCoeModal(false)} className="text-slate-400 hover:text-slate-700 text-xl leading-none">
                ×
              </button>
            </div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Select Calendar</label>
            <select
              value={coeSelectId}
              onChange={(e) => setCoeSelectId(e.target.value)}
              className="border px-2 py-1 rounded w-full mb-4"
            >
              <option value="">-- Select --</option>
              {coeDocs.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.Title || 'Untitled'} ({d.Semester}, {d.AcademicYear} {d.Term})
                </option>
              ))}
            </select>
            <button
              onClick={printSignedCoe}
              disabled={!coeSelectId}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 w-full"
            >
              View / Print Signed Copy
            </button>
            <p className="text-xs text-slate-400 mt-2">
              Opens the uploaded signed PDF in a new tab — use the browser's print option there.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default CourseFile