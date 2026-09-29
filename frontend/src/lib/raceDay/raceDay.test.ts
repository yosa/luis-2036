import { describe, expect, it } from 'vitest'
import { generateRaceDay, localDateKey } from './raceDay'

// Invariantes sobre muchas semillas: la coherencia debe valer para cualquier usuario y día.
const samples = Array.from({ length: 200 }, (_, index) =>
  generateRaceDay(`user-${index}`, `2026-09-${String((index % 28) + 1).padStart(2, '0')}`),
)

describe('generateRaceDay', () => {
  it('siempre hay 6 carreras y 6 caracoles', () => {
    for (const day of samples) {
      expect(day.races).toHaveLength(6)
      expect(day.winsBySnail).toHaveLength(6)
    }
  })

  it('la suma de victorias es exactamente 6 (un ganador por carrera)', () => {
    for (const day of samples) {
      expect(day.winsBySnail.reduce((sum, snail) => sum + snail.wins, 0)).toBe(6)
    }
  })

  it('una apuesta se gana solo si su caracol ganó esa carrera', () => {
    for (const day of samples) {
      for (const bet of day.bets) {
        const race = day.races.find((candidate) => candidate.number === bet.raceNumber)
        expect(bet.won).toBe(race?.winnerId === bet.snailId)
      }
    }
  })

  it('entre 3 y 6 apuestas, una por carrera como máximo, y el resumen cuadra', () => {
    for (const day of samples) {
      const raceNumbers = day.bets.map((bet) => bet.raceNumber)
      expect(day.bets.length).toBeGreaterThanOrEqual(3)
      expect(day.bets.length).toBeLessThanOrEqual(6)
      expect(new Set(raceNumbers).size).toBe(raceNumbers.length)
      expect(day.betsSummary.won + day.betsSummary.lost).toBe(day.bets.length)
    }
  })

  it('es determinista: misma semilla, mismos datos; otro día, otros datos', () => {
    const today = generateRaceDay('ana', '2026-09-28')

    expect(generateRaceDay('ana', '2026-09-28')).toEqual(today)
    expect(generateRaceDay('ana', '2026-09-29').races).not.toEqual(today.races)
  })
})

describe('localDateKey', () => {
  it('usa la fecha local con ceros a la izquierda', () => {
    expect(localDateKey(new Date(2026, 0, 5, 23, 30))).toBe('2026-01-05')
  })
})
