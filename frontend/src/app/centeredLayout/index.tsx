import type { ReactNode } from 'react'
import { Brand } from '../../components/brand'
import styles from './styles.module.sass'

/** Layout de pantallas sin sesión: marca arriba y una tarjeta centrada. */
export function CenteredLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <Brand />
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  )
}
