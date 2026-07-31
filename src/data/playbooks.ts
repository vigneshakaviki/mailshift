import type { Playbook } from '../types'

export const PLAYBOOKS: Playbook[] = [
  {
    id: 'apple',
    name: 'Apple Account',
    domains: ['apple.com', 'icloud.com'],
    category: 'identity',
    method: 'trusted_device',
    settingsUrl: 'https://account.apple.com/',
    sourceUrl: 'https://support.apple.com/en-us/109353',
    lastVerified: '2026-07-31',
    oldInboxRequired: false,
    summary:
      'Choose or add another primary address from a trusted device, then verify it.',
    steps: [
      'Open Sign-In & Security on a trusted Apple device.',
      'Add or choose the new primary email address.',
      'Complete verification on the new address.',
      'Confirm purchases, iCloud, Messages, and recovery still work.',
      'Review whether the old address should remain associated.',
    ],
  },
  {
    id: 'discord',
    name: 'Discord',
    domains: ['discord.com'],
    category: 'social',
    method: 'direct_edit',
    settingsUrl: 'https://discord.com/channels/@me',
    sourceUrl:
      'https://support.discord.com/hc/en-us/articles/4423385681175-How-to-Change-your-Discord-Account-s-Email',
    lastVerified: '2026-07-31',
    oldInboxRequired: true,
    summary:
      'Current inbox access is required. Discord support cannot change the address for you.',
    steps: [
      'Open User Settings, then My Account.',
      'Edit the current email address.',
      'Complete prompts using the current inbox.',
      'Verify the new address.',
      'Sign out and test the new login.',
    ],
  },
  {
    id: 'github',
    name: 'GitHub',
    domains: ['github.com'],
    category: 'work',
    method: 'add_verify_promote_remove',
    settingsUrl: 'https://github.com/settings/emails',
    sourceUrl:
      'https://docs.github.com/en/account-and-profile/how-tos/email-preferences/changing-your-primary-email-address',
    lastVerified: '2026-07-31',
    oldInboxRequired: false,
    summary:
      'Add and verify the new address before making it primary. Review commit attribution.',
    steps: [
      'Add the new email under Settings → Emails.',
      'Verify the new address.',
      'Select it as the primary email.',
      'Update notification and backup-email settings.',
      'Review Git commit email attribution before removing the old address.',
    ],
  },
  {
    id: 'google',
    name: 'Google Account & linked apps',
    domains: ['google.com', 'gmail.com'],
    category: 'identity',
    method: 'trusted_device',
    settingsUrl: 'https://myaccount.google.com/connections',
    sourceUrl: 'https://support.google.com/accounts/answer/13533235',
    lastVerified: '2026-07-31',
    oldInboxRequired: true,
    summary:
      'Inventory Sign in with Google connections. Add alternate credentials at each service before disconnecting.',
    steps: [
      'Review every linked app using Sign in with Google.',
      'At each service, add a password, passkey, or alternate sign-in method.',
      'Update contact and recovery addresses inside the service.',
      'Test alternate login in a private window.',
      'Only then remove the Google connection.',
    ],
  },
  {
    id: 'microsoft',
    name: 'Microsoft Account',
    domains: ['microsoft.com', 'live.com', 'outlook.com', 'hotmail.com'],
    category: 'identity',
    method: 'add_verify_promote_remove',
    settingsUrl: 'https://account.live.com/names/manage',
    sourceUrl:
      'https://support.microsoft.com/en-us/account-billing/change-the-email-address-or-phone-number-for-your-microsoft-account',
    lastVerified: '2026-07-31',
    oldInboxRequired: false,
    summary:
      'Microsoft treats account addresses as aliases. Add a new alias before changing the primary.',
    steps: [
      'Open Manage how you sign in to Microsoft.',
      'Add and verify the new email alias.',
      'Make the new alias primary.',
      'Review verification and recovery methods.',
      'Test Windows, Xbox, OneDrive, and Microsoft 365 access before removal.',
    ],
  },
  {
    id: 'netflix',
    name: 'Netflix',
    domains: ['netflix.com'],
    category: 'entertainment',
    method: 'direct_edit',
    settingsUrl: 'https://www.netflix.com/email',
    sourceUrl: 'https://help.netflix.com/en/node/134335',
    lastVerified: '2026-07-31',
    oldInboxRequired: false,
    summary:
      'Use the Change Email page. Netflix may ask for additional identity confirmation.',
    steps: [
      'Open the Netflix Change Email page.',
      'Enter the new address and complete identity confirmation.',
      'Check household-profile email addresses separately.',
      'Sign out and test the new login.',
    ],
  },
  {
    id: 'openai',
    name: 'OpenAI / ChatGPT',
    domains: ['openai.com', 'chatgpt.com'],
    category: 'work',
    method: 'direct_edit',
    settingsUrl: 'https://chatgpt.com/#settings/Account',
    sourceUrl:
      'https://help.openai.com/en/articles/7242619-how-can-i-change-the-email-associated-with-my-account',
    lastVerified: '2026-07-31',
    oldInboxRequired: false,
    summary:
      'Change the address from ChatGPT account settings. New address cannot belong to another active account.',
    steps: [
      'Open ChatGPT Settings → Account.',
      'Update and confirm the new email address.',
      'Verify ChatGPT and API Platform access.',
      'Review organization memberships and billing contacts.',
    ],
  },
  {
    id: 'paypal',
    name: 'PayPal',
    domains: ['paypal.com'],
    category: 'finance',
    method: 'add_verify_promote_remove',
    settingsUrl: 'https://www.paypal.com/myaccount/settings/',
    sourceUrl:
      'https://www.paypal.com/us/cshelp/article/how-do-i-add-remove-or-update-an-email-address-on-my-paypal-account-help135',
    lastVerified: '2026-07-31',
    oldInboxRequired: false,
    summary:
      'Add and verify the new address, make it primary, then remove the old address.',
    steps: [
      'Add the new address under Settings → Emails.',
      'Verify it from the new inbox.',
      'Make the new address primary.',
      'Review recovery phone and security settings.',
      'Remove the old address after testing login.',
    ],
  },
  {
    id: 'spotify',
    name: 'Spotify',
    domains: ['spotify.com'],
    category: 'entertainment',
    method: 'direct_edit',
    settingsUrl: 'https://www.spotify.com/account/profile/',
    sourceUrl: 'https://support.spotify.com/article/change-email-address/',
    lastVerified: '2026-07-31',
    oldInboxRequired: false,
    summary:
      'Edit the address from account profile and confirm with the current password.',
    steps: [
      'Open Edit personal info.',
      'Enter the new address.',
      'Confirm using the current password.',
      'Review Google, Apple, Facebook, or Samsung login methods.',
      'Sign out and test the new login.',
    ],
  },
]

const playbookByDomain = new Map(
  PLAYBOOKS.flatMap((playbook) =>
    playbook.domains.map((domain) => [domain, playbook] as const),
  ),
)

export function findPlaybook(domain: string): Playbook | undefined {
  const normalized = domain.toLowerCase().replace(/^www\./, '')
  const direct = playbookByDomain.get(normalized)
  if (direct) return direct

  return PLAYBOOKS.find((playbook) =>
    playbook.domains.some((candidate) => normalized.endsWith(`.${candidate}`)),
  )
}
