import { CircleAlert, CircleCheck, Info, TriangleAlert, X } from 'lucide-react'
import type { ReactNode } from 'react'
import styles from './styles.module.sass'

type AlertProps = {
  tone: 'success' | 'error' | 'warning' | 'info'
  title: string
  children?: ReactNode
  onDismiss?: () => void
}

const icons = { success: CircleCheck, error: CircleAlert, warning: TriangleAlert, info: Info }

/**
 * Mensaje persistente (no se auto-oculta). Los errores se anuncian con
 * role="alert"; el resto con role="status".
 */
export function Alert({ tone, title, children, onDismiss }: Readonly<AlertProps>) {
  const Icon = icons[tone]
  return (
    <div className={`${styles.alert} ${styles[tone]}`} role={tone === 'error' ? 'alert' : 'status'}>
      <Icon className={styles.icon} aria-hidden="true" size={22} />
      <div className={styles.body}>
        <p className={styles.title}>{title}</p>
        {children && <div className={styles.detail}>{children}</div>}
      </div>
      {onDismiss && (
        <button
          type="button"
          className={styles.dismiss}
          onClick={onDismiss}
          aria-label="Cerrar mensaje"
        >
          <X aria-hidden="true" size={18} />
        </button>
      )}
    </div>
  )
}
