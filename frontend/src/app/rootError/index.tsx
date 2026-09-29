import { Alert } from '../../components/alert'
import { CenteredLayout } from '../centeredLayout'

/** errorElement de la raíz: un error de render nunca deja la pantalla en blanco. */
export function RootError() {
  return (
    <CenteredLayout>
      <Alert tone="error" title="Algo salió mal al mostrar esta pantalla.">
        Recarga la página. Tu saldo y tu información siguen guardados.
      </Alert>
    </CenteredLayout>
  )
}
