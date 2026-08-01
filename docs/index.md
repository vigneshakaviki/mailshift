# Docs Index

Start here:

- [README](../README.md)
- [Machine-readable index](../llms.txt)
- [Project website](https://vigneshakaviki.github.io/mailshift/)
- [Browser app](https://vigneshakaviki.github.io/mailshift/app/)
- [Account migration guide](https://vigneshakaviki.github.io/mailshift/blog/move-identities-not-only-mail/)

Core implementation:

- [Main app](../src/App.tsx)
- [Unlock screen](../src/components/UnlockScreen.tsx)
- [Dashboard](../src/components/Dashboard.tsx)
- [Account list](../src/components/AccountList.tsx)
- [Account detail](../src/components/AccountDetail.tsx)
- [Playbook library](../src/components/PlaybookLibrary.tsx)

Data and logic:

- [Playbooks](../src/data/playbooks.ts)
- [Popular site catalog](../src/data/popular-domains.txt)
- [Catalog updater](../scripts/update-site-catalog.mjs)
- [CSV parser](../src/lib/csv.ts)
- [Workspace model](../src/lib/workspace.ts)
- [Encrypted vault](../src/lib/crypto.ts)
- [Local storage](../src/lib/storage.ts)

Examples:

- [Gmail to Proton sample CSV](../examples/gmail-to-proton.csv)

Commands:

```bash
npm ci
npm run dev -- --host 127.0.0.1
npm run update:sites
npm run check
npm run build
npm run preview -- --host 127.0.0.1
```
