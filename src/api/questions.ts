import { api } from './client'
import type { Question } from '@/types'
import type { QuestionBE } from '@/types'

function toFE(q: QuestionBE): Question {
  return {
    _id: q._id,
    questionText: q.text,
    options: q.options ?? [],
    correctAnswerIndex: q.correctAnswerIndex ?? 0,
  }
}

/** Backend Question schema uses "text", not "questionText". Author is set by BE from req.user. */
export const questionsApi = {
  getAll: async (): Promise<Question[]> => {
    const { data } = await api.get<QuestionBE[]>('/questions')
    return Array.isArray(data) ? data.map(toFE) : []
  },
  getById: async (id: string): Promise<Question> => {
    const { data } = await api.get<QuestionBE>(`/questions/${id}`)
    return toFE(data)
  },
  create: (body: Omit<Question, '_id'>) =>
    api
      .post<QuestionBE>('/questions', {
        text: body.questionText,
        options: body.options,
        correctAnswerIndex: body.correctAnswerIndex,
      })
      .then((r) => toFE(r.data)),
  update: (id: string, body: Partial<Omit<Question, '_id'>>) =>
    api
      .put<QuestionBE>(`/questions/${id}`, {
        ...(body.questionText != null && { text: body.questionText }),
        ...(body.options != null && { options: body.options }),
        ...(body.correctAnswerIndex != null && { correctAnswerIndex: body.correctAnswerIndex }),
      })
      .then((r) => toFE(r.data)),
  delete: (id: string) => api.delete(`/questions/${id}`),
}
