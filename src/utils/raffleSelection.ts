export function normalizeSelectedRaffleId<T extends { id: string }>(selectedId: string | null | undefined, raffles: T[]) {
  if (!selectedId) return null;
  return raffles.some((raffle) => raffle.id === selectedId) ? selectedId : null;
}
