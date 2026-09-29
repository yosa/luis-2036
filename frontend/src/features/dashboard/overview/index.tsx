import { useSessionStore } from '../../../stores/session'
import styles from './styles.module.sass'

/** Pantalla posterior al inicio de sesión. Saldo, gráficas y recarga llegan en sus features. */
export function DashboardPage() {
  const fullName = useSessionStore((state) => state.user?.fullName ?? '')
  const firstName = fullName.split(' ')[0]

  return (
    <section className={styles.page} aria-labelledby="dashboard-title">
      <h1 id="dashboard-title">Hola, {firstName}</h1>
      <p className={styles.lead}>
        Bienvenido a la pista. Aquí verás tu saldo y a los ganadores del día.
      </p>
    </section>
  )
}
