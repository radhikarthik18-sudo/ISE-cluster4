import { Link, useNavigate, useLocation } from "react-router-dom"

function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()

  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const roles = user.Roles || []

  const hasAnyRole = (allowedRoles) => allowedRoles.some((r) => roles.includes(r))

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const linkClass = (path) =>
    `px-3 py-1.5 rounded-md transition-colors ${
      location.pathname.startsWith(path)
        ? 'bg-slate-700 text-white'
        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
    }`

  return (
    <nav className="bg-slate-900 font-mono font-semibold text-sm px-6 py-3 border-b border-slate-700">
      <ul className="flex gap-2 items-center">
        <li>
          <Link to="/" className={linkClass('/')}>Home</Link>
        </li>

        {hasAnyRole(['Admin', 'StudentCoordinator']) && (
          <li>
            <Link to="/student/admission" className={linkClass('/student')}>Student</Link>
          </li>
        )}

        {hasAnyRole(['Admin', 'ProctorCoordinator']) && (
          <li>
            <Link to="/faculty/records" className={linkClass('/faculty')}>Faculty</Link>
          </li>
        )}

        {hasAnyRole(['Admin', 'HOD', 'Faculty', 'AcademicCoordinator']) && (
          <li>
            <Link to="/academics" className={linkClass('/academics')}>Academics</Link>
          </li>
        )}

        {hasAnyRole(['Admin', 'PlacementCoordinator']) && (
          <li>
            <Link to="/placement" className={linkClass('/placement')}>Placement</Link>
          </li>
        )}

        <li className="ml-auto flex items-center gap-4">
          {user.Name && (
            <span className="text-slate-400 text-xs font-normal hidden sm:inline">
              {user.Name}
            </span>
          )}
          <button
            onClick={handleLogout}
            className="bg-red-600/90 hover:bg-red-600 text-white text-xs px-3 py-1.5 rounded-md transition-colors"
          >
            Logout
          </button>
        </li>
      </ul>
    </nav>
  )
}

export default Navbar