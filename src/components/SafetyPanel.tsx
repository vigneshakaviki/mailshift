import { useState } from 'react'

interface SafetyPanelProps {
  onExportBackup: () => Promise<void>
  onExportReport: () => void
  onDeleteVault: () => void
}

export function SafetyPanel({
  onExportBackup,
  onExportReport,
  onDeleteVault,
}: SafetyPanelProps) {
  const [showDelete, setShowDelete] = useState(false)
  const [confirmation, setConfirmation] = useState('')

  return (
    <div className="safety-page">
      <header className="page-heading">
        <div>
          <p className="eyebrow">Security boundary</p>
          <h1>Your migration map stays yours.</h1>
          <p>No account inventory, email address, or note leaves browser.</p>
        </div>
      </header>

      <div className="safety-grid">
        <article className="card principle-card">
          <span className="principle-number">01</span>
          <h2>Encrypted at rest</h2>
          <p>
            AES-GCM encryption. Passphrase-derived key remains in memory only
            while workspace unlocked.
          </p>
        </article>
        <article className="card principle-card">
          <span className="principle-number">02</span>
          <h2>No credential custody</h2>
          <p>
            Imports reject password, username, OTP, secret, recovery-code, and
            notes columns.
          </p>
        </article>
        <article className="card principle-card">
          <span className="principle-number">03</span>
          <h2>No automation</h2>
          <p>
            Mailshift opens official settings. It never logs in, submits forms,
            or impersonates user.
          </p>
        </article>
      </div>

      <section className="card backup-card" aria-labelledby="backup-heading">
        <div>
          <p className="step-label">Recovery</p>
          <h2 id="backup-heading">Export encrypted backup</h2>
          <p>
            Save after major migration sessions. Backup remains encrypted with
            current passphrase.
          </p>
        </div>
        <button className="button button--primary" onClick={onExportBackup}>
          Download encrypted backup
        </button>
      </section>

      <section className="card backup-card" aria-labelledby="report-heading">
        <div>
          <p className="step-label">Portable record</p>
          <h2 id="report-heading">Export completion report</h2>
          <p>
            Plaintext CSV includes service, domain, category, status, and
            checklist results. No emails or notes.
          </p>
        </div>
        <button className="button button--secondary" onClick={onExportReport}>
          Download report CSV
        </button>
      </section>

      <section className="card danger-zone" aria-labelledby="danger-heading">
        <div>
          <p className="step-label">Danger zone</p>
          <h2 id="danger-heading">Delete local vault</h2>
          <p>Permanent in this browser. Export backup first.</p>
        </div>
        {!showDelete ? (
          <button
            className="button button--danger"
            onClick={() => setShowDelete(true)}
          >
            Start deletion
          </button>
        ) : (
          <div className="delete-confirmation">
            <label>
              Type DELETE
              <input
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
              />
            </label>
            <div className="button-row">
              <button
                className="button button--quiet"
                onClick={() => {
                  setShowDelete(false)
                  setConfirmation('')
                }}
              >
                Cancel
              </button>
              <button
                className="button button--danger"
                disabled={confirmation !== 'DELETE'}
                onClick={onDeleteVault}
              >
                Delete vault permanently
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
