import { useState, useEffect } from 'react'
import { API_URL } from '../config'

function COEUpload() {
  const [docs, setDocs] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [currentSignedInfo, setCurrentSignedInfo] = useState(null)

  const authHeaders = { Authorization: `Bearer ${localStorage.getItem('token')}` }

  useEffect(() => {
    fetch(`${API_URL}/api/coe`)
      .then((res) => res.json())
      .then(setDocs)
      .catch(() => setDocs([]))
  }, [])

  useEffect(() => {
    if (!selectedId) {
      setCurrentSignedInfo(null)
      return
    }
    fetch(`${API_URL}/api/coe/${selectedId}`)
      .then((res) => res.json())
      .then((doc) => setCurrentSignedInfo(doc?.SignedPdf?.filename || null))
  }, [selectedId])

  const handleFileChange = (e) => {
    const f = e.target.files[0]
    if (f && f.type !== 'application/pdf') {
      alert('Please select a PDF file')
      e.target.value = ''
      return
    }
    setFile(f || null)
  }

  const handleUpload = async () => {
    if (!selectedId) return alert('Select a Calendar of Events first')
    if (!file) return alert('Choose a signed PDF to upload')

    const payload = new FormData()
    payload.append('SignedPdf', file)

    setUploading(true)
    try {
      const res = await fetch(`${API_URL}/api/coe/${selectedId}/signed-pdf`, {
        method: 'POST',
        headers: authHeaders,
        body: payload,
      })
      const data = await res.json()
      if (!res.ok) {
        alert(data.error || 'Upload failed')
        return
      }
      alert('Signed copy uploaded!')
      setCurrentSignedInfo(file.name)
      setFile(null)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="w-full font-mono max-w-lg">
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1 text-gray-700">Select Calendar</label>
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="border px-2 py-1 rounded w-full"
        >
          <option value="">-- Select --</option>
          {docs.map((d) => (
            <option key={d._id} value={d._id}>
              {d.Title || 'Untitled'} ({d.Semester}, {d.AcademicYear} {d.Term})
            </option>
          ))}
        </select>
      </div>

      {selectedId && (
        <div className="border rounded-lg p-4 bg-white shadow-sm">
          {currentSignedInfo && (
            <p className="text-xs text-slate-500 mb-3">
              Current signed copy on file: <span className="font-medium">{currentSignedInfo}</span> — uploading a new file will replace it.
            </p>
          )}
          <label className="block text-sm font-medium mb-1 text-gray-700">Signed Copy (PDF)</label>
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="block text-sm border rounded px-2 py-1.5 w-full mb-3"
          />
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      )}
    </div>
  )
}

export default COEUpload