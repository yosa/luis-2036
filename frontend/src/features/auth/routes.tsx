import type { RouteObject } from 'react-router'
import { LoginPage } from './login'
import { RegisterPage } from './register'

export const authRoutes: RouteObject[] = [
  { path: '/register', element: <RegisterPage /> },
  { path: '/login', element: <LoginPage /> },
]
