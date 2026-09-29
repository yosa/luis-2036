import { Link } from 'react-router'
import { CenteredLayout } from '../centeredLayout'
import styles from './styles.module.sass'

export function NotFound() {
  return (
    <CenteredLayout>
      <section className={styles.card} aria-labelledby="not-found-title">
        <h1 id="not-found-title">Esta pista no existe</h1>
        <p className={styles.text}>
          El caracol tomó un atajo. Revisa la dirección o vuelve al inicio.
        </p>
        <Link className={styles.link} to="/">
          Volver al inicio
        </Link>
      </section>
    </CenteredLayout>
  )
}
