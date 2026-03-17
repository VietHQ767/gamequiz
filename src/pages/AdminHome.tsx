import { Card } from 'react-bootstrap'

export default function AdminHome() {
  return (
    <Card className="shadow-sm">
      <Card.Body>
        <Card.Title>Home</Card.Title>
        <Card.Text className="text-muted">Use the navigation to manage questions or articles.</Card.Text>
      </Card.Body>
    </Card>
  )
}
