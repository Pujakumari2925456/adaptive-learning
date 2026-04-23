import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { BookOpen, LayoutDashboard, Network, LogOut } from 'lucide-react'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <nav className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between sticky top-0 z-50">
      <Link to="/dashboard" className="flex items-center gap-2 text-teal-700 font-bold text-lg">
        <BookOpen size={22} /> AdaptLearn
      </Link>
      {user && (
        <div className="flex items-center gap-6">
          <Link to="/dashboard" className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-teal-700 transition-colors">
            <LayoutDashboard size={16} /> Dashboard
          </Link>
          <Link to="/graph" className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-teal-700 transition-colors">
            <Network size={16} /> Knowledge Graph
          </Link>
          <span className="text-sm text-slate-400">Hi, {user.username}</span>
          <button onClick={handleLogout} className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700 transition-colors">
            <LogOut size={15} /> Logout
          </button>
        </div>
      )}
    </nav>
  )
}
