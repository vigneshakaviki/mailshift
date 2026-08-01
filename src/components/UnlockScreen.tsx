import { useRef, useState, type ChangeEvent, type FormEvent } from 'react'

interface UnlockScreenProps {
  hasVault: boolean
  busy: boolean
  error: string
  onCreate: (passphrase: string) => Promise<void>
  onUnlock: (passphrase: string) => Promise<void>
  onImportBackup: (contents: string) => Promise<void>
  onResetVault: () => void
}

export function UnlockScreen({
  hasVault,
  busy,
  error,
  onCreate,
  onUnlock,
  onImportBackup,
  onResetVault,
}: UnlockScreenProps) {
  const backupRef = useRef<HTMLInputElement>(null)
  const [passphrase, setPassphrase] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [localError, setLocalError] = useState('')
  const [localNotice, setLocalNotice] = useState('')
  const [replaceValue, setReplaceValue] = useState('')
  const [showReplace, setShowReplace] = useState(false)
  const [resetValue, setResetValue] = useState('')
  const [showReset, setShowReset] = useState(false)

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
    setLocalNotice('')

    try {
      await onImportBackup(await file.text())
      setPassphrase('')
      setConfirmation('')
      setReplaceValue('')
      setShowReplace(false)
      setLocalNotice('Backup imported. Unlock with its passphrase.')
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
          Find every service tied to an old email. Plan the email change,
          move login and recovery paths, and verify access before the address
          disappears.
        </p>
        <div className="privacy-strip">
          <span>Encrypted locally</span>
          <span>No backend</span>
          <span>No passwords</span>
        </div>
      </section>

      <section className="unlock-panel">
        <p className="step-label">
          {hasVault ? 'Existing vault found' : 'No vault yet'}
        </p>
        <h2>{hasVault ? 'Unlock workspace' : 'Create new workspace'}</h2>
        <p className="muted">
          {hasVault
            ? 'Enter passphrase to unlock this browser vault.'
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

          {localNotice ? (
            <p className="import-message" role="status">
              {localNotice}
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

        <div className="backup-import">
          <input
            ref={backupRef}
            className="visually-hidden"
            type="file"
            aria-label="Import encrypted Mailshift backup"
            accept=".json,application/json"
            onChange={importBackup}
          />
          <span>
            {hasVault
              ? 'Forgot passphrase? Replace local vault from encrypted backup.'
              : 'Already have an encrypted backup?'}
          </span>
          {!hasVault ? (
            <button
              className="text-button"
              type="button"
              disabled={busy}
              onClick={() => backupRef.current?.click()}
            >
              Import backup
            </button>
          ) : !showReplace ? (
            <button
              className="text-button"
              type="button"
              disabled={busy}
              onClick={() => {
                setLocalNotice('')
                setShowReset(false)
                setResetValue('')
                setShowReplace(true)
              }}
            >
              Replace from backup
            </button>
          ) : (
            <div className="stack backup-replace">
              <p>
                Valid backup will replace encrypted vault stored in this
                browser. Keep existing backup until restore is verified.
              </p>
              <label>
                Type REPLACE
                <input
                  value={replaceValue}
                  onChange={(event) => setReplaceValue(event.target.value)}
                  autoComplete="off"
                />
              </label>
              <div className="button-row">
                <button
                  className="button button--quiet"
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    setShowReplace(false)
                    setReplaceValue('')
                  }}
                >
                  Cancel
                </button>
                <button
                  className="button button--danger"
                  type="button"
                  disabled={busy || replaceValue !== 'REPLACE'}
                  onClick={() => backupRef.current?.click()}
                >
                  Choose backup
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="warning-note">
          <strong>No passphrase recovery.</strong> Losing it makes local data
          unreadable. Encrypted backup recommended.
        </div>

        {hasVault ? (
          <div className="backup-import">
            <span>Need clean start? Reset local vault in this browser.</span>
            {!showReset ? (
              <button
                className="text-button"
                type="button"
                disabled={busy}
                onClick={() => {
                  setShowReplace(false)
                  setReplaceValue('')
                  setShowReset(true)
                }}
              >
                Start reset
              </button>
            ) : (
              <div className="stack">
                <label>
                  Type RESET
                  <input
                    value={resetValue}
                    onChange={(event) => setResetValue(event.target.value)}
                    autoComplete="off"
                  />
                </label>
                <div className="button-row">
                  <button
                    className="button button--quiet"
                    type="button"
                    disabled={busy}
                    onClick={() => {
                      setShowReset(false)
                      setResetValue('')
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className="button button--danger"
                    type="button"
                    disabled={busy || resetValue !== 'RESET'}
                    onClick={() => {
                      onResetVault()
                      setShowReset(false)
                      setResetValue('')
                    }}
                  >
                    Reset vault
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </section>
    </main>
  )
}
