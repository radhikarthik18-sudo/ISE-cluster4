import { Link } from "react-router-dom"
function Navbar() {
  

  const studentLinks = [{label: 'Admission', path:'/student/admission'}] // add more late
  const facultyLinks = [
  { label: 'Faculty Records', path: '/faculty/records' },
  { label: 'Proctor Allotment', path: '/faculty/proctor-allotment' },
]

  return (
    <nav className="___ ___ bg-slate-900 text-white font-mono font-semibold text-base px-6 py-4">
      <ul className='flex gap-6 items-center'>
        <li className='cursor-pointer hover:text-blue-200'>Home</li>

        <li className='cursor-pointer hover:text-blue-200'>
          <Link to="/student/admission">Student</Link>
        </li>
        
        <li className='cursor-pointer hover:text-blue-200'>
          <Link to="/faculty/records">Faculty</Link>
        </li>
        <li className='cursor-pointer hover:text-blue-200'>
          <Link to="/academics">Academics</Link>
        </li>

        <li className='cursor-pointer hover:text-blue-200'>Placement</li>
      </ul>
    </nav>
  )
}

export default Navbar