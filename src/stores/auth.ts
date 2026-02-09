import { create } from 'zustand'

interface AuthState {
  isAuthenticated: boolean
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  setToken: (token: string) => void
}

interface User {
  id: string
  email: string
  name: string
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: !!localStorage.getItem('token'),
  user: null,
  token: localStorage.getItem('token'),

  login: async (email: string, password: string) => {
    // TODO: Implement actual login with backend API
    console.log('Login attempt:', { email, password })
    
    // Mock login for now
    const mockToken = 'mock-jwt-token'
    const mockUser = {
      id: '1',
      email,
      name: 'User Name',
    }

    localStorage.setItem('token', mockToken)
    set({
      isAuthenticated: true,
      user: mockUser,
      token: mockToken,
    })
  },

  logout: () => {
    localStorage.removeItem('token')
    set({
      isAuthenticated: false,
      user: null,
      token: null,
    })
  },

  setToken: (token: string) => {
    localStorage.setItem('token', token)
    set({ token, isAuthenticated: true })
  },
}))
