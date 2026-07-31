import { useRef, useState, type ChangeEvent, type FormEvent } from 'react'

interface UnlockScreenProps {
  hasVault: boolean
  busy: boolean
  error: string
  onCreate: (passphrase: string) => Promise<void>
  onUnlock: (passphrase: string) => Promise<void>
  onImportBackup: (contents: string) => Promise<void>
}

export function UnlockScreen({
  hasVault,
  busy,
  error,
  onCreate,
  onUnlock,
  onImportBackup,
}: UnlockScreenProps) {
  const backupRef = useRef<HTMLInputElement>(null)
  const [passphrase, setPassphrase] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [localError, setLocalError] = useState('')

  async function submit(event: FormEvent) {
    event.preventDefault()
    setLocalError('')

    if (!hasVault) {
      if (passphrase.length < 12) {
        setLocalError('Use at least 12 characters.')
        return
      }
      if (passphrase !== confirmation) {
        setLocalError('Passphrases do not match.')
        return
      }
      await onCreate(passphrase)
      return
    }

    await onUnlock(passphrase)
  }

  async function importBackup(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    setLocalError('')

    try {
      await onImportBackup(await file.text())
    } catch (caught) {
      setLocalError(
        caught instanceof Error ? caught.message : 'Could not import backup.',
      )
    } finally {
      event.target.value = ''
    }
  }

  const displayedError = localError || error

  return (
    <main className="unlock-shell">
      <section className="unlock-brand" aria-labelledby="unlock-title">
        <div className="brand-lockup brand-lockup--large">
          <span className="brand-mark" aria-hidden="true">
            M→
          </span>
          <span>Mailshift</span>
        </div>
        <p className="eyebrow">Private account continuity</p>
        <h1 id="unlock-title">Leave no account behind.</h1>
        <p className="unlock-lede">
          Find every service tied to an old email. Move login and recovery
          paths. Verify access before the address disappears.
        </p>
        <div className="privacy-strip">
          <span>Encrypted locally</span>
          <span>No backend</span>
          <span>No passwords</span>
        </div>
      </section>

      <section className="unlock-panel">
        <p className="step-label">{hasVault ? 'Welcome back' : 'Create vault'}</p>
        <h2>{hasVault ? 'Unlock migration' : 'Protect your migration plan'}</h2>
        <p className="muted">
          {hasVault
            ? 'Passphrase never leaves this browser.'
            : 'Mailshift encrypts account names and email addresses before saving them.'}
        </p>

        <form onSubmit={submit} className="stack">
          <label>
            Vault passphrase
            <input
              type="password"
              value={passphrase}
              onChange={(event) => setPassphrase(event.target.value)}
              autoComplete={hasVault ? 'current-password' : 'new-password'}
              autoFocus
              required
            />
          </label>

          {!hasVault ? (
            <label>
              Confirm passphrase
              <input
                type="password"
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
                autoComplete="new-password"
                required
              />
            </label>
          ) : null}

          {displayedError ? (
            <p className="form-error" role="alert">
              {displayedError}
            </p>
          ) : null}

          <button className="button button--primary button--wide" disabled={busy}>
            {busy
              ? 'Working…'
              : hasVault
                ? 'Unlock workspace'
                : 'Create encrypted workspace'}
          </button>
        </form>

        {!hasVault ? (
          <div className="backup-import">
            <span>Already have an encrypted backup?</span>
            <input
              ref={backupRef}
              className="visually-hidden"
              type="file"
              accept=".json,application/json"
              onChange={importBackup}
            />
            <button
              className="text-button"
              type="button"
              disabled={busy}
              onClick={() => backupRef.current?.click()}
            >
              Import backup
            </button>
          </div>
        ) : null}

        <div className="warning-note">
          <strong>No passphrase recovery.</strong> Losing it makes local data
          unreadable. Encrypted backup recommended.
        </div>
      </section>
    </main>
  )
}
