import { BalanceCard } from './components/balanceCard'
import { BetsDonut } from './components/betsDonut'
import { SnailWinsChart } from './components/snailWinsChart'
import { useDashboard } from './useDashboard'
import styles from './styles.module.sass'

export function DashboardPage() {
  const { firstName, balanceCents, raceDay } = useDashboard()

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>Hola, {firstName}</h1>
        <p className={styles.lead}>Así va tu día en la pista.</p>
      </header>
      <div className={styles.grid}>
        <BalanceCard balanceCents={balanceCents} />
        <BetsDonut won={raceDay.betsSummary.won} lost={raceDay.betsSummary.lost} />
        <div className={styles.wide}>
          <SnailWinsChart winsBySnail={raceDay.winsBySnail} racesCount={raceDay.races.length} />
        </div>
      </div>
    </div>
  )
}
