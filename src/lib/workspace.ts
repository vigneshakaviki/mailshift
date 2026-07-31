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

export function priorityScore(account: Account): number {
  return CATEGORY_PRIORITY[account.category] + STATUS_WEIGHT[account.status]
}

export function sortByPriority(accounts: Account[]): Account[] {
  return [...accounts].sort((left, right) => {
    const scoreDifference = priorityScore(right) - priorityScore(left)
    if (scoreDifference !== 0) return scoreDifference
    return left.name.localeCompare(right.name)
  })
}

export function completionPercent(accounts: Account[]): number {
  if (accounts.length === 0) return 0
  const complete = accounts.filter((account) =>
    ['verified', 'retained'].includes(account.status),
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
