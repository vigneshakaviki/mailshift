export type View = 'dashboard' | 'accounts' | 'playbooks' | 'safety'

interface AppHeaderProps {
  view: View
  saveState: 'saved' | 'saving' | 'error'
  onNavigate: (view: View) => void
  onLock: () => void
}

const NAV_ITEMS: Array<{ id: View; label: string }> = [
  { id: 'dashboard', label: 'Overview' },
  { id: 'accounts', label: 'Accounts' },
  { id: 'playbooks', label: 'Playbooks' },
  { id: 'safety', label: 'Safety' },
]

export function AppHeader({
  view,
  saveState,
  onNavigate,
  onLock,
}: AppHeaderProps) {
  return (
    <header className="app-header">
      <div className="brand-lockup">
        <span className="brand-mark" aria-hidden="true">
          M→
        </span>
        <span>Mailshift</span>
      </div>

      <nav className="main-nav" aria-label="Primary navigation">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            className={view === item.id ? 'nav-link nav-link--active' : 'nav-link'}
            aria-current={view === item.id ? 'page' : undefined}
            onClick={() => onNavigate(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="header-actions">
        <span className={`save-state save-state--${saveState}`} aria-live="polite">
          {saveState === 'saving'
            ? 'Encrypting…'
            : saveState === 'error'
              ? 'Save failed'
              : 'Saved locally'}
        </span>
        <button className="button button--quiet" onClick={onLock}>
          Lock
        </button>
      </div>
    </header>
  )
}
