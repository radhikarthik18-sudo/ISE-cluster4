function Sidebar({ items, activeItem, onSelect }) {
  if (items.length === 0) {
    return (
      <nav className="w-56 bg-slate-100 min-h-screen p-4">
        <p className="text-sm text-slate-500">No sections available for your role.</p>
      </nav>
    )
  }

  return (
    <nav className="w-56 bg-slate-100 min-h-screen p-4">
      <ul className="space-y-2">
        {items.map((item) => (
          <li
            key={item.key}
            onClick={() => onSelect(item.key)}
            className={`cursor-pointer px-3 py-2 rounded ${
              activeItem === item.key
                ? 'bg-orange-600 text-black font-serif font-semibold'
                : 'bg-slate-500 hover:bg-slate-200'
            }`}
          >
            {item.label}
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default Sidebar