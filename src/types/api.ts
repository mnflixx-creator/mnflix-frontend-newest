export interface APIResponse<T = any> {
  data: T
  success: boolean
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  page: number
  totalPages: number
  totalResults: number
}

export interface AuthResponse {
  token: string
  user: User
}

export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  subscription?: Subscription
}

export interface Subscription {
  plan: 'free' | 'basic' | 'premium'
  expiresAt?: string
  features: string[]
}
