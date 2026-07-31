import { describe, expect, it } from 'vitest'
import {
  completionPercent,
  createAccount,
  daysUntil,
  mergeAccounts,
  normalizeDomain,
  sortByPriority,
} from './workspace'

describe('workspace utilities', () => {
  it('normalizes URLs into account domains', () => {
    expect(normalizeDomain(' https://www.GitHub.com/settings/emails ')).toBe(
      'github.com',
    )
    expect(normalizeDomain('accounts.google.com')).toBe('accounts.google.com')
  })

  it('prioritizes critical unfinished accounts', () => {
    const social = createAccount({
      name: 'Social',
      domain: 'social.example',
      category: 'social',
      source: 'manual',
    })
    const bank = createAccount({
      name: 'Bank',
      domain: 'bank.example',
      category: 'finance',
      source: 'manual',
    })

    expect(sortByPriority([social, bank]).map((account) => account.name)).toEqual([
      'Bank',
      'Social',
    ])
  })

  it('deduplicates imports by normalized domain', () => {
    const existing = createAccount({
      name: 'GitHub',
      domain: 'github.com',
      category: 'work',
      source: 'manual',
    })
    const duplicate = createAccount({
      name: 'Duplicate',
      domain: 'https://www.github.com/login',
      category: 'work',
      source: 'safe_csv',
    })

    expect(mergeAccounts([existing], [duplicate])).toMatchObject({
      added: 0,
      skipped: 1,
      accounts: [existing],
    })
  })

  it('calculates completion and inclusive deadline days', () => {
    const complete = createAccount({
      name: 'Complete',
      domain: 'complete.example',
      category: 'other',
      source: 'manual',
    })
    complete.status = 'verified'
    const pending = createAccount({
      name: 'Pending',
      domain: 'pending.example',
      category: 'other',
      source: 'manual',
    })

    expect(completionPercent([complete, pending])).toBe(50)
    expect(daysUntil('2026-08-02', new Date('2026-07-31T12:00:00'))).toBe(3)
  })
})
