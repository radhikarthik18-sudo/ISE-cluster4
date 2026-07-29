import { Link, useNavigate } from "react-router-dom"

function Navbar() {
  const navigate = useNavigate()

  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const roles = user.Roles || []

  const hasAnyRole = (allowedRoles) => allowedRoles.some((r) => roles.includes(r))

  const facultyLinks = [
    { label: 'Faculty Records', path: '/faculty/records' },
    { label: 'Proctor Allotment', path: '/faculty/proctor-allotment' },
  ]

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <nav className="bg-slate-900 text-white font-mono font-semibold text-base px-6 py-4">
      <ul className='flex gap-6 items-center'>
        <li className='cursor-pointer hover:text-blue-200'>
          <Link to="/">Home</Link>
        </li>

        {hasAnyRole(['Admin', 'StudentCoordinator']) && (
          <li className='cursor-pointer hover:text-blue-200'>
            <Link to="/student/admission">Student</Link>
          </li>
        )}

        {hasAnyRole(['Admin', 'ProctorCoordinator']) && (
          <li className='cursor-pointer hover:text-blue-200'>
            <Link to="/faculty/records">Faculty</Link>
          </li>
        )}

        {hasAnyRole(['Admin', 'HOD', 'Faculty', 'AcademicCoordinator']) && (
          <li className='cursor-pointer hover:text-blue-200'>
            <Link to="/academics">Academics</Link>
          </li>
        )}

        {hasAnyRole(['Admin', 'PlacementCoordinator']) && (
          <li className='cursor-pointer hover:text-blue-200'>Placement</li>
        )}

        <li className="ml-auto cursor-pointer hover:text-blue-200" onClick={handleLogout}>
          Logout
        </li>
      </ul>
    </nav>
  )
}

export default Navbar