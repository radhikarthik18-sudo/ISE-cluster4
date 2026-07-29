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
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-slate-900 to-slate-800 text-white flex-col justify-center px-14 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-orange-500" />

        <div className="flex items-center gap-4 mb-10">
          <img src={logo} alt="Department Logo" className="w-20 h-20 object-cover shrink-0 rounded-full ring-2 ring-orange-400/40" />
          <div>
            <h1 className="text-2xl font-bold leading-tight">Department of ISE - Cluster4</h1>
            <p className="text-sm text-slate-400">BMS Institute of Technology & Management</p>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-orange-400 font-semibold text-xs uppercase tracking-widest mb-2">Vision</h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            To emerge as one of the finest technical institutions of higher learning, to develop
            engineering professionals who are technically competent, ethical and environment
            friendly for betterment of the society.
          </p>
        </div>

        <div>
          <h2 className="text-orange-400 font-semibold text-xs uppercase tracking-widest mb-2">Mission</h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Accomplish stimulating learning environment through high quality academic instruction,
            innovation and industry-institute interface.
          </p>
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex items-center justify-center bg-slate-50 px-6">
        <div className="card w-full max-w-sm shadow-lg">

          {/* Logo shown here too, only on small screens where left panel is hidden */}
          <div className="flex md:hidden items-center gap-3 mb-6 justify-center">
            <img src={logo} alt="Department Logo" className="w-12 h-12 object-cover shrink-0 rounded-full" />
            <div>
              <p className="font-bold text-sm leading-tight">Department of ISE - Cluster4</p>
              <p className="text-xs text-slate-600">BMSIT&M</p>
            </div>
          </div>

          <h2 className="text-xl font-bold mb-1 text-center text-slate-800">Faculty Login</h2>
          <p className="text-xs text-slate-500 text-center mb-6">Sign in with your Faculty ID and password</p>

          <label className="field-label">Faculty ID</label>
          <input
            type="text"
            value={facultyId}
            onChange={(e) => setFacultyId(e.target.value)}
            className="field-input mb-4"
          />

          <label className="field-label">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="field-input mb-6"
          />

          <button
            onClick={handleLogin}
            className="btn-primary w-full"
          >
            Login
          </button>
        </div>
      </div>

    </div>
  )
}

export default Loginimport { useState } from 'react'
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
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-slate-900 to-slate-800 text-white flex-col justify-center px-14 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-orange-500" />

        <div className="flex items-center gap-4 mb-10">
          <img src={logo} alt="Department Logo" className="w-20 h-20 object-cover shrink-0 rounded-full ring-2 ring-orange-400/40" />
          <div>
            <h1 className="text-2xl font-bold leading-tight">Department of ISE - Cluster4</h1>
            <p className="text-sm text-slate-400">BMS Institute of Technology & Management</p>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-orange-400 font-semibold text-xs uppercase tracking-widest mb-2">Vision</h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            To emerge as one of the finest technical institutions of higher learning, to develop
            engineering professionals who are technically competent, ethical and environment
            friendly for betterment of the society.
          </p>
        </div>

        <div>
          <h2 className="text-orange-400 font-semibold text-xs uppercase tracking-widest mb-2">Mission</h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Accomplish stimulating learning environment through high quality academic instruction,
            innovation and industry-institute interface.
          </p>
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex items-center justify-center bg-slate-50 px-6">
        <div className="card w-full max-w-sm shadow-lg">

          {/* Logo shown here too, only on small screens where left panel is hidden */}
          <div className="flex md:hidden items-center gap-3 mb-6 justify-center">
            <img src={logo} alt="Department Logo" className="w-12 h-12 object-cover shrink-0 rounded-full" />
            <div>
              <p className="font-bold text-sm leading-tight">Department of ISE - Cluster4</p>
              <p className="text-xs text-slate-600">BMSIT&M</p>
            </div>
          </div>

          <h2 className="text-xl font-bold mb-1 text-center text-slate-800">Faculty Login</h2>
          <p className="text-xs text-slate-500 text-center mb-6">Sign in with your Faculty ID and password</p>

          <label className="field-label">Faculty ID</label>
          <input
            type="text"
            value={facultyId}
            onChange={(e) => setFacultyId(e.target.value)}
            className="field-input mb-4"
          />

          <label className="field-label">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="field-input mb-6"
          />

          <button
            onClick={handleLogin}
            className="btn-primary w-full"
          >
            Login
          </button>
        </div>
      </div>

    </div>
  )
}

export default Login