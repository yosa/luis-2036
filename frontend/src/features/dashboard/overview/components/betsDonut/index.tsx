import { Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { ChartCard } from '../chartCard'
import { chartTooltipProps } from '../chartCard/tooltipStyles'
import styles from './styles.module.sass'

type BetsDonutProps = { won: number; lost: number }

/**
 * Apuestas ganadas contra perdidas del día. El alcance pide una dona; como es
 * una proporción de dos partes, el porcentaje va escrito en el centro y los
 * conteos en la leyenda, para no depender del color (ADR 0007).
 */
export function BetsDonut({ won, lost }: Readonly<BetsDonutProps>) {
  const total = won + lost
  const wonPercent = total === 0 ? 0 : Math.round((won / total) * 100)
  const data = [
    // Recharts toma el `fill` de cada dato para su porción.
    { name: 'Ganadas', value: won, fill: 'var(--chart-won)', swatch: styles.swatchWon },
    { name: 'Perdidas', value: lost, fill: 'var(--chart-lost)', swatch: styles.swatchLost },
  ]

  return (
    <ChartCard
      id="bets"
      title="Tus apuestas de hoy"
      summary={`Ganaste ${won} de ${total} apuestas (${wonPercent} %).`}
      table={
        <table>
          <thead>
            <tr>
              <th scope="col">Resultado</th>
              <th scope="col">Apuestas</th>
            </tr>
          </thead>
          <tbody>
            {data.map((slice) => (
              <tr key={slice.name}>
                <th scope="row">{slice.name}</th>
                <td>{slice.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      }
    >
      <div className={styles.layout}>
        <div className={styles.donut}>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius="68%"
                outerRadius="100%"
                startAngle={90}
                endAngle={-270}
                paddingAngle={won > 0 && lost > 0 ? 2 : 0}
                stroke="var(--surface)"
                strokeWidth={2}
                isAnimationActive={false}
              />
              <Tooltip {...chartTooltipProps} />
            </PieChart>
          </ResponsiveContainer>
          <p className={styles.center} aria-hidden="true">
            <span className={styles.percent}>{wonPercent} %</span>
            <span className={styles.centerLabel}>ganadas</span>
          </p>
        </div>
        <ul className={styles.legend}>
          {data.map((slice) => (
            <li key={slice.name} className={styles.legendItem}>
              <span className={`${styles.swatch} ${slice.swatch}`} aria-hidden="true" />
              <span>{slice.name}</span>
              <strong className={styles.count}>{slice.value}</strong>
            </li>
          ))}
        </ul>
      </div>
    </ChartCard>
  )
}
