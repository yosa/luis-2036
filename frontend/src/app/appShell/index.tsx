import { LogOut } from 'lucide-react'
import { Outlet } from 'react-router'
import { Brand } from '../../components/brand'
import { Button } from '../../components/button'
import { ThemeToggle } from '../../components/themeToggle'
import { formatCents } from '../../lib/money/money'
import { useSessionStore } from '../../stores/session'
import { useWalletStore } from '../../stores/wallet'
import styles from './styles.module.sass'

/** Layout de las pantallas con sesión: marca, usuario, tema y cerrar sesión. */
export function AppShell() {
  const fullName = useSessionStore((state) => state.user?.fullName ?? '')
  const logout = useSessionStore((state) => state.logout)
  const balanceCents = useWalletStore((state) => state.balanceCents)

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <Brand />
        <div className={styles.actions}>
          <span className={styles.user}>{fullName}</span>
          <span className={styles.balance} aria-label={`Saldo ${formatCents(balanceCents)}`}>
            {formatCents(balanceCents)}
          </span>
          <ThemeToggle />
          <Button variant="ghost" onClick={logout} icon={<LogOut aria-hidden="true" size={18} />}>
            Cerrar sesión
          </Button>
        </div>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}
