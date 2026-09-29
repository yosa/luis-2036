import type { ReactNode } from 'react'
import styles from './styles.module.sass'

type AuthCardProps = {
  title: string
  subtitle: string
  children: ReactNode
  footer: ReactNode
}

export function AuthCard({ title, subtitle, children, footer }: Readonly<AuthCardProps>) {
  return (
    <section className={styles.card} aria-labelledby="auth-title">
      <header className={styles.header}>
        <h1 id="auth-title">{title}</h1>
        <p className={styles.subtitle}>{subtitle}</p>
      </header>
      {children}
      <footer className={styles.footer}>{footer}</footer>
    </section>
  )
}
