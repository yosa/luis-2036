import { Snail } from 'lucide-react'
import styles from './styles.module.sass'

export function Brand() {
  return (
    <span className={styles.brand}>
      <span className={styles.mark} aria-hidden="true">
        <Snail size={22} />
      </span>
      Carreras de caracoles
    </span>
  )
}
