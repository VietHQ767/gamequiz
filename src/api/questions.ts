import { api } from './client'
import { quizzesApi } from './quizzes'
import type { Question } from '@/types'
import type { QuestionBE } from '@/types'

function toFE(q: QuestionBE): Question {
  return {
    _id: q._id,
    questionText: typeof q.text === 'string' ? q.text : String(q.text ?? ''),
    options: Array.isArray(q.options) ? q.options.map((o) => String(o ?? '')) : [],
    correctAnswerIndex: q.correctAnswerIndex ?? 0,
    ...(q.quizId != null && { quizId: q.quizId }),
  }
}

/** Backend Question schema uses "text", not "questionText". Author is set by BE from req.user. */
export const questionsApi = {
  getAll: async (): Promise<Question[]> => {
    const { data } = await api.get<QuestionBE[]>('/questions')
    return Array.isArray(data) ? data.map(toFE) : []
  },
  /** Get questions for one quiz. Uses GET /questions?quizId= if available, else fetches quiz and returns its questions. */
  getByQuizId: async (quizId: string): Promise<Question[]> => {
    try {
      const { data } = await api.get<QuestionBE[]>(`/questions?quizId=${encodeURIComponent(quizId)}`)
      return Array.isArray(data) ? data.map(toFE) : []
    } catch {
      const quiz = await quizzesApi.getById(quizId)
      return quiz.questions ?? []
    }
  },
  getById: async (id: string): Promise<Question> => {
    const { data } = await api.get<QuestionBE>(`/questions/${id}`)
    return toFE(data)
  },
  create: (body: Omit<Question, '_id'> & { quizId?: string }) =>
    api
      .post<QuestionBE>('/questions', {
        text: body.questionText,
        options: body.options,
        correctAnswerIndex: body.correctAnswerIndex,
        ...(body.quizId != null && { quizId: body.quizId }),
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
