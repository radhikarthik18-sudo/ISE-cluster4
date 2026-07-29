import { Routes, Route, useLocation } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoutes'
import logo from './assets/bmsit logo.jpeg'
import Navbar from "./components/Navbar"
import Home from './pages/Home'
import Admission from './pages/Admission'
import Faculty from './pages/FacultyRecord'
import Academics from './pages/Academics'
import Login from './pages/Login'

function App() {
  const location = useLocation()
  const hideNavbar = location.pathname === '/login'

  return (
    <div>
      {!hideNavbar && (
        <>
          <div className='flex'>
            <img src={logo} alt="Department Logo" className="h-16 w-26" />
            <div className='flex-1'>
              <h1 className="pt-2 pl-2 font-mono pb-2 bg-slate-900 text-2xl font-bold text-white">
                Department of ISE - Cluster4
              </h1>
              <p className="pl-2 font-semibold bg-slate-700 text-sm text-white">
                BMS Institute of Technology & Management
              </p>
            </div>
          </div>
          <Navbar />
        </>
      )}

      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/student/admission" element={<ProtectedRoute><Admission /></ProtectedRoute>} />
        <Route path="/faculty/records" element={<ProtectedRoute><Faculty /></ProtectedRoute>} />
        <Route path="/academics" element={<ProtectedRoute><Academics /></ProtectedRoute>} />
      </Routes>
    </div>
  )
}

export default App
