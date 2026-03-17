import { Link } from 'react-router-dom'

export default function DashboardHome() {
  return (
    <div>
      <p className="text-muted">
        <Link to="/dashboard/quiz">Click and do Quiz</Link>
      </p>
    </div>
  )
}
