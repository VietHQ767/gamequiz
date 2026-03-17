// Backend User has: _id, username, admin (boolean)
export interface User {
  _id: string
  username: string
  /** From BE: admin boolean. Normalized to role in auth slice. */
  admin?: boolean
  role: 'admin' | 'user'
}

export interface Question {
  _id: string
  questionText: string
  options: string[]
  correctAnswerIndex: number
}

export interface Quiz {
  _id: string
  title?: string
  questions: Question[]
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface RegisterData extends LoginCredentials {
  role?: 'admin' | 'user'
}

/** Backend question schema uses "text" instead of "questionText" */
export interface QuestionBE {
  _id: string
  text: string
  options: string[]
  correctAnswerIndex: number
  Author?: string
}
