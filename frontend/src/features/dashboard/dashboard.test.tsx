import { render, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { generateRaceDay, localDateKey } from '../../lib/raceDay/raceDay'
import { walletsSlot } from '../../storage/slots'
import { useSessionStore } from '../../stores/session'
import { renderApp } from '../../test/renderApp'
import { SnailWinsChart } from './overview/components/snailWinsChart'

beforeEach(async () => {
  useSessionStore.setState({ user: null })
  await useSessionStore
    .getState()
    .register({ fullName: 'Ana Pérez', email: 'ana@example.com', password: 'Caracol123' })
})

const userId = () => useSessionStore.getState().user?.id ?? ''

describe('dashboard', () => {
  it('muestra el nombre y un saldo inicial de $0.00', async () => {
    renderApp('/dashboard')

    expect(await screen.findByRole('heading', { name: 'Hola, Ana' })).toBeInTheDocument()
    const balance = screen.getByRole('region', { name: 'Saldo disponible' })
    expect(within(balance).getByText('$0.00')).toBeInTheDocument()
  })

  it('muestra el saldo guardado del usuario', async () => {
    walletsSlot.write({ [userId()]: { balanceCents: 125_050, appliedChargeIds: [] } })
    useSessionStore.getState().logout()
    await useSessionStore.getState().login({ email: 'ana@example.com', password: 'Caracol123' })

    renderApp('/dashboard')

    const balance = await screen.findByRole('region', { name: 'Saldo disponible' })
    expect(within(balance).getByText('$1,250.50')).toBeInTheDocument()
  })

  it('la dona resume las apuestas del día simulado, coherentes con sus reglas', async () => {
    const day = generateRaceDay(userId(), localDateKey(new Date()))
    const { won, lost } = day.betsSummary

    renderApp('/dashboard')

    const donut = await screen.findByRole('figure', { name: 'Tus apuestas de hoy' })
    expect(
      within(donut).getByText(new RegExp(`Ganaste ${won} de ${won + lost} apuestas`)),
    ).toBeInTheDocument()
  })

  it('la tabla de victorias tiene los 6 caracoles y suma exactamente 6 carreras', async () => {
    const { user } = renderApp('/dashboard')

    const chart = await screen.findByRole('figure', { name: 'Victorias por caracol' })
    await user.click(within(chart).getByText('Ver datos en tabla'))
    const rows = within(within(chart).getByRole('table')).getAllByRole('row').slice(1)
    const total = rows.reduce(
      (sum, row) => sum + Number(within(row).getByRole('cell').textContent),
      0,
    )

    expect(rows).toHaveLength(6)
    expect(total).toBe(6)
  })
})

describe('SnailWinsChart', () => {
  it('anuncia un empate al frente en lugar de elegir un ganador arbitrario', () => {
    render(
      <SnailWinsChart
        racesCount={6}
        winsBySnail={[
          { snailId: 'rayo', name: 'Rayo Baboso', wins: 2 },
          { snailId: 'turbo', name: 'Turbo Concha', wins: 2 },
          { snailId: 'lentitud', name: 'Doña Lentitud', wins: 1 },
          { snailId: 'flash', name: 'Flash Viscoso', wins: 1 },
          { snailId: 'capitan', name: 'Capitán Caparazón', wins: 0 },
          { snailId: 'veloz', name: 'La Veloz Babosa', wins: 0 },
        ]}
      />,
    )

    expect(
      screen.getByText(
        '6 carreras hoy. Empate al frente con 2 victorias: Rayo Baboso, Turbo Concha.',
      ),
    ).toBeInTheDocument()
  })
})
