import { useDeferredValue, useMemo, useState } from 'react'
import { PLAYBOOKS } from '../data/playbooks'

export function PlaybookLibrary() {
  const [query, setQuery] = useState('')
  const deferredQuery = useDeferredValue(query.trim().toLowerCase())
  const playbooks = useMemo(
    () =>
      PLAYBOOKS.filter(
        (playbook) =>
          !deferredQuery ||
          playbook.name.toLowerCase().includes(deferredQuery) ||
          playbook.domains.some((domain) => domain.includes(deferredQuery)),
      ),
    [deferredQuery],
  )

  return (
    <div className="playbooks-page">
      <header className="page-heading">
        <div>
          <p className="eyebrow">Open service directory</p>
          <h1>Instructions decay. Sources matter.</h1>
          <p>
            Every guide links to official documentation and carries verification
            date.
          </p>
        </div>
        <label className="search-field search-field--large">
          <span className="visually-hidden">Search playbooks</span>
          <input
            type="search"
            placeholder="Search service"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
      </header>

      <div className="playbook-grid">
        {playbooks.map((playbook) => (
          <article className="playbook-card" key={playbook.id}>
            <div className="playbook-card__top">
              <span className="service-avatar service-avatar--large" aria-hidden="true">
                {playbook.name.slice(0, 1)}
              </span>
              <div>
                <h2>{playbook.name}</h2>
                <p>{playbook.domains.join(' · ')}</p>
              </div>
              <span className={`category category--${playbook.category}`}>
                {playbook.category}
              </span>
            </div>
            <p>{playbook.summary}</p>
            <dl className="playbook-meta">
              <div>
                <dt>Method</dt>
                <dd>{playbook.method.replaceAll('_', ' ')}</dd>
              </div>
              <div>
                <dt>Old inbox</dt>
                <dd>{playbook.oldInboxRequired ? 'Required' : 'Not required'}</dd>
              </div>
              <div>
                <dt>Verified</dt>
                <dd>{playbook.lastVerified}</dd>
              </div>
            </dl>
            <div className="button-row">
              <a
                className="button button--secondary"
                href={playbook.settingsUrl}
                target="_blank"
                rel="noreferrer"
              >
                Settings ↗
              </a>
              <a
                className="text-button"
                href={playbook.sourceUrl}
                target="_blank"
                rel="noreferrer"
              >
                Official source
              </a>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
