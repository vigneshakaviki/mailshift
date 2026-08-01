import popularDomainsText from './popular-domains.txt?raw'

export interface KnownSite {
  domain: string
  name: string
}

const POPULAR_DOMAINS = popularDomainsText
  .split(/\r?\n/)
  .filter((line) => line && !line.startsWith('#'))

const popularDomainSet = new Set(POPULAR_DOMAINS)
const knownSiteCache = new Map<string, KnownSite | undefined>()

export const KNOWN_SITE_COUNT = POPULAR_DOMAINS.length

function displayName(domain: string): string {
  const label = domain.split('.')[0] ?? domain
  if (label.startsWith('xn--')) return domain

  return label
    .split('-')
    .filter(Boolean)
    .map((part) =>
      part.length <= 3
        ? part.toUpperCase()
        : `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`,
    )
    .join(' ')
}

function normalizedHostname(value: string): string {
  return value.trim().toLowerCase().replace(/^www\./, '').replace(/\.$/, '')
}

export function findKnownSite(domain: string): KnownSite | undefined {
  const normalized = normalizedHostname(domain)
  if (knownSiteCache.has(normalized)) return knownSiteCache.get(normalized)

  let candidate = normalized
  while (candidate.includes('.')) {
    if (popularDomainSet.has(candidate)) {
      const site = { domain: candidate, name: displayName(candidate) }
      knownSiteCache.set(normalized, site)
      return site
    }
    candidate = candidate.slice(candidate.indexOf('.') + 1)
  }

  knownSiteCache.set(normalized, undefined)
  return undefined
}

export function searchKnownSites(query: string, limit = 24): KnownSite[] {
  const normalized = normalizedHostname(query)
    .replace(/^https?:\/\//, '')
    .split('/')[0] ?? ''
  const compact = normalized.replace(/[^a-z0-9]/g, '')
  if (compact.length < 2 || limit < 1) return []

  const matches: KnownSite[] = []
  for (const domain of POPULAR_DOMAINS) {
    if (
      !domain.includes(normalized) &&
      !domain.replace(/[^a-z0-9]/g, '').includes(compact)
    ) {
      continue
    }

    matches.push({ domain, name: displayName(domain) })
    if (matches.length === limit) break
  }
  return matches
}
