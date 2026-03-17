import { api } from './client'
import type { User, LoginCredentials, RegisterData } from '@/types'

/** Backend returns user with admin (boolean). We normalize to role in authSlice. */
export interface AuthResponse {
  user: Omit<User, 'role'> & { admin?: boolean }
  token: string
}

export const authApi = {
  /** POST /api/login - backend user.routes.js */
  login: async (credentials: LoginCredentials) => {
    const { data } = await api.post<AuthResponse>('/login', credentials)
    return data
  },
  /** POST /api/signup - backend user.routes.js */
  register: async (body: RegisterData) => {
    const { data } = await api.post<AuthResponse>('/signup', body)
    return data
  },
  /** POST /api/logout - invalidate token on backend (verifyUser + invalidateToken) */
  logout: async () => {
    await api.post('/logout')
  },
}
