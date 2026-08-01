import { writeFile } from 'node:fs/promises'

const CATALOG_LIMIT = 5_000
const METADATA_URL = 'https://tranco-list.eu/api/lists/date/latest'
const OUTPUT_URL = new URL('../src/data/popular-domains.txt', import.meta.url)
const DOMAIN_PATTERN = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9-]{2,63}$/

async function readTopDomains(response, limit) {
  if (!response.body) throw new Error('Tranco response has no body.')

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  const domains = []
  const seen = new Set()
  let buffer = ''

  while (domains.length < limit) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split(/\r?\n/)
    buffer = lines.pop() ?? ''

    for (const line of lines) {
      const comma = line.indexOf(',')
      const domain = comma >= 0 ? line.slice(comma + 1).trim().toLowerCase() : ''
      if (!DOMAIN_PATTERN.test(domain) || seen.has(domain)) continue
      seen.add(domain)
      domains.push(domain)
      if (domains.length === limit) break
    }
  }

  await reader.cancel()
  return domains
}

const metadataResponse = await fetch(METADATA_URL)
if (!metadataResponse.ok) {
  throw new Error(`Tranco metadata request failed: ${metadataResponse.status}`)
}

const metadata = await metadataResponse.json()
if (!metadata.available || typeof metadata.download !== 'string') {
  throw new Error('Latest Tranco list is unavailable.')
}

const listResponse = await fetch(metadata.download)
if (!listResponse.ok) {
  throw new Error(`Tranco list request failed: ${listResponse.status}`)
}

const domains = await readTopDomains(listResponse, CATALOG_LIMIT)
if (domains.length !== CATALOG_LIMIT || new Set(domains).size !== CATALOG_LIMIT) {
  throw new Error(`Expected ${CATALOG_LIMIT} unique domains; received ${domains.length}.`)
}

const createdOn = String(metadata.created_on).slice(0, 10)
const header = [
  `# Generated from Tranco list ${metadata.list_id}`,
  `# Snapshot ${createdOn}`,
  `# Source ${metadata.download}`,
]

await writeFile(OUTPUT_URL, `${[...header, ...domains].join('\n')}\n`, 'utf8')
console.log(`Wrote ${domains.length} domains from Tranco ${metadata.list_id} (${createdOn}).`)
