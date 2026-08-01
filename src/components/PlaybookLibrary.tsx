import { useDeferredValue, useMemo, useState } from 'react'
import {
  KNOWN_SITE_COUNT,
  searchKnownSites,
} from '../data/knownSites'
import { findPlaybook, PLAYBOOKS } from '../data/playbooks'

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
  const knownSites = useMemo(
    () =>
      deferredQuery
        ? searchKnownSites(deferredQuery, 40)
            .filter((site) => !findPlaybook(site.domain))
            .slice(0, 24)
        : [],
    [deferredQuery],
  )

  return (
    <div className="playbooks-page">
      <header className="page-heading">
        <div>
          <p className="eyebrow">Open service directory</p>
          <h1>Instructions decay. Sources matter.</h1>
          <p>
            Search {PLAYBOOKS.length} source-linked guides plus{' '}
            {KNOWN_SITE_COUNT.toLocaleString()} recognized popular domains.
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

      {deferredQuery && knownSites.length > 0 ? (
        <section aria-labelledby="known-sites-heading">
          <div className="section-heading">
            <div>
              <p className="step-label">Broader catalog</p>
              <h2 id="known-sites-heading">Recognized sites</h2>
              <p>Generic safe workflow available; reviewed guide pending.</p>
            </div>
          </div>
          <div className="playbook-grid">
            {knownSites.map((site) => (
              <article className="playbook-card" key={site.domain}>
                <div className="playbook-card__top">
                  <span
                    className="service-avatar service-avatar--large"
                    aria-hidden="true"
                  >
                    {site.name.slice(0, 1)}
                  </span>
                  <div>
                    <h2>{site.name}</h2>
                    <p>{site.domain}</p>
                  </div>
                  <span className="category category--other">catalog</span>
                </div>
                <p>
                  Domain recognized from popularity data, not trust verification.
                  Confirm it before using official settings and checklist.
                </p>
                <div className="button-row">
                  <a
                    className="button button--secondary"
                    href={`https://${site.domain}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open catalog domain ↗
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {deferredQuery && playbooks.length === 0 && knownSites.length === 0 ? (
        <div className="empty-state">
          <strong>No catalog match</strong>
          <p>Add domain manually; generic migration checklist still works.</p>
        </div>
      ) : null}
    </div>
  )
}
