import { describe, expect, it } from 'vitest'
import exampleCsv from '../../examples/gmail-to-proton.csv?raw'
import { parseSafeCsv } from '../lib/csv'
import { PLAYBOOKS, findPlaybook } from './playbooks'

describe('playbook catalog', () => {
  it('contains 100 playbooks', () => {
    expect(PLAYBOOKS).toHaveLength(100)
  })

  it('maps common domains to playbooks', () => {
    expect(findPlaybook('github.com')?.id).toBe('github')
    expect(findPlaybook('accounts.nintendo.com')?.id).toBe('nintendo')
    expect(findPlaybook('login.yahoo.com')?.id).toBe('yahoo')
    expect(findPlaybook('console.aws.amazon.com')?.id).toBe('aws')
    expect(findPlaybook('secure.ssa.gov')?.id).toBe('social-security')
  })

  it('uses the most specific supported parent domain', () => {
    expect(findPlaybook('amazon.com')?.id).toBe('amazon')
    expect(findPlaybook('console.aws.amazon.com')?.id).toBe('aws')
  })

  it('covers every service in the bundled migration example', () => {
    const accounts = parseSafeCsv(exampleCsv)
    expect(accounts).toHaveLength(30)
    expect(accounts.every((account) => account.playbookId)).toBe(true)
  })
})
