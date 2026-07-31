import { describe, expect, it } from 'vitest'
import { createEmptyWorkspace } from './workspace'
import { createVault, unlockVault } from './crypto'

describe('encrypted vault', () => {
  it('round-trips a workspace through AES-GCM', async () => {
    const workspace = createEmptyWorkspace()
    workspace.profile.oldEmail = 'old@example.com'

    const { envelope } = await createVault(
      'correct horse battery staple',
      workspace,
    )
    const unlocked = await unlockVault(
      'correct horse battery staple',
      envelope,
    )

    expect(unlocked.workspace).toEqual(workspace)
    expect(JSON.stringify(envelope)).not.toContain('old@example.com')
    expect(envelope).toMatchObject({
      version: 1,
      algorithm: 'AES-GCM',
      kdf: 'PBKDF2-SHA-256',
      iterations: 310_000,
    })
  })

  it('rejects a wrong passphrase', async () => {
    const { envelope } = await createVault(
      'correct horse battery staple',
      createEmptyWorkspace(),
    )

    await expect(unlockVault('wrong passphrase', envelope)).rejects.toThrow()
  })

  it('detects ciphertext tampering', async () => {
    const passphrase = 'correct horse battery staple'
    const { envelope } = await createVault(
      passphrase,
      createEmptyWorkspace(),
    )
    const replacement = envelope.ciphertext.endsWith('A') ? 'B' : 'A'
    const tampered = {
      ...envelope,
      ciphertext: `${envelope.ciphertext.slice(0, -1)}${replacement}`,
    }

    await expect(unlockVault(passphrase, tampered)).rejects.toThrow()
  })
})
