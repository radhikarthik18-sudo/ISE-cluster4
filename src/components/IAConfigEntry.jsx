import { useState, useEffect } from 'react'
import { API_URL } from '../config'

const CATEGORIES = ['HSMC', 'IPCC', 'PCC', 'PCCL', 'PEC', 'PW', 'AEC', 'MC', 'NCMC']

function IAConfigEntry() {
  const [category, setCategory] = useState('')
  const [components, setComponents] = useState([])

  const authHeaders = { 'Authorization': `Bearer ${localStorage.getItem('token')}` }

  useEffect(() => {
    if (!category) {
      setComponents([])
      return
    }
    fetch(`${API_URL}/api/ia-config/by-category/${category}`, { headers: authHeaders })
      .then((res) => res.json())
      .then((data) => setComponents(data?.Components || []))
  }, [category])

  const addComponent = () => {
    setComponents((prev) => [
      ...prev,
      { Type: 'Theory', Name: '', Count: 1, ActualMarks: '', ReducedMarks: '' },
    ])
  }

  const removeComponent = (index) => {
    setComponents((prev) => prev.filter((_, i) => i !== index))
  }

  const updateComponent = (index, field, value) => {
    setComponents((prev) =>
      prev.map((c, i) => (i === index ? { ...c, [field]: value } : c))
    )
  }

  const handleSave = async () => {
    if (!category) {
      alert('Please select a Course Category')
      return
    }
    const res = await fetch(`${API_URL}/api/ia-config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
      body: JSON.stringify({ CourseCategory: category, Components: components }),
    })
    const data = await res.json()
    if (!res.ok) {
      alert(data.error || 'Failed to save')
      return
    }
    alert('IA Configuration saved!')
  }

  return (
    <div className="w-full font-mono">
      <div className="mb-6">
        <label className="field-label">Course Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="field-input max-w-xs"
        >
          <option value="">-- Select --</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {category && (
        <div className="card">
          <h3 className="section-title">Components for {category}</h3>

          <table className="w-full border-collapse text-sm mb-4">
            <thead>
              <tr className="bg-slate-800 text-white text-left">
                <th className="border px-2 py-1">Type</th>
                <th className="border px-2 py-1">Name</th>
                <th className="border px-2 py-1 w-20">Count</th>
                <th className="border px-2 py-1 w-24">Actual Marks</th>
                <th className="border px-2 py-1 w-24">Reduced Marks</th>
                <th className="border px-2 py-1 w-16">Remove</th>
              </tr>
            </thead>
            <tbody>
              {components.map((c, index) => (
                <tr key={index}>
                  <td className="border px-2 py-1">
                    <select
                      value={c.Type}
                      onChange={(e) => updateComponent(index, 'Type', e.target.value)}
                      className="w-full border-0 focus:outline-none"
                    >
                      <option value="Theory">Theory</option>
                      <option value="Practical">Practical</option>
                    </select>
                  </td>
                  <td className="border px-2 py-1">
                    <input
                      type="text"
                      value={c.Name}
                      onChange={(e) => updateComponent(index, 'Name', e.target.value)}
                      placeholder="e.g. CIE-IA Tests"
                      className="w-full border-0 focus:outline-none"
                    />
                  </td>
                  <td className="border px-2 py-1">
                    <input
                      type="number"
                      value={c.Count}
                      onChange={(e) => updateComponent(index, 'Count', e.target.value)}
                      className="w-full border-0 focus:outline-none"
                    />
                  </td>
                  <td className="border px-2 py-1">
                    <input
                      type="number"
                      value={c.ActualMarks}
                      onChange={(e) => updateComponent(index, 'ActualMarks', e.target.value)}
                      className="w-full border-0 focus:outline-none"
                    />
                  </td>
                  <td className="border px-2 py-1">
                    <input
                      type="number"
                      value={c.ReducedMarks}
                      onChange={(e) => updateComponent(index, 'ReducedMarks', e.target.value)}
                      className="w-full border-0 focus:outline-none"
                    />
                  </td>
                  <td className="border px-2 py-1 text-center">
                    <button
                      onClick={() => removeComponent(index)}
                      className="text-red-600 font-bold"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex gap-3">
            <button onClick={addComponent} className="btn-outline text-sm">
              + Add Component
            </button>
            <button onClick={handleSave} className="btn-primary text-sm">
              Save Configuration
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default IAConfigEntry