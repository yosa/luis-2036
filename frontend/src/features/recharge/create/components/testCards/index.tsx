import { Info } from 'lucide-react'
import styles from './styles.module.sass'

const SCENARIOS = [
  { card: '1234 1234 1234 1234', data: '12/26 · CVV 543', result: 'Aprobada' },
  { card: '1234 1234 1234 1234', data: '12/26 · otro CVV', result: 'CVV incorrecto' },
  { card: '4000 0000 0000 0402', data: 'fecha futura', result: 'Fondos insuficientes' },
  { card: '4000 0000 0000 0403', data: 'fecha futura', result: 'Tarjeta bloqueada' },
  { card: '4000 0000 0000 0503', data: 'fecha futura', result: 'SnailPay no disponible' },
  { card: '4000 0000 0000 0408', data: 'fecha futura', result: 'Timeout (tarda 12 s)' },
] as const

/** Tarjetas ficticias para probar cada respuesta (docs/03-snailpay/escenarios.md). */
export function TestCards() {
  return (
    <section className={styles.card} aria-labelledby="test-cards-title">
      <h2 id="test-cards-title" className={styles.title}>
        <Info aria-hidden="true" size={18} />
        Tarjetas de prueba
      </h2>
      <p className={styles.note}>
        SnailPay es una simulación: usa solo estos datos ficticios, nunca una tarjeta real.
      </p>
      <table className={styles.table}>
        <thead>
          <tr>
            <th scope="col">Tarjeta</th>
            <th scope="col">Datos</th>
            <th scope="col">Resultado</th>
          </tr>
        </thead>
        <tbody>
          {SCENARIOS.map((scenario) => (
            <tr key={`${scenario.card}-${scenario.result}`}>
              <td className={styles.mono}>{scenario.card}</td>
              <td>{scenario.data}</td>
              <td>{scenario.result}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
