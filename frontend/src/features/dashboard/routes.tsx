import type { RouteObject } from 'react-router'
import { DashboardPage } from './overview'

export const dashboardRoutes: RouteObject[] = [{ path: '/dashboard', element: <DashboardPage /> }]
