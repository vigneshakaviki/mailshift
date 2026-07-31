# Security policy

## Product boundary

Mailshift is a local migration planner. It does not connect to mailboxes,
collect passwords, automate account logins, or send inventory to a backend.

Workspace data is encrypted in browser storage with AES-256-GCM. A key is
derived from the user's passphrase with PBKDF2-SHA-256 (310,000 iterations).
The key remains in memory only while the workspace is unlocked.

This protects data at rest, but it cannot protect against a compromised
browser, malicious extensions, device malware, or JavaScript modified at the
hosting layer. Use a trusted device and deployment.

## Reporting a vulnerability

Please use GitHub's private vulnerability reporting for this repository. Do
not include real credentials, recovery codes, private account inventories, or
other sensitive personal data in a report.
