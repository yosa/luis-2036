import { createBrowserRouter, Navigate, type RouteObject } from 'react-router'
import { authRoutes } from '../features/auth/routes'
import { dashboardRoutes } from '../features/dashboard/routes'
import { rechargeRoutes } from '../features/recharge/routes'
import { AppShell } from './appShell'
import { ProtectedRoute, PublicOnlyRoute } from './guards'
import { NotFound } from './notFound'
import { RootError } from './rootError'

/** Catálogo de componentes: público y cargado aparte, sin peso extra para la aplicación. */
const catalogRoute: RouteObject = {
  path: '/componentes',
  lazy: async () => ({ Component: (await import('./componentCatalog')).ComponentCatalog }),
}

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
        children: [{ element: <AppShell />, children: [...dashboardRoutes, ...rechargeRoutes] }],
      },
      catalogRoute,
      { path: '*', element: <NotFound /> },
    ],
  },
]

/** Agregador delgado: cada feature aporta sus rutas. */
export const router = createBrowserRouter(routes)
