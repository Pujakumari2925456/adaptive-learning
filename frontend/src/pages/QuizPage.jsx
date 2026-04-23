import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { generateQuiz, submitQuiz } from '../api/client'
import { CheckCircle2, XCircle, ExternalLink, ArrowRight, RotateCcw } from 'lucide-react'

export default function QuizPage() {
  const { topicId } = useParams()
  const navigate    = useNavigate()

  const [quiz,      setQuiz]      = useState(null)
  const [rawQs,     setRawQs]     = useState([])
  const [answers,   setAnswers]   = useState({})
  const [result,    setResult]    = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [submitting,setSubmitting]= useState(false)

  useEffect(() => { loadQuiz() }, [topicId])

  const loadQuiz = async () => {
    setLoading(true); setResult(null); setAnswers({})
    try {
      const res = await generateQuiz(topicId)
      setQuiz(res.data)
      setRawQs(res.data._raw || res.data.questions)
    } finally { setLoading(false) }
  }

  const handleSubmit = async () => {
    if (Object.keys(answers).length < quiz.questions.length) {
      alert('Please answer all questions before submitting.')
      return
    }
    setSubmitting(true)
    try {
      const answerArr = quiz.questions.map((_, i) => answers[i] ?? -1)
      const res = await submitQuiz({
        topic_id: topicId,
        answers: answerArr,
        questions: rawQs,
      })
      setResult(res.data)
    } finally { setSubmitting(false) }
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-96 gap-3 text-slate-400">
      <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-sm">Generating quiz with AI...</p>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-6">
        <p className="text-xs font-semibold text-teal-600 uppercase tracking-wider mb-1">Quiz</p>
        <h1 className="text-2xl font-bold text-navy">{quiz?.topic_name}</h1>
        <p className="text-sm text-slate-500 mt-1">Answer all 3 questions. Score 2/3 or better to unlock next topics.</p>
      </div>

      {!result ? (
        <>
          <div className="space-y-6">
            {quiz?.questions.map((q, qi) => (
              <div key={qi} className="bg-white rounded-2xl border border-slate-200 p-6">
                <p className="font-semibold text-slate-800 mb-4 text-sm leading-relaxed">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-teal-100 text-teal-700 text-xs font-bold mr-2">{qi+1}</span>
                  {q.question}
                </p>
                <div className="space-y-2">
                  {q.options.map((opt, oi) => (
                    <button key={oi} onClick={() => setAnswers({...answers, [qi]: oi})}
                      className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all
                        ${answers[qi] === oi
                          ? 'bg-teal-50 border-teal-400 text-teal-800 font-medium'
                          : 'border-slate-200 text-slate-600 hover:border-teal-300 hover:bg-teal-50/50'}`}>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button onClick={handleSubmit} disabled={submitting}
            className="mt-6 w-full bg-teal-700 text-white py-3.5 rounded-xl font-semibold hover:bg-teal-800 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
            {submitting ? 'Evaluating...' : <><ArrowRight size={16} /> Submit Answers</>}
          </button>
        </>
      ) : (
        /* Results screen */
        <div>
          <div className={`rounded-2xl p-6 mb-6 ${result.passed ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <div className="flex items-center gap-3 mb-2">
              {result.passed
                ? <CheckCircle2 size={28} className="text-green-600" />
                : <XCircle     size={28} className="text-red-500" />}
              <h2 className="text-xl font-bold">{result.passed ? '🎉 Passed!' : '😓 Not quite'}</h2>
            </div>
            <p className="text-sm text-slate-600">Score: <strong>{result.score}/3</strong> · Mastery: <strong>{(result.p_know*100).toFixed(0)}%</strong></p>
            {result.newly_unlocked.length > 0 && (
              <p className="text-sm text-green-700 mt-2 font-medium">Unlocked: {result.newly_unlocked.join(', ')}</p>
            )}
          </div>

          {/* Per-question breakdown */}
          <div className="space-y-4 mb-6">
            {result.results.map((r, i) => (
              <div key={i} className={`rounded-xl border p-4 ${r.is_correct ? 'border-green-200 bg-green-50/50' : 'border-red-200 bg-red-50/50'}`}>
                <div className="flex items-start gap-2 mb-2">
                  {r.is_correct
                    ? <CheckCircle2 size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                    : <XCircle     size={16} className="text-red-500 mt-0.5 flex-shrink-0" />}
                  <p className="text-sm font-medium text-slate-800">{r.question}</p>
                </div>
                {!r.is_correct && r.explanation && (
                  <p className="text-xs text-slate-500 mt-1 ml-6 italic">{r.explanation}</p>
                )}
              </div>
            ))}
          </div>

          {/* Resource on fail */}
          {result.resource_suggestion && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <p className="text-sm font-semibold text-blue-800 mb-2">📚 Review Resources</p>
              <p className="text-xs text-blue-600 mb-3">{result.resource_suggestion.message}</p>
              <div className="flex gap-2 flex-wrap">
                {[['YouTube Tutorial', result.resource_suggestion.youtube], ['MDN Docs', result.resource_suggestion.mdn]].map(([label, url]) => (
                  <a key={label} href={url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs bg-white border border-blue-200 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">
                    <ExternalLink size={12} /> {label}
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={loadQuiz} className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
              <RotateCcw size={15} /> Retake Quiz
            </button>
            <button onClick={() => navigate('/dashboard')} className="flex-1 bg-teal-700 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-teal-800 transition-colors">
              Back to Dashboard →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
