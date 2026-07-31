import { useState, type FormEvent } from 'react'
import { findPlaybook } from '../data/playbooks'
import { CATEGORIES, type Account, type Category } from '../types'
import { createAccount, normalizeDomain } from '../lib/workspace'

interface AddAccountFormProps {
  onAdd: (account: Account) => void
}

export function AddAccountForm({ onAdd }: AddAccountFormProps) {
  const [name, setName] = useState('')
  const [domain, setDomain] = useState('')
  const [category, setCategory] = useState<Category>('other')

  function submit(event: FormEvent) {
    event.preventDefault()
    const normalized = normalizeDomain(domain)
    if (!normalized) return
    const playbook = findPlaybook(normalized)
    onAdd(
      createAccount({
        name: name.trim() || playbook?.name || normalized,
        domain: normalized,
        category: playbook?.category ?? category,
        source: 'manual',
        playbookId: playbook?.id,
      }),
    )
    setName('')
    setDomain('')
    setCategory('other')
  }

  return (
    <form className="add-form" onSubmit={submit}>
      <label>
        Service name
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="GitHub"
        />
      </label>
      <label>
        Domain or URL
        <input
          value={domain}
          onChange={(event) => setDomain(event.target.value)}
          placeholder="github.com"
          required
        />
      </label>
      <label>
        Category
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value as Category)}
        >
          {CATEGORIES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>
      <button className="button button--primary">Add account</button>
    </form>
  )
}
