import { createBrowserRouter, type RouteObject } from 'react-router'
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

/** Agregador delgado: cada feature aporta sus rutas. */
export const router = createBrowserRouter([
  {
    errorElement: <RootError />,
    children: [...devRoutes, { path: '*', element: <NotFound /> }],
  },
])
