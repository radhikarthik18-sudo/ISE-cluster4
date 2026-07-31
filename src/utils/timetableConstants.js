// Shared between TimeTableEntry (editing) and FacultyTimeTableView (read-only)
// so both grids always stay in sync.

export const PERIOD_SLOTS = [
  { label: '8:30 - 9:25', type: 'class' },
  { label: '9:25 - 10:20', type: 'class' },
  { label: '10:20 - 10:40', type: 'break', name: 'Break' },
  { label: '10:40 - 11:35', type: 'class' },
  { label: '11:35 - 12:30', type: 'class' },
  { label: '12:30 - 1:25', type: 'break', name: 'Lunch Break' },
  { label: '1:25 - 2:20', type: 'class' },
  { label: '2:20 - 3:15', type: 'class' },
  { label: '3:15 - 4:10', type: 'class' },
]

export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export const SECTIONS = ['10-J', '11-K', '12-L']