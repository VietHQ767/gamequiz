import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { logout } from '@/store/authSlice'
import { authApi } from '@/api/auth'
import { Nav, Container } from 'react-bootstrap'

export default function AdminLayout() {
  const user = useAppSelector((s) => s.auth.user)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await authApi.logout()
    } catch {
      // ignore (token may already be invalid)
    }
    dispatch(logout())
    navigate('/login')
  }

  return (
    <>
      <div className="border-bottom bg-white shadow-sm">
        <Container className="py-3">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <h1 className="h3 mb-0 fw-bold">Admin Dashboard</h1>
            <span className="text-muted">Welcome, {user?.username}</span>
          </div>
          <Nav className="mt-2 gap-3" style={{ backgroundColor: '#f8f9fa', padding: '0.5rem 0.75rem', borderRadius: 6 }}>
            <Nav.Link as={Link} to="/admin">
              Home
            </Nav.Link>
            <Nav.Link as={Link} to="/admin/questions">
              Manage Questions
            </Nav.Link>
            <Nav.Link as={Link} to="/admin/articles">
              Manage Articles
            </Nav.Link>
            <Nav.Link as="button" onClick={handleLogout} className="text-danger p-0 bg-transparent border-0">
              Logout
            </Nav.Link>
          </Nav>
        </Container>
      </div>
      <Container className="py-4">
        <Outlet />
      </Container>
    </>
  )
}
