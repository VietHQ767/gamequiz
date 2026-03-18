import { api } from './client'
import type { Quiz, Question } from '@/types'
import type { QuestionBE } from '@/types'

function toFEQuestion(q: QuestionBE | Question): Question {
  if ('questionText' in q && q.questionText) return q as Question
  const be = q as QuestionBE
  return {
    _id: be._id,
    questionText: typeof be.text === 'string' ? be.text : String(be.text ?? ''),
    options: Array.isArray(be.options) ? be.options.map((o) => String(o ?? '')) : [],
    correctAnswerIndex: be.correctAnswerIndex ?? 0,
    ...(be.quizId != null && { quizId: be.quizId }),
  }
}

/** Backend may return quiz with questions as QuestionBE[] (text instead of questionText). */
function normalizeQuiz(raw: {
  _id: string
  title?: string
  description?: string
  questions?: (QuestionBE | Question)[]
}): Quiz {
  return {
    _id: raw._id,
    title: raw.title,
    description: raw.description,
    questions: Array.isArray(raw.questions) ? raw.questions.map(toFEQuestion) : [],
  }
}

export const quizzesApi = {
  getAll: () =>
    api.get<Quiz[]>('/quizzes').then((r) => (Array.isArray(r.data) ? r.data.map(normalizeQuiz) : [])),
  getById: (id: string) =>
    api.get(`/quizzes/${id}`).then((r) => normalizeQuiz(r.data as Parameters<typeof normalizeQuiz>[0])),
  create: (body: { title: string; description?: string }) =>
    api
      .post<Parameters<typeof normalizeQuiz>[0]>('/quizzes', body)
      .then((r) => normalizeQuiz(r.data)),
  update: (id: string, body: { title?: string; description?: string }) =>
    api
      .put<Parameters<typeof normalizeQuiz>[0]>(`/quizzes/${id}`, body)
      .then((r) => normalizeQuiz(r.data)),
  delete: (id: string) => api.delete(`/quizzes/${id}`),
  /** Gắn câu hỏi vào quiz: POST /quizzes/:quizId/question với body { questionId }. */
  addQuestionToQuiz: (quizId: string, questionId: string) =>
    api.post(`/quizzes/${quizId}/question`, { questionId }),
}
