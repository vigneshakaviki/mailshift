import { describe, expect, it } from 'vitest'
import { parseEnvelope } from './storage'

const envelope = {
  version: 1,
  algorithm: 'AES-GCM',
  kdf: 'PBKDF2-SHA-256',
  iterations: 310_000,
  salt: 'YWJjZA==',
  iv: 'YWJjZA==',
  ciphertext: 'YWJjZA==',
}

describe('backup envelope validation', () => {
  it('accepts a Mailshift v1 envelope', () => {
    expect(parseEnvelope(envelope)).toEqual(envelope)
  })

  it('rejects malformed and unexpectedly expensive backups', () => {
    expect(() => parseEnvelope({ ...envelope, ciphertext: '<script>' })).toThrow(
      /valid Mailshift/,
    )
    expect(() =>
      parseEnvelope({ ...envelope, iterations: 2_000_000_000 }),
    ).toThrow(/valid Mailshift/)
  })
})
