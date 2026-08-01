import { useDeferredValue, useMemo, useState } from 'react'
import { findKnownSite } from '../data/knownSites'
import type { Account, MigrationStatus } from '../types'
import { STATUSES } from '../types'
import { sortByPriority } from '../lib/workspace'
import { AccountImporter } from './AccountImporter'
import { AddAccountForm } from './AddAccountForm'

interface AccountListProps {
  accounts: Account[]
  onAdd: (account: Account) => void
  onImport: (accounts: Account[]) => { added: number; skipped: number }
  onOpen: (account: Account) => void
}

function guideLabel(account: Account): string {
  if (account.playbookId) return 'Verified'
  return findKnownSite(account.domain) ? 'Known site' : 'Manual'
}

export function AccountList({
  accounts,
  onAdd,
  onImport,
  onOpen,
}: AccountListProps) {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<MigrationStatus | 'all'>('all')
  const deferredQuery = useDeferredValue(query.trim().toLowerCase())

  const filtered = useMemo(
    () =>
      sortByPriority(accounts).filter((account) => {
        const matchesQuery =
          !deferredQuery ||
          account.name.toLowerCase().includes(deferredQuery) ||
          account.domain.toLowerCase().includes(deferredQuery)
        return matchesQuery && (status === 'all' || account.status === status)
      }),
    [accounts, deferredQuery, status],
  )

  return (
    <div className="accounts-page">
      <header className="page-heading">
        <div>
          <p className="eyebrow">Account inventory</p>
          <h1>Move identities, not only mail.</h1>
          <p>Highest-risk unfinished accounts appear first.</p>
        </div>
        <span className="count-badge">
          {accounts.length} {accounts.length === 1 ? 'account' : 'accounts'}
        </span>
      </header>

      <AccountImporter onImport={onImport} />

      <section className="card" aria-labelledby="manual-heading">
        <div className="section-heading">
          <div>
            <p className="step-label">Manual entry</p>
            <h2 id="manual-heading">Add one account</h2>
          </div>
        </div>
        <AddAccountForm onAdd={onAdd} />
      </section>

      <section className="card inventory-card" aria-labelledby="inventory-heading">
        <div className="inventory-toolbar">
          <div>
            <p className="step-label">Work queue</p>
            <h2 id="inventory-heading">All accounts</h2>
          </div>
          <div className="filter-group">
            <label className="search-field">
              <span className="visually-hidden">Search accounts</span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search name or domain"
              />
            </label>
            <label>
              <span className="visually-hidden">Filter by status</span>
              <select
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value as MigrationStatus | 'all')
                }
              >
                <option value="all">All statuses</option>
                {STATUSES.map((item) => (
                  <option key={item} value={item}>
                    {item.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <strong>No matching accounts</strong>
            <p>Add account or change filters.</p>
          </div>
        ) : (
          <div className="account-table">
            <div className="account-row account-row--head" aria-hidden="true">
              <span>Service</span>
              <span>Category</span>
              <span>Status</span>
              <span>Guide</span>
              <span />
            </div>
            {filtered.map((account) => (
              <button
                key={account.id}
                className="account-row"
                onClick={() => onOpen(account)}
              >
                <span className="account-service">
                  <span className="service-avatar" aria-hidden="true">
                    {account.name.slice(0, 1).toUpperCase()}
                  </span>
                  <span>
                    <strong>{account.name}</strong>
                    <small>{account.domain}</small>
                  </span>
                </span>
                <span className={`category category--${account.category}`}>
                  {account.category}
                </span>
                <span className={`status status--${account.status}`}>
                  {account.status.replace('_', ' ')}
                </span>
                <span>{guideLabel(account)}</span>
                <span className="row-arrow" aria-hidden="true">
                  →
                </span>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
