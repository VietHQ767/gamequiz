import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Form, Button, Card, Table, Alert, Modal } from 'react-bootstrap'
import { quizzesApi } from '@/api/quizzes'
import type { Quiz } from '@/types'

export default function ManageQuizzes() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)

  const loadQuizzes = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await quizzesApi.getAll()
      const list = Array.isArray(data) ? data : []
      // Backend GET /quizzes may not include questions; fetch each quiz to get question count
      const withCounts = await Promise.all(
        list.map(async (quiz) => {
          try {
            const full = await quizzesApi.getById(quiz._id)
            return { ...quiz, questions: full.questions ?? [] }
          } catch {
            return { ...quiz, questions: [] }
          }
        })
      )
      setQuizzes(withCounts)
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } }
      setError(err.response?.data?.message || 'Failed to load quizzes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadQuizzes()
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      setError('Quiz title is required.')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await quizzesApi.create({ title: title.trim() })
      setTitle('')
      setShowModal(false)
      await loadQuizzes()
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } }
      setError(err.response?.data?.message || 'Failed to create quiz')
    } finally {
      setSubmitting(false)
    }
  }

  const openEdit = (quiz: Quiz) => {
    setEditingQuiz(quiz)
    setEditTitle(quiz.title ?? '')
    setShowEditModal(true)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingQuiz) return
    if (!editTitle.trim()) {
      setError('Quiz title is required.')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await quizzesApi.update(editingQuiz._id, { title: editTitle.trim() })
      setShowEditModal(false)
      setEditingQuiz(null)
      await loadQuizzes()
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } }
      setError(err.response?.data?.message || 'Failed to update quiz')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (quiz: Quiz) => {
    if (!window.confirm(`Delete quiz "${quiz.title || 'Untitled'}"? This may remove its questions.`)) return
    try {
      await quizzesApi.delete(quiz._id)
      await loadQuizzes()
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } }
      setError(err.response?.data?.message || 'Failed to delete quiz')
    }
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
        <h1 className="h2 mb-0">Manage Quizzes</h1>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          + Create Quiz
        </Button>
      </div>
      <p className="text-muted">
        Create a quiz first, then add questions to it. Click &quot;Questions&quot; to manage questions for that quiz.
      </p>
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Create Quiz Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create Quiz</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCreate}>
          <Modal.Body>
            <Form.Group>
              <Form.Label>Quiz title</Form.Label>
              <Form.Control
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. General Knowledge"
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Quiz'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Edit Quiz Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Quiz</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleUpdate}>
          <Modal.Body>
            <Form.Group>
              <Form.Label>Quiz title</Form.Label>
              <Form.Control
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Quiz title"
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {loading ? (
        <p className="text-muted">Loading quizzes...</p>
      ) : (
        <Card className="shadow-sm">
          <Table responsive className="mb-0">
            <thead>
              <tr>
                <th>Title</th>
                <th>Questions</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {quizzes.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-muted text-center py-4">
                    No quizzes yet. Create one to get started.
                  </td>
                </tr>
              ) : (
                quizzes.map((quiz) => (
                  <tr key={quiz._id}>
                    <td>{quiz.title || 'Untitled Quiz'}</td>
                    <td>{quiz.questions?.length ?? 0}</td>
                    <td className="text-end">
                      <Link
                        to={`/admin/quizzes/${quiz._id}/questions`}
                        className="btn btn-sm btn-outline-primary me-2"
                      >
                        Questions
                      </Link>
                      <Button variant="outline-warning" size="sm" className="me-2" onClick={() => openEdit(quiz)}>
                        Edit
                      </Button>
                      <Button variant="outline-danger" size="sm" onClick={() => handleDelete(quiz)}>
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Card>
      )}
    </div>
  )
}
