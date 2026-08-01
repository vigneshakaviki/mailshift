import { useEffect, useRef, useState } from 'react'
import { findKnownSite } from '../data/knownSites'
import type {
  Account,
  Checklist,
  MigrationStatus,
  Playbook,
} from '../types'
import { STATUSES } from '../types'

interface AccountDetailProps {
  account: Account
  playbook?: Playbook
  onChange: (account: Account) => void
  onDelete: (account: Account) => void
  onClose: () => void
}

const CHECKLIST_ITEMS: Array<{
  key: keyof Checklist
  label: string
  detail: string
}> = [
  {
    key: 'addressChanged',
    label: 'Primary address changed',
    detail: 'Login or primary contact now points at destination address.',
  },
  {
    key: 'recoveryUpdated',
    label: 'Recovery path updated',
    detail: 'Old email removed from recovery and security notifications.',
  },
  {
    key: 'alternateLoginAdded',
    label: 'Independent login added',
    detail: 'Password, passkey, or alternate identity works without old provider.',
  },
  {
    key: 'newAddressVerified',
    label: 'New address verified',
    detail: 'Confirmation link or code completed in destination inbox.',
  },
  {
    key: 'loginRetested',
    label: 'Fresh login tested',
    detail: 'Signed out, then signed in from private browser window.',
  },
  {
    key: 'oldAddressRemoved',
    label: 'Old address removed',
    detail: 'Removed only after new login and recovery paths passed.',
  },
]

export function AccountDetail({
  account,
  playbook,
  onChange,
  onDelete,
  onClose,
}: AccountDetailProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const [templateCopied, setTemplateCopied] = useState(false)
  const knownSite = playbook ? undefined : findKnownSite(account.domain)

  useEffect(() => {
    closeButtonRef.current?.focus()

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [onClose])

  function updateChecklist(key: keyof Checklist, value: boolean) {
    const checklist = { ...account.checklist, [key]: value }
    const verified =
      checklist.addressChanged &&
      checklist.recoveryUpdated &&
      checklist.newAddressVerified &&
      checklist.loginRetested
    onChange({
      ...account,
      checklist,
      status: verified ? 'verified' : account.status,
      updatedAt: new Date().toISOString(),
    })
  }

  async function copySupportTemplate() {
    const template = `Subject: Request to update the email address on my ${account.name} account

Hello ${account.name} support,

I am retiring the email address currently associated with my account and need to replace it with a new address while preserving my account data, purchases, and access.

Please direct me to your official email-change process and tell me which non-secret information is required to verify account ownership. I will not send my password, one-time codes, recovery codes, or full payment details by email.

Thank you.`

    await navigator.clipboard.writeText(template)
    setTemplateCopied(true)
    window.setTimeout(() => setTemplateCopied(false), 2_000)
  }

  return (
    <div className="dialog-backdrop" onMouseDown={onClose}>
      <section
        className="detail-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="detail-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="detail-header">
          <div className="detail-title">
            <span className="service-avatar service-avatar--large" aria-hidden="true">
              {account.name.slice(0, 1).toUpperCase()}
            </span>
            <div>
              <p className="step-label">{account.domain}</p>
              <h2 id="detail-title">{account.name}</h2>
            </div>
          </div>
          <button
            ref={closeButtonRef}
            className="icon-button"
            onClick={onClose}
            aria-label="Close account details"
          >
            ×
          </button>
        </header>

        <div className="detail-body">
          <div className="detail-controls">
            <label>
              Migration status
              <select
                value={account.status}
                onChange={(event) =>
                  onChange({
                    ...account,
                    status: event.target.value as MigrationStatus,
                    updatedAt: new Date().toISOString(),
                  })
                }
              >
                {STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </label>
            <span className={`category category--${account.category}`}>
              {account.category}
            </span>
          </div>

          {playbook ? (
            <article className="playbook-callout">
              <div className="section-heading">
                <div>
                  <p className="step-label">Verified playbook</p>
                  <h3>{playbook.summary}</h3>
                </div>
                <span className="verified-date">
                  Checked {playbook.lastVerified}
                </span>
              </div>

              {playbook.oldInboxRequired ? (
                <div className="critical-note">
                  Complete this account before old inbox closes. Current-address
                  access required.
                </div>
              ) : null}

              <ol className="playbook-steps">
                {playbook.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>

              <div className="button-row">
                <a
                  className="button button--primary"
                  href={playbook.settingsUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open account settings ↗
                </a>
                <a
                  className="button button--quiet"
                  href={playbook.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Official instructions
                </a>
              </div>
            </article>
          ) : (
            <div className="manual-note">
              <strong>
                {knownSite
                  ? 'Popular site recognized; verified playbook pending.'
                  : 'No verified playbook yet.'}
              </strong>{' '}
              Find official account documentation. Never submit credentials
              through Mailshift. Popularity does not verify domain safety or
              ownership; confirm the address before signing in.
              {knownSite ? (
                <div className="button-row">
                  <a
                    className="button button--quiet"
                    href={`https://${knownSite.domain}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open catalog domain ↗
                  </a>
                </div>
              ) : null}
            </div>
          )}

          <section
            className="support-template"
            aria-labelledby="support-template-heading"
          >
            <div>
              <p className="step-label">Support fallback</p>
              <h3 id="support-template-heading">Ask without sharing secrets</h3>
              <p>
                Copy a neutral request with placeholders. Add account details
                only inside the service&apos;s official support channel.
              </p>
            </div>
            <button
              className="button button--quiet"
              onClick={() => void copySupportTemplate()}
            >
              {templateCopied ? 'Copied' : 'Copy support template'}
            </button>
          </section>

          <section aria-labelledby="checklist-heading">
            <div className="section-heading">
              <div>
                <p className="step-label">Verification gate</p>
                <h3 id="checklist-heading">Safe handoff checklist</h3>
              </div>
            </div>
            <div className="checklist">
              {CHECKLIST_ITEMS.map((item) => (
                <label key={item.key} className="check-item">
                  <input
                    type="checkbox"
                    checked={account.checklist[item.key]}
                    onChange={(event) =>
                      updateChecklist(item.key, event.target.checked)
                    }
                  />
                  <span className="custom-check" aria-hidden="true">
                    ✓
                  </span>
                  <span>
                    <strong>{item.label}</strong>
                    <small>{item.detail}</small>
                  </span>
                </label>
              ))}
            </div>
          </section>

          <label>
            Private notes
            <textarea
              rows={4}
              value={account.notes}
              onChange={(event) =>
                onChange({
                  ...account,
                  notes: event.target.value,
                  updatedAt: new Date().toISOString(),
                })
              }
              placeholder="Support ticket number, blocker, next action. Never store passwords or recovery codes."
            />
          </label>
        </div>

        <footer className="detail-footer">
          <button
            className="text-button text-button--danger"
            onClick={() => {
              if (window.confirm(`Remove ${account.name} from local inventory?`)) {
                onDelete(account)
              }
            }}
          >
            Remove account
          </button>
          <button className="button button--secondary" onClick={onClose}>
            Done
          </button>
        </footer>
      </section>
    </div>
  )
}
