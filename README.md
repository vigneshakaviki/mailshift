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
git clone https://github.com/vigneshakaviki/mailshift.git
cd mailshift
npm ci
npm run dev -- --host 127.0.0.1
```

Open `http://127.0.0.1:5173`. On macOS:

```bash
open http://127.0.0.1:5173
```

Create a passphrase of at least 12 characters. There is no passphrase
recovery.

### Load the realistic example

Import-ready dataset:
[`examples/gmail-to-proton.csv`](examples/gmail-to-proton.csv). It contains 30
real services across identity, finance, government, health, security, work,
shopping, social, and entertainment categories. All account data is fictional;
file contains no usernames, email addresses, passwords, or recovery secrets.

Inside Mailshift:

1. Create encrypted workspace.
2. Set migration route, for example `maya.old@gmail.com` →
   `maya@proton.me`.
3. Open **Accounts**.
4. Select **Select safe CSV**.
5. Choose `mailshift/examples/gmail-to-proton.csv`.
6. Confirm `30 accounts added`.

To print exact file path before choosing it:

```bash
pwd
ls -lh examples/gmail-to-proton.csv
```

Mailshift imports through browser UI so data enters encrypted workspace.
Allowed headers are `name`, `title`, `domain`, `url`, `website`, and
`category`. Native password-manager exports usually contain credential columns
and will be rejected; create a redacted URL-only copy first.

### Run production build locally

```bash
npm run build
npm run preview -- --host 127.0.0.1
```

Open `http://127.0.0.1:4173`.

## Real example: moving from Gmail to Proton

Maya has used `maya.old@gmail.com` for 12 years. She wants to close that
dependency before October 31 and use `maya@proton.me` everywhere. Her password
manager contains more than 200 entries. Importable example contains 30
high-impact accounts:

[`examples/gmail-to-proton.csv`](examples/gmail-to-proton.csv)

This file contains service names and domains only. It deliberately excludes
email addresses, usernames, passwords, one-time codes, and notes. Mailshift
rejects the whole import if it detects one of those columns.

### 1. Set the route

After creating an encrypted vault, Maya enters:

```text
Address being retired: maya.old@gmail.com
Destination address:   maya@proton.me
Shutdown date:         2026-10-31
```

Those addresses stay inside the encrypted local workspace. They are not
included in the completion report.

### 2. Work from risk, not alphabetically

Mailshift deduplicates domains and builds this approximate queue:

1. Apple, Google, and Microsoft — identity roots.
2. Chase, Coinbase, PayPal, and Wise — money and payment recovery.
3. HealthCare.gov, IRS, and Social Security — government identity.
4. CVS Health and Walgreens — health records and prescriptions.
5. 1Password and Bitwarden — security infrastructure.
6. AWS, Dropbox, GitHub, GitLab, Slack, and Zoom — work identity.
7. Shopping, social, and entertainment services — lower-risk accounts.

If Chase becomes blocked while support reviews the request, setting its status
to `blocked` keeps it near the top. Completed and intentionally retained
accounts move out of the active queue.

### 3. Migrate one service safely

For GitHub, Mailshift links to GitHub's official email settings and presents a
reviewed sequence:

1. Add the new email address.
2. Verify it from the Proton inbox.
3. Make it the primary address.
4. Review notification and backup-email settings.
5. Check commit attribution before removing the Gmail address.

Maya then uses the verification gates:

```text
[x] Primary address changed
[x] Recovery path updated
[x] Independent login added
[x] New address verified
[x] Fresh login tested in a private window
[ ] Old address removed
```

She leaves the old address connected until a fresh login succeeds. Mailshift
marks the account `verified` after the core address, recovery, verification,
and fresh-login gates pass; old-address removal remains separately tracked.

### 4. Handle a service without a playbook

CVS Health has no reviewed guide in starter directory. Maya opens its official
support channel and uses Mailshift's neutral support-request template:

```text
Subject: Request to update the email address on my CVS Health account

Hello CVS Health support,

I am retiring the email address currently associated with my account and need
to replace it with a new address while preserving my account data, purchases,
and access.

Please direct me to your official email-change process and tell me which
non-secret information is required to verify account ownership. I will not
send my password, one-time codes, recovery codes, or full payment details by
email.
```

Mailshift copies this text but never sends it.

### 5. Save proof and recovery data

At the end of a session, Maya downloads:

- `mailshift-backup-2026-08-04.json` — encrypted, restorable with her existing
  vault passphrase.
- `mailshift-report-2026-08-04.csv` — plaintext progress record without email
  addresses or private notes.

Example report rows:

```csv
"service","domain","category","status","address_changed","recovery_updated","alternate_login_added","new_address_verified","login_retested","old_address_removed"
"GitHub","github.com","work","verified","true","true","true","true","true","false"
"Chase","chase.com","finance","blocked","false","true","false","false","false","false"
```

The result is not an automated provider transfer. It is a controlled record of
what changed, what was tested, and which old-email dependencies remain.

## Status guide

| Status | Use when |
| --- | --- |
| `not started` | Service is known but untouched. |
| `in progress` | Settings changed but verification is incomplete. |
| `waiting` | Confirmation email or support response is pending. |
| `blocked` | Service prevents migration or needs intervention. |
| `verified` | New login and recovery path were tested successfully. |
| `retained` | Old address remains intentionally attached. |

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
