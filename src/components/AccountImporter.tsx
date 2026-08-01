import { useRef, useState, type ChangeEvent } from 'react'
import { parseSafeCsv } from '../lib/csv'
import type { Account } from '../types'

interface AccountImporterProps {
  onImport: (accounts: Account[]) => { added: number; skipped: number }
}

export function AccountImporter({ onImport }: AccountImporterProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function readFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setMessage('')
    setError('')
    try {
      const accounts = parseSafeCsv(await file.text())
      const result = onImport(accounts)
      setMessage(
        `${result.added} account${result.added === 1 ? '' : 's'} added${
          result.skipped ? `; ${result.skipped} duplicate(s) skipped` : ''
        }.`,
      )
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Import failed.')
    } finally {
      event.target.value = ''
    }
  }

  return (
    <section className="import-panel" aria-labelledby="import-heading">
      <div>
        <p className="step-label">Safe import</p>
        <h2 id="import-heading">Bring URL-only inventory</h2>
        <p>
          Allowed columns: <code>name</code>, <code>domain</code>,{' '}
          <code>url</code>, <code>website</code>, <code>category</code>.
          Credential columns trigger rejection.
        </p>
      </div>
      <input
        ref={fileRef}
        className="visually-hidden"
        type="file"
        aria-label="Select credential-free account CSV"
        accept=".csv,text/csv"
        onChange={readFile}
      />
      <button
        className="button button--secondary"
        onClick={() => fileRef.current?.click()}
      >
        Select safe CSV
      </button>
      {message ? (
        <p className="import-message" role="status">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : null}
    </section>
  )
}
