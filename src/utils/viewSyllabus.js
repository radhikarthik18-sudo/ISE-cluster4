import { API_URL } from '../config'

// Fetches the syllabus PDF with the auth header attached and opens it in a
// new tab. A plain <a href> won't work here since the route needs the
// Bearer token to check course allocation.
//
// Assumes the auth token is stored in localStorage under 'token' — change
// the getItem key below if your app stores it differently (context, cookie, etc.)
export async function viewSyllabus(courseId) {
  const token = localStorage.getItem('token')
  try {
    const res = await fetch(`${API_URL}/api/courses/${courseId}/syllabus`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      alert(err.error || 'Failed to load syllabus')
      return
    }
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank')
  } catch (err) {
    alert('Failed to load syllabus')
  }
}