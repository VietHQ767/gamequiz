import { Routes, Route, Navigate } from 'react-router-dom'
import { useAppSelector } from '@/store/hooks'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import DashboardLayout from '@/components/DashboardLayout'
import AdminLayout from '@/components/AdminLayout'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import DashboardHome from '@/pages/DashboardHome'
import QuizPage from '@/pages/QuizPage'
import QuizCompleted from '@/pages/QuizCompleted'
import Article from '@/pages/Article'
import AdminHome from '@/pages/AdminHome'
import ManageQuizzes from '@/pages/ManageQuizzes'
import ManageQuizQuestions from '@/pages/ManageQuizQuestions'
import ManageArticles from '@/pages/ManageArticles'

function PublicOnly({ children }: { children: React.ReactNode }) {
  const { user, token } = useAppSelector((s) => s.auth)
  if (token && user) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />
  }
  return <>{children}</>
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicOnly>
            <Login />
          </PublicOnly>
        }
      />
      <Route
        path="/register"
        element={
          <PublicOnly>
            <Register />
          </PublicOnly>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardHome />} />
        <Route path="quiz" element={<QuizPage />} />
        <Route path="quiz/completed" element={<QuizCompleted />} />
        <Route path="quiz/:quizId" element={<QuizPage />} />
        <Route path="article" element={<Article />} />
      </Route>
      <Route
        path="/admin"
        element={
          <ProtectedRoute requireAdmin>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminHome />} />
        <Route path="quizzes" element={<ManageQuizzes />} />
        <Route path="quizzes/:quizId/questions" element={<ManageQuizQuestions />} />
        <Route path="articles" element={<ManageArticles />} />
      </Route>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
