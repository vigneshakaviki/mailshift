import { useCallback, useEffect, useRef, useState } from 'react'
import { AccountDetail } from './components/AccountDetail'
import { AccountList } from './components/AccountList'
import { AppHeader, type View } from './components/AppHeader'
import { Dashboard } from './components/Dashboard'
import { PlaybookLibrary } from './components/PlaybookLibrary'
import { SafetyPanel } from './components/SafetyPanel'
import { UnlockScreen } from './components/UnlockScreen'
import { PLAYBOOKS } from './data/playbooks'
import {
  createVault,
  encryptWorkspace,
  envelopeSalt,
  unlockVault,
} from './lib/crypto'
import {
  deleteEnvelope,
  parseEnvelope,
  readEnvelope,
  writeEnvelope,
} from './lib/storage'
import {
  createEmptyWorkspace,
  mergeAccounts,
} from './lib/workspace'
import type {
  Account,
  EncryptedEnvelope,
  MigrationProfile,
  Workspace,
} from './types'

function downloadFile(contents: BlobPart, filename: string, type: string) {
  const url = URL.createObjectURL(new Blob([contents], { type }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.append(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 0)
}

function csvCell(value: string | boolean): string {
  const text = String(value)
  return `"${text.replaceAll('"', '""')}"`
}

export default function App() {
  const [envelope, setEnvelope] = useState<EncryptedEnvelope | null>(() =>
    readEnvelope(),
  )
  const [workspace, setWorkspace] = useState<Workspace | null>(null)
  const [key, setKey] = useState<CryptoKey | null>(null)
  const [view, setView] = useState<View>('dashboard')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [unlockError, setUnlockError] = useState('')
  const [saveState, setSaveState] = useState<'saved' | 'saving' | 'error'>(
    'saved',
  )
  const saltRef = useRef<Uint8Array<ArrayBuffer> | null>(null)
  const saveRevision = useRef(0)

  useEffect(() => {
    if (!workspace || !key || !saltRef.current) return
    const revision = ++saveRevision.current
    setSaveState('saving')

    const timer = window.setTimeout(async () => {
      try {
        const nextEnvelope = await encryptWorkspace(
          workspace,
          key,
          saltRef.current!,
        )
        if (revision !== saveRevision.current) return
        writeEnvelope(nextEnvelope)
        setEnvelope(nextEnvelope)
        setSaveState('saved')
      } catch {
        if (revision === saveRevision.current) setSaveState('error')
      }
    }, 350)

    return () => window.clearTimeout(timer)
  }, [key, workspace])

  async function create(passphrase: string) {
    setBusy(true)
    setUnlockError('')
    try {
      const initialWorkspace = createEmptyWorkspace()
      const created = await createVault(passphrase, initialWorkspace)
      writeEnvelope(created.envelope)
      saltRef.current = envelopeSalt(created.envelope)
      setEnvelope(created.envelope)
      setKey(created.key)
      setWorkspace(initialWorkspace)
    } catch {
      setUnlockError('Could not create encrypted vault.')
    } finally {
      setBusy(false)
    }
  }

  async function unlock(passphrase: string) {
    if (!envelope) return
    setBusy(true)
    setUnlockError('')
    try {
      const unlocked = await unlockVault(passphrase, envelope)
      saltRef.current = envelopeSalt(envelope)
      setKey(unlocked.key)
      setWorkspace(unlocked.workspace)
    } catch {
      setUnlockError('Wrong passphrase or damaged vault.')
    } finally {
      setBusy(false)
    }
  }

  async function importBackup(contents: string) {
    const imported = parseEnvelope(JSON.parse(contents))
    writeEnvelope(imported)
    setEnvelope(imported)
    setUnlockError('')
  }

  function resetVault() {
    deleteEnvelope()
    saltRef.current = null
    setSelectedId(null)
    setWorkspace(null)
    setKey(null)
    setEnvelope(null)
    setView('dashboard')
    setUnlockError('')
  }

  const updateWorkspace = useCallback(
    (updater: (current: Workspace) => Workspace) => {
      setWorkspace((current) => {
        if (!current) return current
        return {
          ...updater(current),
          updatedAt: new Date().toISOString(),
        }
      })
    },
    [],
  )

  const updateAccount = useCallback(
    (account: Account) => {
      updateWorkspace((current) => ({
        ...current,
        accounts: current.accounts.map((item) =>
          item.id === account.id ? account : item,
        ),
      }))
    },
    [updateWorkspace],
  )

  const closeDetail = useCallback(() => setSelectedId(null), [])

  if (!workspace || !key) {
    return (
      <UnlockScreen
        hasVault={Boolean(envelope)}
        busy={busy}
        error={unlockError}
        onCreate={create}
        onUnlock={unlock}
        onImportBackup={importBackup}
        onResetVault={resetVault}
      />
    )
  }

  const activeWorkspace = workspace
  const activeKey = key
  const selectedAccount = activeWorkspace.accounts.find(
    (account) => account.id === selectedId,
  )
  const selectedPlaybook = selectedAccount?.playbookId
    ? PLAYBOOKS.find((playbook) => playbook.id === selectedAccount.playbookId)
    : undefined

  function addAccount(account: Account) {
    updateWorkspace((current) => {
      const result = mergeAccounts(current.accounts, [account])
      return { ...current, accounts: result.accounts }
    })
  }

  function importAccounts(accounts: Account[]) {
    const merged = mergeAccounts(activeWorkspace.accounts, accounts)
    updateWorkspace((current) => ({ ...current, accounts: merged.accounts }))
    return { added: merged.added, skipped: merged.skipped }
  }

  function updateProfile(profile: MigrationProfile) {
    updateWorkspace((current) => ({ ...current, profile }))
  }

  async function exportBackup() {
    if (!saltRef.current) return
    const latest = await encryptWorkspace(
      activeWorkspace,
      activeKey,
      saltRef.current,
    )
    writeEnvelope(latest)
    setEnvelope(latest)
    downloadFile(
      JSON.stringify(latest, null, 2),
      `mailshift-backup-${new Date().toISOString().slice(0, 10)}.json`,
      'application/json',
    )
  }

  function exportReport() {
    const header = [
      'service',
      'domain',
      'category',
      'status',
      'address_changed',
      'recovery_updated',
      'alternate_login_added',
      'new_address_verified',
      'login_retested',
      'old_address_removed',
    ]
    const rows = activeWorkspace.accounts.map((account) => [
      account.name,
      account.domain,
      account.category,
      account.status,
      account.checklist.addressChanged,
      account.checklist.recoveryUpdated,
      account.checklist.alternateLoginAdded,
      account.checklist.newAddressVerified,
      account.checklist.loginRetested,
      account.checklist.oldAddressRemoved,
    ])
    const csv = [header, ...rows]
      .map((row) => row.map(csvCell).join(','))
      .join('\n')
    downloadFile(
      csv,
      `mailshift-report-${new Date().toISOString().slice(0, 10)}.csv`,
      'text/csv;charset=utf-8',
    )
  }

  function deleteVault() {
    deleteEnvelope()
    saltRef.current = null
    setSelectedId(null)
    setWorkspace(null)
    setKey(null)
    setEnvelope(null)
    setView('dashboard')
  }

  return (
    <>
      <AppHeader
        view={view}
        saveState={saveState}
        onNavigate={setView}
        onLock={() => {
          saveRevision.current += 1
          saltRef.current = null
          setSelectedId(null)
          setWorkspace(null)
          setKey(null)
        }}
      />
      <main className="app-main">
        {view === 'dashboard' ? (
          <Dashboard
            profile={workspace.profile}
            accounts={workspace.accounts}
            onProfileChange={updateProfile}
            onOpenAccount={(account) => setSelectedId(account.id)}
            onShowAccounts={() => setView('accounts')}
          />
        ) : null}
        {view === 'accounts' ? (
          <AccountList
            accounts={workspace.accounts}
            onAdd={addAccount}
            onImport={importAccounts}
            onOpen={(account) => setSelectedId(account.id)}
          />
        ) : null}
        {view === 'playbooks' ? <PlaybookLibrary /> : null}
        {view === 'safety' ? (
          <SafetyPanel
            onExportBackup={exportBackup}
            onExportReport={exportReport}
            onDeleteVault={deleteVault}
          />
        ) : null}
      </main>

      {selectedAccount ? (
        <AccountDetail
          account={selectedAccount}
          playbook={selectedPlaybook}
          onChange={updateAccount}
          onDelete={(account) => {
            updateWorkspace((current) => ({
              ...current,
              accounts: current.accounts.filter((item) => item.id !== account.id),
            }))
            setSelectedId(null)
          }}
          onClose={closeDetail}
        />
      ) : null}
    </>
  )
}
