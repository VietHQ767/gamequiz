import { Navigate, useLocation } from 'react-router-dom'
import { useAppSelector } from '@/store/hooks'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAdmin?: boolean
}

export function ProtectedRoute({ children, requireAdmin }: ProtectedRouteProps) {
  const { user, token } = useAppSelector((s) => s.auth)
  const location = useLocation()

  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }

  if (!requireAdmin && user.role === 'admin') {
    return <Navigate to="/admin" replace />
  }

  return <>{children}</>
}
