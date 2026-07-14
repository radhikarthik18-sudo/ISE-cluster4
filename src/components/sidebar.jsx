function Sidebar({ items, activeItem, onSelect }) {
  return (
    <nav className="w-56 bg-slate-900 min-h-screen p-4">
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