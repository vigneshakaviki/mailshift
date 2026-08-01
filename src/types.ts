export const CATEGORIES = [
  'identity',
  'finance',
  'health',
  'government',
  'security',
  'work',
  'shopping',
  'social',
  'entertainment',
  'other',
] as const

export const STATUSES = [
  'not_started',
  'in_progress',
  'waiting',
  'blocked',
  'verified',
  'retained',
] as const

export type Category = (typeof CATEGORIES)[number]
export type MigrationStatus = (typeof STATUSES)[number]

export type MigrationMethod =
  | 'direct_edit'
  | 'add_verify_promote_remove'
  | 'trusted_device'
  | 'support_assisted'
  | 'recreate'
  | 'unknown'

export interface Checklist {
  addressChanged: boolean
  recoveryUpdated: boolean
  alternateLoginAdded: boolean
  newAddressVerified: boolean
  loginRetested: boolean
  oldAddressRemoved: boolean
}

export interface Account {
  id: string
  name: string
  domain: string
  category: Category
  status: MigrationStatus
  source: 'manual' | 'safe_csv'
  playbookId?: string
  notes: string
  recheckAt?: string
  historicalRetention?: 'unknown'
  checklist: Checklist
  createdAt: string
  updatedAt: string
}

export interface MigrationProfile {
  oldEmail: string
  newEmail: string
  deadline: string
}

export interface Workspace {
  version: 1
  profile: MigrationProfile
  accounts: Account[]
  lastBackupAt?: string
  createdAt: string
  updatedAt: string
}

export interface Playbook {
  id: string
  name: string
  domains: string[]
  category: Category
  method: MigrationMethod
  settingsUrl: string
  sourceUrl: string
  lastVerified: string
  oldInboxRequired: boolean
  summary: string
  steps: string[]
}

export interface EncryptedEnvelope {
  version: 1
  algorithm: 'AES-GCM'
  kdf: 'PBKDF2-SHA-256'
  iterations: number
  salt: string
  iv: string
  ciphertext: string
}
