import type {
  Account,
  Category,
  Checklist,
  MigrationStatus,
  Workspace,
} from '../types'

export const EMPTY_CHECKLIST: Checklist = {
  addressChanged: false,
  recoveryUpdated: false,
  alternateLoginAdded: false,
  newAddressVerified: false,
  loginRetested: false,
  oldAddressRemoved: false,
}

const CATEGORY_PRIORITY: Record<Category, number> = {
  identity: 100,
  finance: 95,
  government: 92,
  health: 90,
  security: 88,
  work: 70,
  shopping: 45,
  social: 40,
  other: 30,
  entertainment: 25,
}

const STATUS_WEIGHT: Record<MigrationStatus, number> = {
  blocked: 20,
  in_progress: 15,
  waiting: 10,
  not_started: 5,
  retained: -80,
  verified: -100,
}

const DAY_IN_MILLISECONDS = 86_400_000

export type BackupFreshness = 'never' | 'outdated' | 'stale' | 'current'

export function createEmptyWorkspace(): Workspace {
  const now = new Date().toISOString()
  return {
    version: 1,
    profile: {
      oldEmail: '',
      newEmail: '',
      deadline: '',
    },
    accounts: [],
    createdAt: now,
    updatedAt: now,
  }
}

export function createAccount(
  input: Pick<Account, 'name' | 'domain' | 'category' | 'source'> &
    Partial<Pick<Account, 'playbookId' | 'notes'>>,
): Account {
  const now = new Date().toISOString()
  return {
    id: crypto.randomUUID(),
    name: input.name.trim(),
    domain: normalizeDomain(input.domain),
    category: input.category,
    status: 'not_started',
    source: input.source,
    playbookId: input.playbookId,
    notes: input.notes ?? '',
    recheckAt: '',
    historicalRetention: 'unknown',
    checklist: { ...EMPTY_CHECKLIST },
    createdAt: now,
    updatedAt: now,
  }
}

export function normalizeDomain(value: string): string {
  const trimmed = value.trim().toLowerCase()
  if (!trimmed) return ''

  try {
    const candidate = trimmed.includes('://') ? trimmed : `https://${trimmed}`
    return new URL(candidate).hostname.replace(/^www\./, '')
  } catch {
    return trimmed
      .replace(/^https?:\/\//, '')
      .split('/')[0]
      ?.replace(/^www\./, '') ?? ''
  }
}

export function isRecheckDue(account: Account, now = new Date()): boolean {
  if (!account.recheckAt) return false
  const recheck = new Date(`${account.recheckAt}T00:00:00`)
  return !Number.isNaN(recheck.getTime()) && recheck.getTime() <= now.getTime()
}

export function scheduleRecheck(days: 30 | 90, now = new Date()): string {
  const recheck = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + days,
  )
  return [
    recheck.getFullYear(),
    String(recheck.getMonth() + 1).padStart(2, '0'),
    String(recheck.getDate()).padStart(2, '0'),
  ].join('-')
}

export function backupFreshness(
  workspace: Pick<Workspace, 'lastBackupAt' | 'updatedAt'>,
  now = new Date(),
): BackupFreshness {
  if (!workspace.lastBackupAt) return 'never'
  const lastBackup = new Date(workspace.lastBackupAt)
  const lastUpdate = new Date(workspace.updatedAt)
  if (Number.isNaN(lastBackup.getTime())) return 'never'
  if (
    !Number.isNaN(lastUpdate.getTime()) &&
    lastUpdate.getTime() > lastBackup.getTime()
  ) {
    return 'outdated'
  }
  return now.getTime() - lastBackup.getTime() > 30 * DAY_IN_MILLISECONDS
    ? 'stale'
    : 'current'
}

export function priorityScore(account: Account, now = new Date()): number {
  const recheckWeight = isRecheckDue(account, now) ? 150 : 0
  return (
    CATEGORY_PRIORITY[account.category] +
    STATUS_WEIGHT[account.status] +
    recheckWeight
  )
}

export function sortByPriority(accounts: Account[], now = new Date()): Account[] {
  return [...accounts].sort((left, right) => {
    const scoreDifference =
      priorityScore(right, now) - priorityScore(left, now)
    if (scoreDifference !== 0) return scoreDifference
    return left.name.localeCompare(right.name)
  })
}

export function completionPercent(accounts: Account[], now = new Date()): number {
  if (accounts.length === 0) return 0
  const complete = accounts.filter(
    (account) =>
      ['verified', 'retained'].includes(account.status) &&
      !isRecheckDue(account, now),
  ).length
  return Math.round((complete / accounts.length) * 100)
}

export function daysUntil(date: string, now = new Date()): number | null {
  if (!date) return null
  const deadline = new Date(`${date}T23:59:59`)
  if (Number.isNaN(deadline.getTime())) return null
  return Math.ceil((deadline.getTime() - now.getTime()) / 86_400_000)
}

export function mergeAccounts(
  existing: Account[],
  incoming: Account[],
): { accounts: Account[]; added: number; skipped: number } {
  const domains = new Set(existing.map((account) => account.domain))
  const additions: Account[] = []

  for (const account of incoming) {
    if (!account.domain || domains.has(account.domain)) continue
    domains.add(account.domain)
    additions.push(account)
  }

  return {
    accounts: [...existing, ...additions],
    added: additions.length,
    skipped: incoming.length - additions.length,
  }
}
