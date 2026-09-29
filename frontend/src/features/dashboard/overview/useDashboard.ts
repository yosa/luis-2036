import { useMemo } from 'react'
import { generateRaceDay, localDateKey } from '../../../lib/raceDay/raceDay'
import { useSessionStore } from '../../../stores/session'
import { useWalletStore } from '../../../stores/wallet'

export function useDashboard() {
  const user = useSessionStore((state) => state.user)
  const balanceCents = useWalletStore((state) => state.balanceCents)
  const userId = user?.id ?? ''
  const today = localDateKey(new Date())

  // Datos simulados y deterministas: los mismos todo el día para el mismo usuario (ADR 0007).
  const raceDay = useMemo(() => generateRaceDay(userId, today), [userId, today])

  return {
    firstName: user?.fullName.split(' ')[0] ?? '',
    balanceCents,
    raceDay,
  }
}
