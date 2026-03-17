import { Card } from 'react-bootstrap'

export default function Article() {
  return (
    <Card className="shadow-sm">
      <Card.Body>
        <Card.Title>Article</Card.Title>
        <Card.Text className="text-muted">Articles content will be displayed here.</Card.Text>
      </Card.Body>
    </Card>
  )
}
