import type { CSSProperties } from 'react'
import { ProfileCard } from './ProfileCard'
import type { Account, MigrationProfile } from '../types'
import {
  completionPercent,
  daysUntil,
  sortByPriority,
} from '../lib/workspace'

interface DashboardProps {
  profile: MigrationProfile
  accounts: Account[]
  onProfileChange: (profile: MigrationProfile) => void
  onOpenAccount: (account: Account) => void
  onShowAccounts: () => void
}

export function Dashboard({
  profile,
  accounts,
  onProfileChange,
  onOpenAccount,
  onShowAccounts,
}: DashboardProps) {
  const progress = completionPercent(accounts)
  const days = daysUntil(profile.deadline)
  const priority = sortByPriority(accounts).filter(
    (account) => !['verified', 'retained'].includes(account.status),
  )
  const blocked = accounts.filter((account) => account.status === 'blocked').length
  const verified = accounts.filter((account) => account.status === 'verified').length

  return (
    <div className="page-grid">
      <section className="hero-card">
        <div>
          <p className="eyebrow">Migration control room</p>
          <h1>
            {profile.deadline && days !== null
              ? days < 0
                ? 'Deadline passed'
                : `${days} days to disconnect safely`
              : 'Set deadline. Protect access.'}
          </h1>
          <p>
            Change critical identities first. Verify every new login before
            retiring old address.
          </p>
        </div>
        <div
          className="progress-ring"
          style={{ '--progress': `${progress * 3.6}deg` } as CSSProperties}
          aria-label={`${progress}% complete`}
        >
          <div>
            <strong>{progress}%</strong>
            <span>complete</span>
          </div>
        </div>
      </section>

      <div className="metric-grid">
        <article className="metric-card">
          <span>Known accounts</span>
          <strong>{accounts.length}</strong>
          <small>Inventory size</small>
        </article>
        <article className="metric-card metric-card--good">
          <span>Verified</span>
          <strong>{verified}</strong>
          <small>New login tested</small>
        </article>
        <article className="metric-card metric-card--alert">
          <span>Blocked</span>
          <strong>{blocked}</strong>
          <small>Needs intervention</small>
        </article>
      </div>

      <ProfileCard profile={profile} onChange={onProfileChange} />

      <section className="card queue-card" aria-labelledby="queue-heading">
        <div className="section-heading">
          <div>
            <p className="step-label">Next moves</p>
            <h2 id="queue-heading">Priority queue</h2>
          </div>
          <button className="text-button" onClick={onShowAccounts}>
            View all
          </button>
        </div>

        {priority.length === 0 ? (
          <div className="empty-state">
            <strong>
              {accounts.length === 0 ? 'Inventory empty' : 'Migration cleared'}
            </strong>
            <p>
              {accounts.length === 0
                ? 'Add accounts manually or import URL-only CSV.'
                : 'Every account is verified or intentionally retained.'}
            </p>
            <button className="button button--secondary" onClick={onShowAccounts}>
              {accounts.length === 0 ? 'Build inventory' : 'Review accounts'}
            </button>
          </div>
        ) : (
          <div className="queue-list">
            {priority.slice(0, 5).map((account, index) => (
              <button
                key={account.id}
                className="queue-item"
                onClick={() => onOpenAccount(account)}
              >
                <span className="queue-rank">{String(index + 1).padStart(2, '0')}</span>
                <span className="service-avatar" aria-hidden="true">
                  {account.name.slice(0, 1).toUpperCase()}
                </span>
                <span className="queue-copy">
                  <strong>{account.name}</strong>
                  <small>{account.domain}</small>
                </span>
                <span className={`category category--${account.category}`}>
                  {account.category}
                </span>
                <span className={`status status--${account.status}`}>
                  {account.status.replace('_', ' ')}
                </span>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
