import { findKnownSite } from '../data/knownSites'
import { findPlaybook } from '../data/playbooks'
import type { Account, Category } from '../types'
import { CATEGORIES } from '../types'
import { createAccount, normalizeDomain } from './workspace'

const ALLOWED_HEADERS = new Set([
  'name',
  'title',
  'domain',
  'url',
  'website',
  'category',
])

const CREDENTIAL_HEADERS = new Set([
  'password',
  'pass',
  'passwd',
  'otp',
  'totp',
  'secret',
  'secretkey',
  'privatekey',
  'pin',
  'cvc',
  'cvv',
  'card',
  'passkey',
  'recoverycode',
  'notes',
  'username',
  'email',
])

function normalizeHeader(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]/g, '')
}

function parseRows(input: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let quoted = false

  for (let index = 0; index < input.length; index += 1) {
    const character = input[index]
    const next = input[index + 1]

    if (character === '"' && quoted && next === '"') {
      field += '"'
      index += 1
    } else if (character === '"') {
      quoted = !quoted
    } else if (character === ',' && !quoted) {
      row.push(field)
      field = ''
    } else if ((character === '\n' || character === '\r') && !quoted) {
      if (character === '\r' && next === '\n') index += 1
      row.push(field)
      if (row.some((cell) => cell.trim())) rows.push(row)
      row = []
      field = ''
    } else {
      field += character
    }
  }

  row.push(field)
  if (row.some((cell) => cell.trim())) rows.push(row)
  return rows
}

export function parseSafeCsv(input: string): Account[] {
  const rows = parseRows(input)
  const headerRow = rows[0]
  if (!headerRow) throw new Error('CSV is empty.')

  const headers = headerRow.map(normalizeHeader)
  const credentialHeader = headers.find((header) =>
    CREDENTIAL_HEADERS.has(header),
  )
  if (credentialHeader) {
    throw new Error(
      `Import blocked: "${credentialHeader}" may contain credentials or personal data. Use URL-only CSV.`,
    )
  }

  const unknownHeader = headers.find(
    (header) => header && !ALLOWED_HEADERS.has(header),
  )
  if (unknownHeader) {
    throw new Error(
      `Import blocked: unsupported column "${unknownHeader}". Allowed: name, title, domain, url, website, category.`,
    )
  }

  const nameIndex = headers.findIndex((header) =>
    ['name', 'title'].includes(header),
  )
  const domainIndex = headers.findIndex((header) =>
    ['domain', 'url', 'website'].includes(header),
  )
  const categoryIndex = headers.indexOf('category')

  if (domainIndex < 0) {
    throw new Error('CSV needs a domain, url, or website column.')
  }

  const accounts: Account[] = []
  for (const row of rows.slice(1)) {
    const domain = normalizeDomain(row[domainIndex] ?? '')
    if (!domain) continue
    const playbook = findPlaybook(domain)
    const knownSite = findKnownSite(domain)
    const requestedCategory = row[categoryIndex]?.trim().toLowerCase()
    const category: Category =
      requestedCategory &&
      CATEGORIES.includes(requestedCategory as Category)
        ? (requestedCategory as Category)
        : (playbook?.category ?? 'other')

    accounts.push(
      createAccount({
        name: row[nameIndex]?.trim() || playbook?.name || knownSite?.name || domain,
        domain,
        category,
        source: 'safe_csv',
        playbookId: playbook?.id,
      }),
    )
  }

  if (accounts.length === 0) {
    throw new Error('No valid account domains found.')
  }

  return accounts
}
