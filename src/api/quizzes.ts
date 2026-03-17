import { api } from './client'
import type { Quiz } from '@/types'

export const quizzesApi = {
  getAll: () => api.get<Quiz[]>('/quizzes').then((r) => r.data),
  getById: (id: string) => api.get<Quiz>(`/quizzes/${id}`).then((r) => r.data),
}
