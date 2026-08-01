import { describe, expect, it } from 'vitest'
import {
  findKnownSite,
  KNOWN_SITE_COUNT,
  searchKnownSites,
} from './knownSites'

describe('popular site catalog', () => {
  it('contains 5,000 ranked domains', () => {
    expect(KNOWN_SITE_COUNT).toBe(5_000)
  })

  it('recognizes exact domains and subdomains', () => {
    expect(findKnownSite('wikipedia.org')).toMatchObject({
      domain: 'wikipedia.org',
      name: 'Wikipedia',
    })
    expect(findKnownSite('en.wikipedia.org')?.domain).toBe('wikipedia.org')
  })

  it('does not claim unknown domains are cataloged', () => {
    expect(findKnownSite('not-a-real-mailshift-site.invalid')).toBeUndefined()
  })

  it('searches without rendering the complete catalog', () => {
    const matches = searchKnownSites('wikipedia', 5)
    expect(matches).toContainEqual({
      domain: 'wikipedia.org',
      name: 'Wikipedia',
    })
    expect(matches.length).toBeLessThanOrEqual(5)
  })
})
