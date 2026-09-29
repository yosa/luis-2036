import { Wallet } from 'lucide-react'
import { formatCents } from '../../../../../lib/money/money'
import styles from './styles.module.sass'

/** Cifra principal del dashboard: el saldo (una sola por vista). */
export function BalanceCard({ balanceCents }: Readonly<{ balanceCents: number }>) {
  return (
    <section className={styles.card} aria-labelledby="balance-title">
      <h2 id="balance-title" className={styles.label}>
        <Wallet aria-hidden="true" size={20} />
        Saldo disponible
      </h2>
      <p className={styles.amount}>{formatCents(balanceCents)}</p>
      <p className={styles.hint}>
        {balanceCents === 0 ? 'Aún no tienes saldo. Recarga para empezar a apostar.' : 'MXN'}
      </p>
    </section>
  )
}
