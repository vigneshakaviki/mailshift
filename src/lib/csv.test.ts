import { describe, expect, it } from 'vitest'
import gmailToProtonCsv from '../../examples/gmail-to-proton.csv?raw'
import { parseSafeCsv } from './csv'

describe('safe CSV import', () => {
  it('imports names, URLs, and supported categories', () => {
    const accounts = parseSafeCsv(
      'name,url,category\nGitHub,https://github.com/settings,work\nBank,bank.example,finance',
    )

    expect(accounts).toHaveLength(2)
    expect(accounts[0]).toMatchObject({
      name: 'GitHub',
      domain: 'github.com',
      category: 'work',
      source: 'safe_csv',
      playbookId: 'github',
    })
    expect(accounts[1]).toMatchObject({
      name: 'Bank',
      domain: 'bank.example',
      category: 'finance',
    })
  })

  it('supports quoted fields and commas', () => {
    const [account] = parseSafeCsv(
      'title,website\n"Example, Inc.","https://www.example.com/account"',
    )

    expect(account).toMatchObject({
      name: 'Example, Inc.',
      domain: 'example.com',
    })
  })

  it.each(['password', 'username', 'email', 'recovery_code', 'otp'])(
    'rejects a %s column',
    (unsafeHeader) => {
      expect(() =>
        parseSafeCsv(`name,domain,${unsafeHeader}\nExample,example.com,value`),
      ).toThrow(/Import blocked/)
    },
  )

  it('rejects unknown columns rather than silently importing them', () => {
    expect(() =>
      parseSafeCsv('name,domain,unexpected\nExample,example.com,value'),
    ).toThrow(/unsupported column/)
  })

  it('imports the complete Gmail-to-Proton example without duplicates', () => {
    const accounts = parseSafeCsv(gmailToProtonCsv)
    const domains = new Set(accounts.map((account) => account.domain))

    expect(accounts).toHaveLength(30)
    expect(domains.size).toBe(30)
    expect(accounts.find((account) => account.domain === 'github.com')).toMatchObject(
      {
        playbookId: 'github',
        category: 'work',
      },
    )
  })
})
