import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { Question } from '@/types'
import { questionsApi } from '@/api/questions'

type QuizState = {
  questions: Question[]
  currentIndex: number
  selectedAnswers: Record<number, number>
  score: number | null
  isLoading: boolean
  error: string | null
}

const initialState: QuizState = {
  questions: [],
  currentIndex: 0,
  selectedAnswers: {},
  score: null,
  isLoading: false,
  error: null,
}

export const fetchQuestions = createAsyncThunk(
  'quiz/fetchQuestions',
  async (_, { rejectWithValue }) => {
    try {
      return await questionsApi.getAll()
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } }
      return rejectWithValue(err.response?.data?.message || 'Failed to load questions')
    }
  }
)

const quizSlice = createSlice({
  name: 'quiz',
  initialState,
  reducers: {
    selectAnswer: (state, action: { payload: { questionIndex: number; optionIndex: number } }) => {
      state.selectedAnswers[action.payload.questionIndex] = action.payload.optionIndex
    },
    submitQuiz: (state) => {
      let correct = 0
      state.questions.forEach((q, i) => {
        if (state.selectedAnswers[i] === q.correctAnswerIndex) correct++
      })
      state.score = correct
    },
    restartQuiz: (state) => {
      state.currentIndex = 0
      state.selectedAnswers = {}
      state.score = null
    },
    nextQuestion: (state) => {
      if (state.currentIndex < state.questions.length - 1) state.currentIndex += 1
    },
    setCurrentIndex: (state, action: { payload: number }) => {
      state.currentIndex = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchQuestions.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchQuestions.fulfilled, (state, action) => {
        state.isLoading = false
        state.questions = action.payload
        state.currentIndex = 0
        state.selectedAnswers = {}
        state.score = null
        state.error = null
      })
      .addCase(fetchQuestions.rejected, (state, action) => {
        state.isLoading = false
        state.error = (action.payload as string) || 'Failed to load questions'
      })
  },
})

export const { selectAnswer, submitQuiz, restartQuiz, nextQuestion, setCurrentIndex } =
  quizSlice.actions
export default quizSlice.reducer
