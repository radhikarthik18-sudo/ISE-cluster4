function Sidebar({ items, activeItem, onSelect }) {
  if (items.length === 0) {
    return (
      <nav className="w-60 bg-slate-50 border-r border-slate-200 min-h-screen p-5">
        <p className="text-sm text-slate-400 italic">No sections available for your role.</p>
      </nav>
    )
  }

  return (
    <nav className="w-60 bg-slate-50 border-r border-slate-200 min-h-screen p-5">
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li
            key={item.key}
            onClick={() => onSelect(item.key)}
            className={`relative cursor-pointer px-4 py-2.5 rounded-md text-sm font-medium transition-all duration-150 ${
              activeItem === item.key
                ? 'bg-orange-600 text-white shadow-sm pl-5'
                : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
            }`}
          >
            {activeItem === item.key && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-orange-300 rounded-r" />
            )}
            {item.label}
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default Sidebar