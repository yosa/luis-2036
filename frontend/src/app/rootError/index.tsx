import { CenteredLayout } from '../centeredLayout'

/** errorElement de la raíz: un error de render nunca deja la pantalla en blanco. */
export function RootError() {
  return (
    <CenteredLayout>
      <section role="alert">
        <h1>Algo salió mal al mostrar esta pantalla.</h1>
        <p>Recarga la página. Tu saldo y tu información siguen guardados.</p>
      </section>
    </CenteredLayout>
  )
}
