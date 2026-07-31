import type { MigrationProfile } from '../types'

interface ProfileCardProps {
  profile: MigrationProfile
  onChange: (profile: MigrationProfile) => void
}

export function ProfileCard({ profile, onChange }: ProfileCardProps) {
  return (
    <section className="card profile-card" aria-labelledby="profile-heading">
      <div className="section-heading">
        <div>
          <p className="step-label">Migration route</p>
          <h2 id="profile-heading">Address handoff</h2>
        </div>
        <span className="local-chip">Encrypted</span>
      </div>

      <div className="route-grid">
        <label>
          Address being retired
          <input
            type="email"
            value={profile.oldEmail}
            placeholder="you@old-domain.edu"
            onChange={(event) =>
              onChange({ ...profile, oldEmail: event.target.value })
            }
          />
        </label>
        <span className="route-arrow" aria-hidden="true">
          →
        </span>
        <label>
          Destination address
          <input
            type="email"
            value={profile.newEmail}
            placeholder="you@your-domain.com"
            onChange={(event) =>
              onChange({ ...profile, newEmail: event.target.value })
            }
          />
        </label>
      </div>

      <label className="deadline-field">
        Old-address shutdown date
        <input
          type="date"
          value={profile.deadline}
          onChange={(event) =>
            onChange({ ...profile, deadline: event.target.value })
          }
        />
      </label>
    </section>
  )
}
