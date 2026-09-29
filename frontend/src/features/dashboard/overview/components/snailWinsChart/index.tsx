import { Bar, BarChart, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { SnailWins } from '../../../../../lib/raceDay/raceDay'
import { ChartCard } from '../chartCard'

type SnailWinsChartProps = { winsBySnail: SnailWins[]; racesCount: number }

/**
 * Victorias por caracol en el día simulado. Barras horizontales porque los
 * nombres son largos; una sola serie, así que sin leyenda: el título la nombra.
 */
export function SnailWinsChart({ winsBySnail, racesCount }: Readonly<SnailWinsChartProps>) {
  const summary = describeLeader(winsBySnail, racesCount)

  return (
    <ChartCard
      id="wins"
      title="Victorias por caracol"
      summary={summary}
      table={
        <table>
          <thead>
            <tr>
              <th scope="col">Caracol</th>
              <th scope="col">Victorias</th>
            </tr>
          </thead>
          <tbody>
            {winsBySnail.map((snail) => (
              <tr key={snail.snailId}>
                <th scope="row">{snail.name}</th>
                <td>{snail.wins}</td>
              </tr>
            ))}
          </tbody>
        </table>
      }
    >
      <ResponsiveContainer width="100%" height={winsBySnail.length * 40 + 16}>
        <BarChart
          data={winsBySnail}
          layout="vertical"
          margin={{ top: 0, right: 32, bottom: 0, left: 0 }}
        >
          <XAxis type="number" hide domain={[0, 'dataMax']} allowDecimals={false} />
          <YAxis
            type="category"
            dataKey="name"
            width={150}
            tickLine={false}
            axisLine={{ stroke: 'var(--chart-grid)' }}
            tick={{ fill: 'var(--text)', fontSize: 14 }}
          />
          <Tooltip
            cursor={{ fill: 'var(--surface-muted)' }}
            formatter={(value) => [value, 'Victorias']}
            contentStyle={{
              background: 'var(--surface)',
              border: '1px solid var(--border-strong)',
              borderRadius: 8,
              color: 'var(--text)',
            }}
            itemStyle={{ color: 'var(--text)' }}
          />
          <Bar
            dataKey="wins"
            name="Victorias"
            fill="var(--chart-bar)"
            barSize={20}
            // Un caracol sin victorias muestra un tope mínimo para que su "0" no parezca un dato faltante.
            minPointSize={3}
            radius={[0, 4, 4, 0]}
            isAnimationActive={false}
          >
            <LabelList dataKey="wins" position="right" fill="var(--text)" fontWeight={700} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

/** Resumen en texto de la gráfica: quién va al frente (o empate). */
function describeLeader(winsBySnail: SnailWins[], racesCount: number): string {
  const maxWins = Math.max(...winsBySnail.map((snail) => snail.wins))
  const leaders = winsBySnail.filter((snail) => snail.wins === maxWins)
  const victories = maxWins === 1 ? 'victoria' : 'victorias'
  if (leaders.length === 1) {
    return `${racesCount} carreras hoy. ${leaders[0]?.name} va al frente con ${maxWins} ${victories}.`
  }
  const names = leaders.map((snail) => snail.name).join(', ')
  return `${racesCount} carreras hoy. Empate al frente con ${maxWins} ${victories}: ${names}.`
}
