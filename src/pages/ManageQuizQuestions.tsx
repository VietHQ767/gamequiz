import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Form, Button, Card, ListGroup, Alert } from 'react-bootstrap'
import { questionsApi } from '@/api/questions'
import { quizzesApi } from '@/api/quizzes'
import type { Question } from '@/types'

export default function ManageQuizQuestions() {
  const { quizId } = useParams<{ quizId: string }>()
  const [quizTitle, setQuizTitle] = useState<string>('')
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [questionText, setQuestionText] = useState('')
  const [options, setOptions] = useState(['', '', '', ''])
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState(0)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const loadQuizAndQuestions = async () => {
    if (!quizId) return
    setLoading(true)
    setError(null)
    try {
      const [quiz, qList] = await Promise.all([
        quizzesApi.getById(quizId),
        questionsApi.getByQuizId(quizId),
      ])
      setQuizTitle(quiz.title ?? 'Untitled Quiz')
      setQuestions(qList)
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } }
      setError(err.response?.data?.message || 'Failed to load quiz or questions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadQuizAndQuestions()
  }, [quizId])

  const resetForm = () => {
    setQuestionText('')
    setOptions(['', '', '', ''])
    setCorrectAnswerIndex(0)
    setEditingId(null)
  }

  const handleEdit = (q: Question) => {
    setQuestionText(q.questionText)
    setOptions([...q.options])
    setCorrectAnswerIndex(q.correctAnswerIndex)
    setEditingId(q._id)
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this question?')) return
    try {
      await questionsApi.delete(id)
      await loadQuizAndQuestions()
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } }
      setError(err.response?.data?.message || 'Failed to delete')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const opts = options.filter((o) => o.trim())
    if (!questionText.trim() || opts.length < 2) {
      setError('Question text and at least 2 options are required.')
      return
    }
    if (correctAnswerIndex < 0 || correctAnswerIndex >= opts.length) {
      setError('Correct answer index must be between 0 and ' + (opts.length - 1))
      return
    }
    if (!quizId) {
      setError('Quiz not found.')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      if (editingId) {
        await questionsApi.update(editingId, {
          questionText: questionText.trim(),
          options: opts,
          correctAnswerIndex,
        })
      } else {
        await questionsApi.create({
          questionText: questionText.trim(),
          options: opts,
          correctAnswerIndex,
          quizId,
        })
      }
      resetForm()
      await loadQuizAndQuestions()
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } }
      setError(err.response?.data?.message || 'Failed to save question')
    } finally {
      setSubmitting(false)
    }
  }

  if (!quizId) {
    return (
      <Alert variant="danger">
        Missing quiz. <Link to="/admin/quizzes">Back to Quizzes</Link>
      </Alert>
    )
  }

  return (
    <div>
      <nav className="mb-3">
        <Link to="/admin/quizzes" className="text-decoration-none text-muted small">
          ← Quizzes
        </Link>
      </nav>
      <h1 className="h2 mb-2">Questions: {quizTitle}</h1>
      <p className="text-muted mb-4">Add and edit questions for this quiz.</p>
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Card.Title className="mb-3">
            {editingId ? 'Edit Question' : 'Add Question'}
          </Card.Title>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Question Text</Form.Label>
              <Form.Control
                type="text"
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                placeholder="Enter question text"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Options</Form.Label>
              {[0, 1, 2, 3].map((i) => (
                <Form.Control
                  key={i}
                  type="text"
                  value={options[i] ?? ''}
                  onChange={(e) => {
                    const next = [...options]
                    next[i] = e.target.value
                    setOptions(next)
                  }}
                  placeholder={`Option ${i + 1}`}
                  className="mb-2"
                />
              ))}
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Correct Answer Index (0–3)</Form.Label>
              <Form.Control
                type="number"
                min={0}
                max={3}
                value={correctAnswerIndex}
                onChange={(e) => setCorrectAnswerIndex(parseInt(e.target.value, 10) || 0)}
              />
            </Form.Group>
            <div className="d-flex gap-2">
              <Button variant="primary" type="submit" disabled={submitting}>
                {editingId ? 'Update Question' : 'Add Question'}
              </Button>
              {editingId && (
                <Button variant="secondary" type="button" onClick={resetForm}>
                  Cancel
                </Button>
              )}
            </div>
          </Form>
        </Card.Body>
      </Card>

      {loading ? (
        <p className="text-muted">Loading questions...</p>
      ) : (
        <div className="d-flex flex-column gap-3">
          {questions.length === 0 ? (
            <Card className="shadow-sm">
              <Card.Body className="text-muted text-center py-4">
                No questions yet. Add one above.
              </Card.Body>
            </Card>
          ) : (
            questions.map((q) => (
              <Card key={q._id} className="shadow-sm">
                <Card.Body>
                  <Card.Title className="h6">{q.questionText}</Card.Title>
                  <ListGroup variant="flush" className="mb-3">
                    {q.options.map((opt, i) => (
                      <ListGroup.Item key={i}>{opt}</ListGroup.Item>
                    ))}
                  </ListGroup>
                  <div className="d-flex gap-2">
                    <Button variant="warning" size="sm" onClick={() => handleEdit(q)}>
                      Edit
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(q._id)}>
                      Delete
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  )
}
