import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { User, LoginCredentials, RegisterData } from '@/types'
import { authApi } from '@/api/auth'

function normalizeUser(u: { _id: string; username: string; admin?: boolean; role?: 'admin' | 'user' }): User {
  return {
    _id: u._id,
    username: u.username,
    admin: u.admin,
    role: u.role ?? (u.admin ? 'admin' : 'user'),
  }
}

type AuthState = {
  user: User | null
  token: string | null
  isLoading: boolean
  error: string | null
}

const token = localStorage.getItem('token')
const savedUser = localStorage.getItem('user')

const initialState: AuthState = {
  user: savedUser ? normalizeUser(JSON.parse(savedUser)) : null,
  token,
  isLoading: false,
  error: null,
}

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      return await authApi.login(credentials)
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } }
      return rejectWithValue(err.response?.data?.message || 'Login failed')
    }
  }
)

export const registerUser = createAsyncThunk(
  'auth/register',
  async (data: RegisterData, { rejectWithValue }) => {
    try {
      return await authApi.register(data)
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } }
      return rejectWithValue(err.response?.data?.message || 'Registration failed')
    }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null
      state.token = null
      state.error = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = normalizeUser(action.payload.user)
        state.token = action.payload.token
        state.error = null
        localStorage.setItem('token', action.payload.token)
        localStorage.setItem('user', JSON.stringify(state.user))
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = (action.payload as string) || 'Login failed'
      })
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = normalizeUser(action.payload.user)
        state.token = action.payload.token
        state.error = null
        localStorage.setItem('token', action.payload.token)
        localStorage.setItem('user', JSON.stringify(state.user))
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = (action.payload as string) || 'Registration failed'
      })
  },
})

export const { logout, clearError } = authSlice.actions
export default authSlice.reducer
