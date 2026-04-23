import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import Login      from './pages/Login'
import Register   from './pages/Register'
import Onboarding from './pages/Onboarding'
import Dashboard  from './pages/Dashboard'
import GraphPage  from './pages/GraphPage'
import QuizPage   from './pages/QuizPage'
import Navbar     from './components/Navbar'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex items-center justify-center h-screen text-gray-500">Loading...</div>
  return user ? children : <Navigate to="/login" />
}

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <Routes>
          <Route path="/login"      element={<Login />} />
          <Route path="/register"   element={<Register />} />
          <Route path="/onboarding" element={<PrivateRoute><Onboarding /></PrivateRoute>} />
          <Route path="/dashboard"  element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/graph"      element={<PrivateRoute><GraphPage /></PrivateRoute>} />
          <Route path="/quiz/:topicId" element={<PrivateRoute><QuizPage /></PrivateRoute>} />
          <Route path="*"           element={<Navigate to="/dashboard" />} />
        </Routes>
      </div>
    </AuthProvider>
  )
}
