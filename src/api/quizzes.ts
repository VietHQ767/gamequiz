import { api } from './client'
import type { Quiz, Question } from '@/types'
import type { QuestionBE } from '@/types'

function toFEQuestion(q: QuestionBE | Question): Question {
  if ('questionText' in q && q.questionText) return q as Question
  const be = q as QuestionBE
  return {
    _id: be._id,
    questionText: be.text ?? '',
    options: be.options ?? [],
    correctAnswerIndex: be.correctAnswerIndex ?? 0,
  }
}

/** Backend may return quiz with questions as QuestionBE[] (text instead of questionText). */
function normalizeQuiz(raw: { _id: string; title?: string; questions?: (QuestionBE | Question)[] }): Quiz {
  return {
    _id: raw._id,
    title: raw.title,
    questions: Array.isArray(raw.questions) ? raw.questions.map(toFEQuestion) : [],
  }
}

export const quizzesApi = {
  getAll: () =>
    api.get<Quiz[]>('/quizzes').then((r) => (Array.isArray(r.data) ? r.data.map(normalizeQuiz) : [])),
  getById: (id: string) =>
    api.get(`/quizzes/${id}`).then((r) => normalizeQuiz(r.data as Parameters<typeof normalizeQuiz>[0])),
}
