import { Routes, Route } from 'react-router-dom'
import logo from './assets/bmsit logo.jpeg'
import Navbar from "./components/Navbar"
import Home from './pages/Home'
import Admission from './pages/Admission'
import Faculty from './pages/FacultyRecord'
import Academics from './pages/Academics'
function App() {
  return (
    <div>
      <div className='flex'>
        <img src={logo} alt="Department Logo" className="h-16 w-26" />
        <div className='flex-1'>
          <h1 className="pt-2 pl-2  font-mono pb-2 bg-slate-900 text-2xl font-bold text-white">Department of ISE - Cluster4</h1>
          <p className="pl-2 font-semibold bg-slate-700 text-sm text-white">BMS Institute of Technology & Management </p>
        </div>
      </div>
      <Navbar />
      
      <Routes>
        <Route path='/' element={<Home />}/>
        <Route path='/student/admission' element={<Admission />}/>
        <Route path='/faculty/records' element={<Faculty />} />
        <Route path='/academics' element={<Academics />} />
      </Routes>
    </div>
    
  )
}

export default App