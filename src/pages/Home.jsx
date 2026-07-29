import { Link } from 'react-router-dom'

function Home() {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const roles = user.Roles || []
  const hasAnyRole = (allowedRoles) => allowedRoles.some((r) => roles.includes(r))

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const quickLinks = [
    {
      label: 'Student',
      description: 'Enrollment, allocation, and student records',
      path: '/student/admission',
      allowedRoles: ['Admin', 'StudentCoordinator'],
      color: 'bg-blue-600',
    },
    {
      label: 'Faculty',
      description: 'Faculty records and proctor allotment',
      path: '/faculty/records',
      allowedRoles: ['Admin', 'ProctorCoordinator'],
      color: 'bg-emerald-600',
    },
    {
      label: 'Academics',
      description: 'Attendance, courses, lesson plans, and COE',
      path: '/academics',
      allowedRoles: ['Admin', 'HOD', 'Faculty', 'AcademicCoordinator'],
      color: 'bg-orange-600',
    },
    {
      label: 'Placement',
      description: 'Placement drives and student records',
      path: '/placement',
      allowedRoles: ['Admin', 'PlacementCoordinator'],
      color: 'bg-purple-600',
    },
  ].filter((link) => hasAnyRole(link.allowedRoles))

  return (
    <div className="p-8 font-mono">
      <div className="mb-8">
        <p className="text-sm text-slate-500 mb-1">{greeting},</p>
        <h1 className="text-2xl font-bold text-slate-800">
          {user.Name || 'Welcome'}
        </h1>
        {roles.length > 0 && (
          <div className="flex gap-2 mt-2">
            {roles.map((role) => (
              <span
                key={role}
                className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-medium"
              >
                {role}
              </span>
            ))}
          </div>
        )}
      </div>

      {quickLinks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="card hover:shadow-md transition-shadow group"
            >
              <div className={`w-10 h-10 rounded-md ${link.color} mb-3`} />
              <h3 className="font-semibold text-slate-800 group-hover:text-slate-900 mb-1">
                {link.label}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {link.description}
              </p>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-500">No sections available for your role yet.</p>
      )}
    </div>
  )
}

export default Home