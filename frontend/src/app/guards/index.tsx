import { Navigate, Outlet, useLocation } from 'react-router'
import { useSessionStore } from '../../stores/session'

/** Solo con sesión activa (RF-07). Recuerda a dónde se quería ir para volver tras el login. */
export function ProtectedRoute() {
  const isAuthenticated = useSessionStore((state) => state.user !== null)
  const location = useLocation()

  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />
  return <Outlet />
}

/** Solo sin sesión: quien ya entró no vuelve a ver el login ni el registro. */
export function PublicOnlyRoute() {
  const isAuthenticated = useSessionStore((state) => state.user !== null)

  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return <Outlet />
}
