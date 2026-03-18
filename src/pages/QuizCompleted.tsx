import { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Button, Card } from 'react-bootstrap'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { restartQuiz, fetchQuestions, fetchQuizById, clearCurrentQuiz } from '@/store/quizSlice'

export default function QuizCompleted() {
  const { score, questions, currentQuiz } = useAppSelector((s) => s.quiz)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const total = questions.length
  const quizId = currentQuiz?._id

  useEffect(() => {
    if (score === null) navigate('/dashboard', { replace: true })
  }, [score, navigate])

  const handleRestart = () => {
    dispatch(restartQuiz())
    if (quizId) {
      dispatch(fetchQuizById(quizId))
      navigate(`/dashboard/quiz/${quizId}`, { replace: true })
    } else {
      dispatch(fetchQuestions())
      navigate('/dashboard/quiz', { replace: true })
    }
  }

  const handleBackToQuizzes = () => {
    dispatch(clearCurrentQuiz())
    navigate('/dashboard', { replace: true })
  }

  return (
    <Card className="shadow-sm mx-auto text-center" style={{ maxWidth: 400 }}>
      <Card.Body className="p-5">
        <h2 className="h3 mb-3">Quiz Completed</h2>
        <p className="mb-4 lead">
          Your score: <strong>{score ?? 0}</strong> {total > 0 ? `/ ${total}` : ''}
        </p>
        <div className="d-flex flex-column gap-2">
          <Button variant="primary" onClick={handleRestart}>
            Restart Quiz
          </Button>
          <Button variant="outline-secondary" onClick={handleBackToQuizzes}>
            Back to Quizzes
          </Button>
          <Link to="/dashboard" className="btn btn-link">
            Dashboard Home
          </Link>
        </div>
      </Card.Body>
    </Card>
  )
}
