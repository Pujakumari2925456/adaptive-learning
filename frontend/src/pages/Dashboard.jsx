import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDashboard } from '../api/client'
import { RadialBarChart, RadialBar, ResponsiveContainer, Tooltip } from 'recharts'
import { CheckCircle2, Unlock, AlertTriangle, Play, Trophy } from 'lucide-react'

const DIFF_COLOR = ['','bg-green-100 text-green-700','bg-blue-100 text-blue-700',
                    'bg-yellow-100 text-yellow-700','bg-orange-100 text-orange-700']

export default function Dashboard() {
  const [data, setData]     = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    getDashboard()
      .then(r => setData(r.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex items-center justify-center h-96 text-slate-400">Loading dashboard...</div>
  if (!data)   return null

  const chartData = [{ name: 'Progress', value: data.completion_pct, fill: '#0D7377' }]

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-navy">Welcome back, {data.username} 👋</h1>
        <p className="text-slate-500 text-sm mt-1">Here's your learning progress</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Completed', value: data.completed_count, icon: <CheckCircle2 size={20} className="text-teal-600" />, color: 'bg-teal-50' },
          { label: 'Unlocked', value: data.unlocked_count,   icon: <Unlock size={20} className="text-blue-600" />,    color: 'bg-blue-50' },
          { label: 'Total Topics', value: data.total_topics, icon: <Trophy size={20} className="text-yellow-600" />,  color: 'bg-yellow-50' },
          { label: 'Completion',   value: `${data.completion_pct}%`, icon: <Play size={20} className="text-purple-600" />, color: 'bg-purple-50' },
        ].map(c => (
          <div key={c.label} className={`${c.color} rounded-2xl p-4`}>
            <div className="flex items-center gap-2 mb-1">{c.icon}<span className="text-xs font-medium text-slate-500">{c.label}</span></div>
            <div className="text-2xl font-bold text-navy">{c.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress ring */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col items-center justify-center">
          <h2 className="text-sm font-semibold text-slate-500 mb-2 uppercase tracking-wide">Overall Progress</h2>
          <ResponsiveContainer width="100%" height={180}>
            <RadialBarChart innerRadius="60%" outerRadius="90%" data={chartData} startAngle={90} endAngle={-270}>
              <RadialBar dataKey="value" cornerRadius={8} background={{ fill: '#f1f5f9' }} />
              <Tooltip formatter={v => `${v}%`} />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="text-3xl font-bold text-teal-700 -mt-4">{data.completion_pct}%</div>
          <div className="text-xs text-slate-400 mt-1">{data.completed_count} of {data.total_topics} topics</div>
        </div>

        {/* Next recommended */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="text-sm font-semibold text-slate-500 mb-4 uppercase tracking-wide">Recommended Next</h2>
          <div className="space-y-3">
            {data.next_recommended.length === 0
              ? <p className="text-sm text-slate-400">All prerequisites completed!</p>
              : data.next_recommended.map(t => (
                <button key={t.id} onClick={() => navigate(`/quiz/${t.id}`)}
                  className="w-full flex items-center justify-between p-3 bg-teal-50 hover:bg-teal-100 rounded-xl transition-colors group">
                  <div className="text-left">
                    <div className="text-sm font-semibold text-teal-800">{t.name}</div>
                    <div className="text-xs text-teal-600 mt-0.5">{t.description?.slice(0,40)}...</div>
                  </div>
                  <Play size={16} className="text-teal-600 group-hover:translate-x-1 transition-transform" />
                </button>
              ))}
          </div>
        </div>

        {/* Confused topics alert */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="text-sm font-semibold text-slate-500 mb-4 uppercase tracking-wide">Needs Attention</h2>
          {data.confused_topics.length === 0
            ? <div className="flex flex-col items-center justify-center h-28 text-slate-300">
                <CheckCircle2 size={32} /><p className="text-sm mt-2">All good!</p>
              </div>
            : <div className="space-y-2">
                {data.confused_topics.map(t => (
                  <div key={t.topic_id} className="flex items-start gap-2 p-3 bg-orange-50 rounded-xl">
                    <AlertTriangle size={15} className="text-orange-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-sm font-medium text-orange-800">{t.topic_name}</div>
                      <div className="text-xs text-orange-600">{t.attempts} attempts · P(know)={t.p_know}</div>
                    </div>
                  </div>
                ))}
              </div>
          }
        </div>
      </div>

      {/* Unlocked topics */}
      <div className="mt-6 bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="text-sm font-semibold text-slate-500 mb-4 uppercase tracking-wide">Unlocked Topics — Ready to Learn</h2>
        {data.unlocked_topics.length === 0
          ? <p className="text-sm text-slate-400">Complete topics to unlock more!</p>
          : <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {data.unlocked_topics.map(t => (
                <button key={t.id} onClick={() => navigate(`/quiz/${t.id}`)}
                  className="flex items-center gap-2 p-3 bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-300 rounded-xl transition-all group text-left">
                  <Unlock size={14} className="text-slate-400 group-hover:text-teal-600 flex-shrink-0" />
                  <span className="text-sm font-medium text-slate-700 group-hover:text-teal-800">{t.name}</span>
                </button>
              ))}
            </div>
        }
      </div>

      {/* Recent attempts */}
      <div className="mt-6 bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="text-sm font-semibold text-slate-500 mb-4 uppercase tracking-wide">Recent Quiz Attempts</h2>
        {data.recent_attempts.length === 0
          ? <p className="text-sm text-slate-400">No quizzes taken yet. Start learning!</p>
          : <div className="space-y-2">
              {data.recent_attempts.map((a,i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <span className="text-sm text-slate-700">{a.topic_name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-slate-600">{a.score}/3</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${a.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                      {a.passed ? 'Passed' : 'Failed'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
        }
      </div>
    </div>
  )
}
