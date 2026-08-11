// Common letterhead for ALL printable department documents (CoE today,
// more document types later). Update the institute name/address/logos
// here ONCE and every document using <InstituteHeader /> stays in sync.
//
// Drop the actual logo image files into your app's /public/logos/ folder as:
//   public/logos/bmsit-logo.png
//   public/logos/vtu-logo.png
//   public/logos/College Name.png
// If a logo file is missing, it just hides itself instead of showing a broken image icon.

function InstituteHeader({ title, department = 'Department of Computer Science and Engineering', semester, academic, term }) {
  return (
    <div className="border-b-2 border-slate-800 print:break-inside-avoid">
      <div className="flex items-center justify-between p-3">
        <img
          src="/logos/bmsit-logo.jpeg"
          alt="BMSIT Logo"
          className="w-20 h-20 object-cover shrink-0"
          onError={(e) => {
            e.currentTarget.style.visibility = 'hidden'
          }}
        />
        <img
          src="/logos/College Name.png"
          alt="BMS Institute of Technology & Management"
          className="flex-1 h-20 object-contain mx-4"
          onError={(e) => {
            e.currentTarget.style.visibility = 'hidden'
          }}
        />
        <img
          src="/logos/vtu-logo.jpeg"
          alt="VTU Logo"
          className="w-20 h-20 object-cover shrink-0"
          onError={(e) => {
            e.currentTarget.style.visibility = 'hidden'
          }}
        />
      </div>

      <div className="text-center pb-2" style={{ fontFamily: 'Times New Roman, Times, serif' }}>
        <p className="font-bold text-base" style={{ color: '#FF0000' }}>
          {department}
        </p>
        {title && (
          <p className="font-semibold text-sm mt-0.5" style={{ color: '#FF0000' }}>
            {title} of B.E. {semester} Semester {academic} ({term})
          </p>
        )}
      </div>
    </div>
  )
}

export default InstituteHeader