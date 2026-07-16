// Common letterhead for ALL printable department documents (CoE today,
// more document types later). Update the institute name/address/logos
// here ONCE and every document using <InstituteHeader /> stays in sync.
//
// Drop the actual logo image files into your app's /public/logos/ folder as:
//   public/logos/bmsit-logo.png
//   public/logos/vtu-logo.png
// If a logo file is missing, it just hides itself instead of showing a broken image icon.

function InstituteHeader({ title, semester, academic, term }) {
  return (
    <div className="border-b-2 border-slate-800 print:break-inside-avoid">
      <div className="flex items-center justify-between p-3 gap-3">
        <img
          src="/logos/bmsit-logo.jpeg"
          alt="BMSIT Logo"
          className="w-20 h-20 object-cover shrink-0"
          onError={(e) => {
            e.currentTarget.style.visibility = 'hidden'
          }}
        />
        <div className="flex-1 text-center">
          <div className="text-red-600 font-bold text-base leading-tight">
            BMS INSTITUTE OF TECHNOLOGY &amp; MANAGEMENT
          </div>
          <div className="text-[10px]">(An Autonomous Institution affiliated to VTU, Belagavi)</div>
          <div className="text-[10px]">Yelahanka, Bengaluru-560119</div>
          {title && <div className="text-blue-700 font-semibold mt-1">{title}</div>}
          {(semester || academic || term) && (
            <div className="text-[11px] font-medium text-slate-700 mt-0.5">
              {semester && `Semester: ${semester}`}
              {semester && (academic || term) && ' | '}
              {academic && `Academic Year: ${academic}`}
              {academic && term && ' | '}
              {term && `Term: ${term}`}
            </div>
          )}
        </div>
        <img
          src="/logos/vtu-logo.jpeg"
          alt="VTU Logo"
          className="w-20 h-20 object-cover shrink-0"
          onError={(e) => {
            e.currentTarget.style.visibility = 'hidden'
          }}
        />
      </div>
    </div>
  )
}

export default InstituteHeader