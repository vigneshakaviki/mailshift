# Mailshift

Private, local-first account and email migration tracker.

Changing an email address is not only a mailbox move. The old address can be a
login identifier, recovery channel, security-notification route, or federated
identity for dozens of services. Mailshift turns that hidden dependency graph
into a prioritized, verifiable migration plan.

## What it does

- Builds an account inventory manually or from a strict URL-only CSV.
- Rejects credential-bearing import columns such as password, username, email,
  OTP, secret, recovery code, and notes.
- Prioritizes identity, finance, government, health, and security accounts.
- Tracks login, recovery, verification, and clean-up gates for every service.
- Includes source-linked playbooks for common services.
- Copies a neutral support-request template without including credentials.
- Stores the workspace in an AES-256-GCM encrypted browser vault.
- Exports a restorable encrypted backup and a credential-free completion CSV.

Mailshift has no backend, analytics, mailbox connection, automated login, or
credential custody.

## Quick start

Requires Node.js 22 or newer.

```bash
npm install
npm run dev
```

Open the local URL shown by Vite. Create a passphrase of at least 12
characters. There is no passphrase recovery.

For a safe import, start with [`examples/accounts.csv`](examples/accounts.csv).
Allowed headers are `name`, `title`, `domain`, `url`, `website`, and
`category`.

## Development

```bash
npm run check
npm run build
```

`npm run check` runs ESLint, unit tests, TypeScript, and the production build.

## Privacy and threat model

The encrypted vault is stored in browser `localStorage`. PBKDF2-SHA-256 derives
the encryption key from the passphrase using 310,000 iterations; AES-256-GCM
provides authenticated encryption. The key is held in memory only while the
app is unlocked.

This protects a closed browser's stored workspace. It does not protect against
a compromised device, browser extension, active cross-site scripting, weak
passphrases, or a malicious deployment. Prefer a trusted local build, keep
encrypted backups, and never put passwords or recovery codes in notes.

See [`SECURITY.md`](SECURITY.md) for the reporting policy.

## Why this shape

Email providers can forward messages, but they cannot safely rewrite identity
and recovery settings across unrelated services. Fully automating that process
would require high-risk credential or session access and would break whenever
services change their flows. Mailshift keeps the user in control: official
settings open in a separate tab, and completion requires a fresh login test.

## Roadmap

- Community-reviewed service playbooks with freshness checks.
- Optional encrypted file storage via the File System Access API.
- Offline install support with an auditable service worker.
- Organization mode for domain shutdowns without exposing employee inventory.

## License

MIT
