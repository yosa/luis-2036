import { createBrowserRouter, Navigate, type RouteObject } from 'react-router'
import { authRoutes } from '../features/auth/routes'
import { dashboardRoutes } from '../features/dashboard/routes'
import { AppShell } from './appShell'
import { ProtectedRoute, PublicOnlyRoute } from './guards'
import { NotFound } from './notFound'
import { RootError } from './rootError'

/** Catálogo de componentes: solo en desarrollo, no entra al build de producción. */
const devRoutes: RouteObject[] = import.meta.env.DEV
  ? [
      {
        path: '/dev/ui',
        lazy: async () => ({ Component: (await import('./devCatalog')).DevCatalog }),
      },
    ]
  : []

/** Definición de rutas separada del router para poder montarla en pruebas (createMemoryRouter). */
export const routes: RouteObject[] = [
  {
    errorElement: <RootError />,
    // Sin esto, React Router avisa en consola al hidratar una ruta lazy (el catálogo).
    HydrateFallback: () => null,
    children: [
      { path: '/', element: <Navigate to="/dashboard" replace /> },
      { element: <PublicOnlyRoute />, children: authRoutes },
      {
        element: <ProtectedRoute />,
        children: [{ element: <AppShell />, children: dashboardRoutes }],
      },
      ...devRoutes,
      { path: '*', element: <NotFound /> },
    ],
  },
]

/** Agregador delgado: cada feature aporta sus rutas. */
export const router = createBrowserRouter(routes)
