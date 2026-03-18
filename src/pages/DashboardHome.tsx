import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, Spinner, Alert, Row, Col } from 'react-bootstrap'
import { quizzesApi } from '@/api/quizzes'
import type { Quiz } from '@/types'

export default function DashboardHome() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    quizzesApi
      .getAll()
      .then((data) => {
        if (!cancelled) setQuizzes(Array.isArray(data) ? data : [])
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          const err = e as { response?: { data?: { message?: string } } }
          setError(err.response?.data?.message || 'Failed to load quizzes')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status" />
        <p className="mt-2 text-muted">Loading quizzes...</p>
      </div>
    )
  }

  if (error && quizzes.length === 0) {
    return (
      <div>
        <Alert variant="warning" className="mb-4">
          {error}. You can still try the general quiz below.
        </Alert>
        <Card className="shadow-sm" style={{ maxWidth: 320 }}>
          <Card.Body>
            <Card.Title className="h5">General Quiz</Card.Title>
            <Card.Text className="text-muted small">All questions in one quiz.</Card.Text>
            <Link to="/dashboard/quiz" className="btn btn-primary">
              Take Quiz
            </Link>
          </Card.Body>
        </Card>
      </div>
    )
  }

  return (
    <div>
      <h1 className="h2 mb-4">Quizzes</h1>
      <p className="text-muted mb-4">
        Choose a quiz below. Each quiz has multiple questions.
      </p>
      <Row xs={1} md={2} lg={3} className="g-4">
        {quizzes.length > 0 ? (
          quizzes.map((quiz) => (
            <Col key={quiz._id}>
              <Card className="h-100 shadow-sm">
                <Card.Body>
                  <Card.Title className="h5">{quiz.title || 'Untitled Quiz'}</Card.Title>
                  <Card.Text className="text-muted small">
                    {quiz.questions?.length ?? 0} question(s)
                  </Card.Text>
                  <Link
                    to={`/dashboard/quiz/${quiz._id}`}
                    className="btn btn-primary"
                  >
                    Start Quiz
                  </Link>
                </Card.Body>
              </Card>
            </Col>
          ))
        ) : (
          <Col>
            <Card className="h-100 shadow-sm">
              <Card.Body>
                <Card.Title className="h5">General Quiz</Card.Title>
                <Card.Text className="text-muted small">
                  All questions in one quiz.
                </Card.Text>
                <Link to="/dashboard/quiz" className="btn btn-primary">
                  Take Quiz
                </Link>
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>
    </div>
  )
}
