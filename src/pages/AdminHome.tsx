import { Link } from 'react-router-dom'
import { Card } from 'react-bootstrap'

export default function AdminHome() {
  return (
    <Card className="shadow-sm">
      <Card.Body>
        <Card.Title>Home</Card.Title>
        <Card.Text className="text-muted">
          Create quizzes first, then add questions to each quiz. Use the navigation to manage quizzes or articles.
        </Card.Text>
        <Link to="/admin/quizzes" className="btn btn-primary mt-2">
          Manage Quizzes
        </Link>
      </Card.Body>
    </Card>
  )
}
