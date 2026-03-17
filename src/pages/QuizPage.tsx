import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, Button, Card, Alert } from 'react-bootstrap'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchQuestions, selectAnswer, submitQuiz, nextQuestion } from '@/store/quizSlice'

export default function QuizPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { questions, currentIndex, selectedAnswers, score, isLoading, error } = useAppSelector(
    (s) => s.quiz
  )

  useEffect(() => {
    dispatch(fetchQuestions())
  }, [dispatch])

  useEffect(() => {
    if (score !== null) navigate('/dashboard/quiz/completed', { replace: true })
  }, [score, navigate])

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <p className="text-muted">Loading quiz...</p>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="danger">
        {error}
      </Alert>
    )
  }

  if (!questions.length) {
    return (
      <div className="text-center py-5">
        <p className="text-muted">No questions available. Try again later.</p>
      </div>
    )
  }

  const question = questions[currentIndex]
  const selected = selectedAnswers[currentIndex]
  const isLast = currentIndex === questions.length - 1

  const handleSubmit = () => {
    if (isLast) {
      dispatch(submitQuiz())
    } else {
      dispatch(nextQuestion())
    }
  }

  return (
    <Card className="shadow-sm mx-auto" style={{ maxWidth: 600 }}>
      <Card.Body className="p-4">
        <h2 className="h4 mb-4">Quiz</h2>
        <h3 className="h5 fw-bold mb-4">{question.questionText}</h3>
        <Form>
          {question.options.map((opt, idx) => (
            <Form.Check
              key={idx}
              type="radio"
              id={`q-${currentIndex}-${idx}`}
              name={`q-${currentIndex}`}
              label={opt}
              checked={selected === idx}
              onChange={() => dispatch(selectAnswer({ questionIndex: currentIndex, optionIndex: idx }))}
              className="mb-2"
            />
          ))}
          <Button
            variant="primary"
            className="mt-3"
            onClick={handleSubmit}
            disabled={selected === undefined}
          >
            {isLast ? 'Submit Answer' : 'Next'}
          </Button>
        </Form>
        <p className="mt-4 mb-0 text-muted small">
          {isLast ? 'Finish quiz' : `Question ${currentIndex + 1} of ${questions.length}`}
        </p>
      </Card.Body>
    </Card>
  )
}
