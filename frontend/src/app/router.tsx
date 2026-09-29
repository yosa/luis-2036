import { createBrowserRouter } from 'react-router'
import { NotFound } from './notFound'
import { RootError } from './rootError'

/** Agregador delgado: cada feature aporta sus rutas. */
export const router = createBrowserRouter([
  {
    errorElement: <RootError />,
    children: [{ path: '*', element: <NotFound /> }],
  },
])
