import { useState, useEffect } from 'react'
import { Form, Button, Card, ListGroup, Alert } from 'react-bootstrap'
import { questionsApi } from '@/api/questions'
import type { Question } from '@/types'

export default function ManageQuestions() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [questionText, setQuestionText] = useState('')
  const [options, setOptions] = useState(['', '', '', ''])
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState(0)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const loadQuestions = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await questionsApi.getAll()
      setQuestions(data)
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } }
      setError(err.response?.data?.message || 'Failed to load questions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadQuestions()
  }, [])

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
      await loadQuestions()
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
        })
      }
      resetForm()
      await loadQuestions()
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } }
      setError(err.response?.data?.message || 'Failed to save question')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <h1 className="h2 mb-4">Questions</h1>
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
              <Form.Label>Question Text:</Form.Label>
              <Form.Control
                type="text"
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                placeholder="Enter question text"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Options:</Form.Label>
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
              <Form.Label>Correct Answer Index:</Form.Label>
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
          {questions.map((q) => (
            <Card key={q._id} className="shadow-sm">
              <Card.Body>
                <Card.Title className="h6">{q.questionText}</Card.Title>
                <ListGroup variant="flush" className="mb-3">
                  {q.options.map((opt, i) => (
                    <ListGroup.Item key={i}>{opt}</ListGroup.Item>
                  ))}
                </ListGroup>
                <div className="d-flex gap-2">
                  <Button
                    variant="warning"
                    size="sm"
                    onClick={() => handleEdit(q)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(q._id)}
                  >
                    Delete
                  </Button>
                </div>
              </Card.Body>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
