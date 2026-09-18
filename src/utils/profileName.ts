export function normalizeProfileName(value: string | null | undefined, fallback = 'Usuario'): string {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : fallback;
}
