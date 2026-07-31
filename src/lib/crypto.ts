import type { EncryptedEnvelope, Workspace } from '../types'

const ITERATIONS = 310_000
const AAD = new TextEncoder().encode('mailshift:v1')

function bytesToBase64(bytes: Uint8Array): string {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary)
}

function base64ToBytes(value: string): Uint8Array<ArrayBuffer> {
  const binary = atob(value)
  const bytes = new Uint8Array(binary.length)
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }
  return bytes
}

async function deriveKey(
  passphrase: string,
  salt: Uint8Array<ArrayBuffer>,
  iterations = ITERATIONS,
): Promise<CryptoKey> {
  const material = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey'],
  )

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt,
      iterations,
    },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  )
}

export async function createVault(
  passphrase: string,
  workspace: Workspace,
): Promise<{ key: CryptoKey; envelope: EncryptedEnvelope }> {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const key = await deriveKey(passphrase, salt)
  const envelope = await encryptWorkspace(workspace, key, salt)
  return { key, envelope }
}

export async function unlockVault(
  passphrase: string,
  envelope: EncryptedEnvelope,
): Promise<{ key: CryptoKey; workspace: Workspace }> {
  const salt = base64ToBytes(envelope.salt)
  const key = await deriveKey(passphrase, salt, envelope.iterations)
  const plaintext = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: base64ToBytes(envelope.iv),
      additionalData: AAD,
    },
    key,
    base64ToBytes(envelope.ciphertext),
  )
  const workspace = JSON.parse(
    new TextDecoder().decode(plaintext),
  ) as Workspace

  if (workspace.version !== 1 || !Array.isArray(workspace.accounts)) {
    throw new Error('Unsupported or damaged Mailshift vault.')
  }

  return { key, workspace }
}

export async function encryptWorkspace(
  workspace: Workspace,
  key: CryptoKey,
  salt: Uint8Array<ArrayBuffer>,
): Promise<EncryptedEnvelope> {
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encoded = new TextEncoder().encode(JSON.stringify(workspace))
  const ciphertext = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
      additionalData: AAD,
    },
    key,
    encoded,
  )

  return {
    version: 1,
    algorithm: 'AES-GCM',
    kdf: 'PBKDF2-SHA-256',
    iterations: ITERATIONS,
    salt: bytesToBase64(salt),
    iv: bytesToBase64(iv),
    ciphertext: bytesToBase64(new Uint8Array(ciphertext)),
  }
}

export function envelopeSalt(
  envelope: EncryptedEnvelope,
): Uint8Array<ArrayBuffer> {
  return base64ToBytes(envelope.salt)
}
