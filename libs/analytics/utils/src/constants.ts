import { defineMessage, MessageDescriptor } from 'react-intl'

import { get }                    from '@acx-ui/config'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'

export const productNames = get('IS_MLISA_SA')
  ? { smartZone: 'SmartZone' }
  : { smartZone: 'RUCKUS One' }

export enum IncidentToggle {
  AirtimeIncidents = 'airtime-incidents'
}

export type IncidentsToggleFilter = {
  toggles?: Record<IncidentToggle, boolean>
}

const allIncidentCodes = [
  'ttc',
  'radius-failure',
  'eap-failure',
  'dhcp-failure',
  'auth-failure',
  'assoc-failure',
  'p-cov-clientrssi-low',
  'p-load-sz-cpu-load',
  'p-switch-memory-high',
  'p-channeldist-suboptimal-plan-24g',
  'p-channeldist-suboptimal-plan-50g-outdoor',
  'p-channeldist-suboptimal-plan-50g-indoor',
  'i-net-time-future',
  'i-net-time-past',
  'i-net-sz-net-latency',
  'i-apserv-high-num-reboots',
  'i-apserv-continuous-reboots',
  'i-apserv-downtime-high',
  'i-switch-vlan-mismatch',
  'i-switch-poe-pd',
  'i-apinfra-poe-low',
  'i-apinfra-wanthroughput-low',
  'p-airtime-b-24g-high',
  'p-airtime-b-5g-high',
  'p-airtime-b-6(5)g-high',
  'p-airtime-rx-24g-high',
  'p-airtime-rx-5g-high',
  'p-airtime-rx-6(5)g-high',
  'p-airtime-tx-24g-high',
  'p-airtime-tx-5g-high',
  'p-airtime-tx-6(5)g-high'
] as const

const incidentsToggleMap: Record<
  IncidentToggle,
  { categories: Array<'all' | CategoryOption>, code: IncidentCode[] }
> = {
  [IncidentToggle.AirtimeIncidents]: {
    categories: ['all', 'performance'],
    code: [
      'p-airtime-b-24g-high',
      'p-airtime-b-5g-high',
      'p-airtime-b-6(5)g-high',
      'p-airtime-rx-24g-high',
      'p-airtime-rx-5g-high',
      'p-airtime-rx-6(5)g-high',
      'p-airtime-tx-24g-high',
      'p-airtime-tx-5g-high',
      'p-airtime-tx-6(5)g-high'
    ]
  }
}

export function incidentsToggle (payload: {
  code?: IncidentCode[]
  toggles?: Record<IncidentToggle, boolean>
}, category: 'all' | CategoryOption = 'all') {
  let codes = incidentCodes
  if (category !== 'all') codes = categoryCodeMap[category].codes
  if (payload.code) codes = payload.code

  const keys = Object.keys(payload.toggles ?? {}) as IncidentToggle[]
  return keys.reduce((code, k) => {
    if (!payload.toggles![k]) return code
    const map = incidentsToggleMap[k]
    if (!map.categories.includes(category)) return code
    return code.concat(map.code)
  }, codes)
}

export type IncidentCode = typeof allIncidentCodes[number]

// commented codes acc to prod rc config
export const incidentCodes: IncidentCode[] = [
  'ttc',
  'radius-failure',
  'eap-failure',
  'dhcp-failure',
  'auth-failure',
  'assoc-failure',
  'p-cov-clientrssi-low',
  'p-load-sz-cpu-load',
  'p-switch-memory-high',
  'p-channeldist-suboptimal-plan-24g',
  'p-channeldist-suboptimal-plan-50g-outdoor',
  'p-channeldist-suboptimal-plan-50g-indoor',
  'i-net-time-future',
  'i-net-time-past',
  'i-net-sz-net-latency',
  'i-apserv-high-num-reboots',
  'i-apserv-continuous-reboots',
  'i-apserv-downtime-high',
  'i-switch-vlan-mismatch',
  'i-switch-poe-pd',
  'i-apinfra-poe-low',
  'i-apinfra-wanthroughput-low'
]

export type CategoryOption = 'connection' | 'performance' | 'infrastructure'
export const categoryOptions = [
  { value: 'connection', label: defineMessage({ defaultMessage: 'Connection' }) },
  { value: 'performance', label: defineMessage({ defaultMessage: 'Performance' }) },
  { value: 'infrastructure', label: defineMessage({ defaultMessage: 'Infrastructure' }) }
]
export type CategoryTab = 'overview' | CategoryOption
export const categoryTabs = [
  { value: 'overview', label: defineMessage({ defaultMessage: 'Overview' }) },
  ...categoryOptions
]

export const categoryCodeMap = {
  connection: {
    codes: [
      'ttc',
      'radius-failure',
      'eap-failure',
      'dhcp-failure',
      'auth-failure',
      'assoc-failure'
    ] as IncidentCode[]
  },
  performance: {
    codes: [
      'p-cov-clientrssi-low',
      'p-load-sz-cpu-load',
      'p-switch-memory-high'
    ] as IncidentCode[]
  },
  infrastructure: {
    codes: [
      'i-net-time-future',
      'i-net-time-past',
      'i-net-sz-net-latency',
      'i-apserv-high-num-reboots',
      'i-apserv-continuous-reboots',
      'i-apserv-downtime-high',
      'i-switch-vlan-mismatch',
      'i-switch-poe-pd',
      'i-apinfra-poe-low',
      'i-apinfra-wanthroughput-low'
    ] as IncidentCode[]
  }
}

export enum Roles {
  PRIME_ADMINISTRATOR = 'admin',
  ADMINISTRATOR = 'network-admin',
  BUSINESS_INSIGHTS_USER = 'report-only',
  IT_HELPDESK = 'it-helpdesk',
  READ_ONLY = 'read-only',
  REPORTS_USER = 'reports-user',
  DATA_STUDIO_USER = 'data-studio-user',
}

export const useRoles = (forceAllRoles = true): Record<string, MessageDescriptor> => {
  const newRoles = {
    [Roles.PRIME_ADMINISTRATOR]: defineMessage({ defaultMessage: 'Prime Administrator' }),
    [Roles.ADMINISTRATOR]: defineMessage({ defaultMessage: 'Administrator' }),
    [Roles.BUSINESS_INSIGHTS_USER]: defineMessage({ defaultMessage: 'Bussiness Insights User' }),
    [Roles.IT_HELPDESK]: defineMessage({ defaultMessage: 'IT Helpdesk' }),
    [Roles.READ_ONLY]: defineMessage({ defaultMessage: 'Read Only' }),
    [Roles.REPORTS_USER]: defineMessage({ defaultMessage: 'Reports User' }),
    [Roles.DATA_STUDIO_USER]: defineMessage({ defaultMessage: 'Data Studio User' })
  }
  return useIsSplitOn(Features.RUCKUS_AI_NEW_ROLES_TOGGLE) ? newRoles : {
    ...(forceAllRoles ? newRoles : {}),
    [Roles.PRIME_ADMINISTRATOR]: defineMessage({ defaultMessage: 'Admin' }),
    [Roles.ADMINISTRATOR]: defineMessage({ defaultMessage: 'Network Admin' }),
    [Roles.BUSINESS_INSIGHTS_USER]: defineMessage({ defaultMessage: 'Report Only' })
  }
}
