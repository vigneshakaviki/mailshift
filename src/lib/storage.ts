import type { EncryptedEnvelope } from '../types'

export const STORAGE_KEY = 'mailshift.workspace.v1'

function isBase64(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    value.length > 0 &&
    value.length < 10_000_000 &&
    /^[A-Za-z0-9+/]*={0,2}$/.test(value)
  )
}

export function parseEnvelope(value: unknown): EncryptedEnvelope {
  if (
    !value ||
    typeof value !== 'object' ||
    !('version' in value) ||
    value.version !== 1 ||
    !('algorithm' in value) ||
    value.algorithm !== 'AES-GCM' ||
    !('kdf' in value) ||
    value.kdf !== 'PBKDF2-SHA-256' ||
    !('iterations' in value) ||
    value.iterations !== 310_000 ||
    !('salt' in value) ||
    !isBase64(value.salt) ||
    !('iv' in value) ||
    !isBase64(value.iv) ||
    !('ciphertext' in value) ||
    !isBase64(value.ciphertext)
  ) {
    throw new Error('Not a valid Mailshift v1 encrypted backup.')
  }

  return value as EncryptedEnvelope
}

export function readEnvelope(): EncryptedEnvelope | null {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null

  try {
    return parseEnvelope(JSON.parse(raw))
  } catch {
    return null
  }
}

export function writeEnvelope(envelope: EncryptedEnvelope): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(envelope))
}

export function deleteEnvelope(): void {
  localStorage.removeItem(STORAGE_KEY)
}
