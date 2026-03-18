import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { Question, Quiz } from '@/types'
import { questionsApi } from '@/api/questions'
import { quizzesApi } from '@/api/quizzes'

type QuizState = {
  /** Current quiz (when loaded by id); used for title and to derive questions. */
  currentQuiz: Quiz | null
  questions: Question[]
  currentIndex: number
  selectedAnswers: Record<number, number>
  score: number | null
  isLoading: boolean
  error: string | null
}

const initialState: QuizState = {
  currentQuiz: null,
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

/** Load one quiz by id; its questions are used for the run. */
export const fetchQuizById = createAsyncThunk(
  'quiz/fetchQuizById',
  async (quizId: string, { rejectWithValue }) => {
    try {
      return await quizzesApi.getById(quizId)
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } }
      return rejectWithValue(err.response?.data?.message || 'Failed to load quiz')
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
    clearCurrentQuiz: (state) => {
      state.currentQuiz = null
      state.questions = []
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
      .addCase(fetchQuizById.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchQuizById.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentQuiz = action.payload
        state.questions = action.payload.questions ?? []
        state.currentIndex = 0
        state.selectedAnswers = {}
        state.score = null
        state.error = null
      })
      .addCase(fetchQuizById.rejected, (state, action) => {
        state.isLoading = false
        state.error = (action.payload as string) || 'Failed to load quiz'
      })
  },
})

export const { selectAnswer, submitQuiz, restartQuiz, nextQuestion, setCurrentIndex, clearCurrentQuiz } =
  quizSlice.actions
export default quizSlice.reducer
