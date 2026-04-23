import { useState, useEffect, useRef } from 'react'
import ForceGraph2D from 'react-force-graph-2d'
import { getGraphData, getMyProgress } from '../api/client'
import { useNavigate } from 'react-router-dom'

const STATUS_COLOR = {
  completed: '#0D7377',
  unlocked:  '#14B8A6',
  locked:    '#CBD5E1',
  unknown:   '#CBD5E1',
}

export default function GraphPage() {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] })
  const [progress,  setProgress]  = useState({})
  const [selected,  setSelected]  = useState(null)
  const navigate  = useNavigate()
  const graphRef  = useRef()

  useEffect(() => {
    Promise.all([getGraphData(), getMyProgress()]).then(([gRes, pRes]) => {
      const prog = {}
      pRes.data.forEach(p => { prog[p.topic_id] = p })
      setProgress(prog)

      const nodes = gRes.data.nodes.map(n => ({
        ...n,
        color: STATUS_COLOR[prog[n.id]?.status || 'unknown'],
        val: (prog[n.id]?.status === 'completed' ? 2 : 1) * (6 - n.difficulty) + 3,
      }))
      setGraphData({ nodes, links: gRes.data.links })
    })
  }, [])

  const handleNodeClick = (node) => setSelected(node)

  return (
    <div className="flex h-[calc(100vh-56px)]">
      {/* Graph canvas */}
      <div className="flex-1 bg-slate-900 relative">
        <div className="absolute top-4 left-4 z-10 bg-white/10 backdrop-blur rounded-xl p-3 text-white text-xs space-y-1">
          <div className="font-semibold mb-1 text-slate-300">Legend</div>
          {[['#0D7377','Completed'],['#14B8A6','Unlocked'],['#CBD5E1','Locked']].map(([c,l]) => (
            <div key={l} className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full inline-block" style={{background:c}}></span> {l}
            </div>
          ))}
        </div>
        <ForceGraph2D
          ref={graphRef}
          graphData={graphData}
          nodeLabel="name"
          nodeColor="color"
          nodeVal="val"
          linkColor={() => '#334155'}
          linkDirectionalArrowLength={4}
          linkDirectionalArrowRelPos={1}
          onNodeClick={handleNodeClick}
          backgroundColor="#0F172A"
          nodeCanvasObjectMode={() => 'after'}
          nodeCanvasObject={(node, ctx, globalScale) => {
            const label = node.name
            const fontSize = Math.max(10 / globalScale, 4)
            ctx.font = `${fontSize}px Sans-Serif`
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillStyle = '#E2E8F0'
            ctx.fillText(label, node.x, node.y + 10)
          }}
        />
      </div>

      {/* Side panel */}
      <div className="w-72 bg-white border-l border-slate-200 p-5 overflow-y-auto">
        {selected ? (
          <div>
            <h2 className="text-lg font-bold text-navy mb-1">{selected.name}</h2>
            <p className="text-xs text-slate-500 mb-3">{selected.description}</p>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Difficulty</span>
                <span className="font-medium">{'⭐'.repeat(selected.difficulty)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Status</span>
                <span className={`font-medium capitalize ${
                  progress[selected.id]?.status === 'completed' ? 'text-teal-600' :
                  progress[selected.id]?.status === 'unlocked'  ? 'text-blue-600' : 'text-slate-400'
                }`}>{progress[selected.id]?.status || 'locked'}</span>
              </div>
              {progress[selected.id] && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">P(Know)</span>
                  <span className="font-medium text-teal-700">{(progress[selected.id].p_know * 100).toFixed(0)}%</span>
                </div>
              )}
            </div>
            {(progress[selected.id]?.status === 'unlocked' || progress[selected.id]?.status === 'completed') && (
              <button onClick={() => navigate(`/quiz/${selected.id}`)}
                className="w-full bg-teal-700 text-white py-2 rounded-lg text-sm font-medium hover:bg-teal-800 transition-colors">
                {progress[selected.id]?.status === 'completed' ? 'Retake Quiz' : 'Start Quiz →'}
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 text-center">
            <p className="text-sm">Click any node to see topic details</p>
          </div>
        )}
      </div>
    </div>
  )
}
