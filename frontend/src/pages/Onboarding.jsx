import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllTopics, markKnown } from '../api/client'
import { CheckCircle2, Circle } from 'lucide-react'

const DIFF_LABEL = { 1:'Beginner', 2:'Easy', 3:'Intermediate', 4:'Hard', 5:'Expert' }
const DIFF_COLOR = { 1:'bg-green-100 text-green-700', 2:'bg-blue-100 text-blue-700',
                     3:'bg-yellow-100 text-yellow-700', 4:'bg-orange-100 text-orange-700', 5:'bg-red-100 text-red-700' }

export default function Onboarding() {
  const [topics,  setTopics]  = useState([])
  const [selected, setSelected] = useState(new Set())
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    getAllTopics().then(r => setTopics(r.data))
  }, [])

  const toggle = (id) => {
    const s = new Set(selected)
    s.has(id) ? s.delete(id) : s.add(id)
    setSelected(s)
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      await markKnown([...selected])
      navigate('/dashboard')
    } catch(e) { console.error(e) }
    finally { setLoading(false) }
  }

  const grouped = topics.reduce((acc, t) => {
    acc[t.difficulty] = acc[t.difficulty] || []
    acc[t.difficulty].push(t)
    return acc
  }, {})

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-navy mb-2">What do you already know?</h1>
        <p className="text-slate-500">Select all topics you're comfortable with. We'll build your personalized path from there.</p>
      </div>

      {[1,2,3,4].map(diff => (
        <div key={diff} className="mb-6">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
            {DIFF_LABEL[diff]}
          </h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {(grouped[diff] || []).map(t => (
              <button key={t.id} onClick={() => toggle(t.id)}
                className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-all
                  ${selected.has(t.id)
                    ? 'bg-teal-50 border-teal-400 text-teal-800'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-teal-300'}`}>
                {selected.has(t.id)
                  ? <CheckCircle2 size={16} className="text-teal-600 flex-shrink-0" />
                  : <Circle size={16} className="text-slate-300 flex-shrink-0" />}
                <span className="text-sm font-medium">{t.name}</span>
              </button>
            ))}
          </div>
        </div>
      ))}

      <div className="sticky bottom-4 mt-8">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-lg">
          <span className="text-sm text-slate-500">
            <strong className="text-teal-700">{selected.size}</strong> topics selected as known
          </span>
          <button onClick={handleSubmit} disabled={loading}
            className="bg-teal-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-teal-800 transition-colors disabled:opacity-60">
            {loading ? 'Building your path...' : 'Start Learning →'}
          </button>
        </div>
      </div>
    </div>
  )
}
