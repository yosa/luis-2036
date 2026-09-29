import { formatCents, maskCardNumber } from '../../../../../lib/money/money'
import { useWalletStore } from '../../../../../stores/wallet'
import styles from './styles.module.sass'

const STATUS_LABEL = { approved: 'Aprobada', rejected: 'Rechazada', error: 'Error' } as const
const MAX_ITEMS = 5

/** Últimos cobros. La tarjeta se muestra enmascarada y el CVV nunca (ADR 0006). */
export function ChargeHistory() {
  const charges = useWalletStore((state) => state.charges)

  return (
    <section className={styles.card} aria-labelledby="history-title">
      <h2 id="history-title" className={styles.title}>
        Últimos cobros
      </h2>
      {charges.length === 0 ? (
        <p className={styles.empty}>Aún no has hecho recargas.</p>
      ) : (
        <ul className={styles.list}>
          {charges.slice(0, MAX_ITEMS).map((charge) => (
            <li key={charge.response.id} className={styles.item}>
              <span className={`${styles.badge} ${styles[charge.response.status]}`}>
                {STATUS_LABEL[charge.response.status]}
              </span>
              <span className={styles.amount}>{formatCents(charge.requestedAmountCents)}</span>
              <span className={styles.meta}>
                {maskCardNumber(charge.response.card_number)} · {charge.response.reference}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
