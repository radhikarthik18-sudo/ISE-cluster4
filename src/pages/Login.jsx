import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import logo from '../assets/bmsit logo.jpeg'
import { API_URL } from '../config'

function Login() {
  const [facultyId, setFacultyId] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const handleLogin = async () => {
    const res = await fetch(`${API_URL}/api/faculty/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ FacultyID: facultyId, Password: password }),
    })
    const data = await res.json()

    if (!res.ok) {
      alert(data.error || 'Login failed')
      return
    }

    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify({
      FacultyID: data.FacultyID,
      Name: data.Name,
      Roles: data.Roles,
    }))

    navigate('/')
  }

  return (
    <div className="min-h-screen flex font-mono">

      {/* Left panel — branding, vision, mission */}
      <div className="hidden md:flex md:w-1/2 bg-slate-900 text-white flex-col justify-center px-12">
        <div className="flex items-center gap-4 mb-8">
          <img src={logo} alt="Department Logo" className="w-20 h-20 object-cover shrink-0" />
          <div>
            <h1 className="text-2xl font-bold leading-tight">Department of ISE - Cluster4</h1>
            <p className="text-sm text-slate-300">BMS Institute of Technology & Management</p>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-orange-400 font-semibold text-sm uppercase mb-1">Vision</h2>
          <p className="text-sm text-slate-200 leading-relaxed">
            To emerge as one of the finest technical institutions of higher learning, to develop
            engineering professionals who are technically competent, ethical and environment
            friendly for betterment of the society.
          </p>
        </div>

        <div>
          <h2 className="text-orange-400 font-semibold text-sm uppercase mb-1">Mission</h2>
          <p className="text-sm text-slate-200 leading-relaxed">
            Accomplish stimulating learning environment through high quality academic instruction,
            innovation and industry-institute interface.
          </p>
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex items-center justify-center bg-slate-100 px-6">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">

          {/* Logo shown here too, only on small screens where left panel is hidden */}
          <div className="flex md:hidden items-center gap-3 mb-6 justify-center">
            <img src={logo} alt="Department Logo" className="w-12 h-12 object-cover shrink-0" />
            <div>
              <p className="font-bold text-sm leading-tight">Department of ISE - Cluster4</p>
              <p className="text-xs text-slate-600">BMSIT&M</p>
            </div>
          </div>

          <h2 className="text-xl font-bold mb-6 text-center">Faculty Login</h2>

          <label className="block text-sm font-medium mb-1">Faculty ID</label>
          <input
            type="text"
            value={facultyId}
            onChange={(e) => setFacultyId(e.target.value)}
            className="border px-3 py-2 rounded w-full mb-4"
          />

          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border px-3 py-2 rounded w-full mb-6"
          />

          <button
            onClick={handleLogin}
            className="bg-blue-600 text-white w-full py-2 rounded hover:bg-blue-700"
          >
            Login
          </button>
        </div>
      </div>

    </div>
  )
}

export default Login