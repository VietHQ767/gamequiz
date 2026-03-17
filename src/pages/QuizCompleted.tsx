import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card } from 'react-bootstrap'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { restartQuiz, fetchQuestions } from '@/store/quizSlice'

export default function QuizCompleted() {
  const { score } = useAppSelector((s) => s.quiz)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  useEffect(() => {
    if (score === null) navigate('/dashboard/quiz', { replace: true })
  }, [score, navigate])

  const handleRestart = () => {
    dispatch(restartQuiz())
    dispatch(fetchQuestions())
    navigate('/dashboard/quiz', { replace: true })
  }

  return (
    <Card className="shadow-sm mx-auto text-center" style={{ maxWidth: 400 }}>
      <Card.Body className="p-5">
        <h2 className="h3 mb-3">Quiz Completed</h2>
        <p className="mb-4">Your score: {score ?? 0}</p>
        <Button variant="primary" onClick={handleRestart}>
          Restart Quiz
        </Button>
      </Card.Body>
    </Card>
  )
}
