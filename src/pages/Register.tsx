import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Form, Button, Card, Alert } from 'react-bootstrap'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { registerUser, clearError } from '@/store/authSlice'
import { useEffect } from 'react'

export default function Register() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const dispatch = useAppDispatch()
  const { isLoading, error, user } = useAppSelector((s) => s.auth)
  const navigate = useNavigate()

  useEffect(() => {
    dispatch(clearError())
  }, [dispatch])

  useEffect(() => {
    if (!user) return
    if (user.role === 'admin') navigate('/admin', { replace: true })
    else navigate('/dashboard', { replace: true })
  }, [user, navigate])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    dispatch(registerUser({ username, password }))
  }

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <Card className="shadow-sm" style={{ width: '100%', maxWidth: 400 }}>
        <Card.Body className="p-4">
          <Card.Title as="h2" className="mb-4">
            Register
          </Card.Title>
          {error && (
            <Alert variant="danger" dismissible onClose={() => dispatch(clearError())}>
              {error}
            </Alert>
          )}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                required
                autoComplete="username"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <div className="d-flex position-relative">
                <Form.Control
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                  autoComplete="new-password"
                />
                <Button
                  variant="outline-secondary"
                  type="button"
                  className="position-absolute end-0 top-0 bottom-0"
                  style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '🙈' : '👁'}
                </Button>
              </div>
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100" disabled={isLoading}>
              {isLoading ? 'Registering...' : 'Register'}
            </Button>
          </Form>
          <p className="mt-3 mb-0 text-center text-muted small">
            Already have an account? <Link to="/login">Login here</Link>
          </p>
        </Card.Body>
      </Card>
    </div>
  )
}
