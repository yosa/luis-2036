import { RACES_PER_DAY, SNAILS } from '../../constants'

/**
 * Día simulado de carreras (ADR 0007). Determinista: la misma semilla
 * (usuario + fecha) produce siempre los mismos datos, así que recargar la
 * página no los cambia y se pueden probar sus invariantes.
 */

export type SnailId = (typeof SNAILS)[number]['id']
export type Race = { number: number; winnerId: SnailId }
export type Bet = { raceNumber: number; snailId: SnailId; won: boolean }
export type SnailWins = { snailId: SnailId; name: string; wins: number }

export type RaceDay = {
  date: string
  races: Race[]
  winsBySnail: SnailWins[]
  bets: Bet[]
  betsSummary: { won: number; lost: number }
}

const MIN_BETS = 3

export function generateRaceDay(userId: string, date: string): RaceDay {
  const random = mulberry32(hashString(`${userId}:${date}`))
  const pick = <T>(items: readonly T[]): T => items[Math.floor(random() * items.length)] as T

  const races: Race[] = Array.from({ length: RACES_PER_DAY }, (_, index) => ({
    number: index + 1,
    winnerId: pick(SNAILS).id,
  }))

  const betsCount = MIN_BETS + Math.floor(random() * (RACES_PER_DAY - MIN_BETS + 1))
  const bets: Bet[] = shuffle(races, random)
    .slice(0, betsCount)
    .sort((a, b) => a.number - b.number)
    .map((race) => {
      const snailId = pick(SNAILS).id
      return { raceNumber: race.number, snailId, won: snailId === race.winnerId }
    })

  const won = bets.filter((bet) => bet.won).length
  return {
    date,
    races,
    winsBySnail: SNAILS.map((snail) => ({
      snailId: snail.id,
      name: snail.name,
      wins: races.filter((race) => race.winnerId === snail.id).length,
    })),
    bets,
    betsSummary: { won, lost: bets.length - won },
  }
}

/** Fecha local AAAA-MM-DD: el "día" es el del usuario, no el de UTC. */
export function localDateKey(now: Date): string {
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

/** PRNG pequeño y determinista de 32 bits. */
function mulberry32(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296
  }
}

/** Hash FNV-1a de 32 bits para convertir la semilla de texto en número. */
function hashString(value: string): number {
  let hash = 0x811c9dc5
  for (const char of value) {
    hash ^= char.codePointAt(0) ?? 0
    hash = Math.imul(hash, 0x01000193)
  }
  return hash >>> 0
}

function shuffle<T>(items: readonly T[], random: () => number): T[] {
  const result = [...items]
  for (let index = result.length - 1; index > 0; index--) {
    const other = Math.floor(random() * (index + 1))
    ;[result[index], result[other]] = [result[other] as T, result[index] as T]
  }
  return result
}
