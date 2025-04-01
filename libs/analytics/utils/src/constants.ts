import { partition }                        from 'lodash'
import { defineMessage, MessageDescriptor } from 'react-intl'

import { get }                    from '@acx-ui/config'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'

export const productNames = get('IS_MLISA_SA')
  ? { smartZone: 'SmartZone' }
  : { smartZone: 'RUCKUS One' }

export enum IncidentToggle {
  AirtimeIncidents = 'airtime-incidents',
  SwitchDDoSIncidents = 'switch-ddos-incidents',
  SwitchLoopDetectionIncidents = 'switch-loop-detection-incidents',
  SwitchLLDPStatusIncidents = 'switch-lldp-status-incidents',
  SwitchPortCongestionIncidents = 'switch-port-congestion-incidents',
  SwitchUplinkPortCongestionIncidents = 'switch-uplink-port-congestion-incidents',
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
  'i-switch-loop-detection',
  'i-switch-lldp-status',
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
  'p-airtime-tx-6(5)g-high',
  'p-switch-port-congestion',
  'p-switch-uplink-port-congestion',
  's-switch-tcp-syn-ddos'
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
  },
  [IncidentToggle.SwitchDDoSIncidents]: {
    categories: ['all', 'security'],
    code: ['s-switch-tcp-syn-ddos']
  },
  [IncidentToggle.SwitchLoopDetectionIncidents]: {
    categories: ['all', 'infrastructure'],
    code: ['i-switch-loop-detection']
  },
  [IncidentToggle.SwitchLLDPStatusIncidents]: {
    categories: ['all', 'infrastructure'],
    code: ['i-switch-lldp-status']
  },
  [IncidentToggle.SwitchPortCongestionIncidents]: {
    categories: ['all', 'performance'],
    code: ['p-switch-port-congestion']
  },
  [IncidentToggle.SwitchUplinkPortCongestionIncidents]: {
    categories: ['all', 'performance'],
    code: ['p-switch-uplink-port-congestion']
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

export const getWiredWirelessIncidentCodes = (
  toggles: Record<IncidentToggle, boolean>) => partition(
  incidentsToggle({ code: [...incidentCodes],
    toggles }),
  (code: IncidentCode) => code.includes('switch')
)
export type CategoryOption = 'connection' | 'performance' | 'infrastructure' | 'security'
export const categoryOptions = [
  {
    value: 'connection',
    label: defineMessage({ defaultMessage: 'Connection' }),
    isVisible: () => true
  },
  {
    value: 'performance',
    label: defineMessage({ defaultMessage: 'Performance' }),
    isVisible: () => true
  },
  {
    value: 'infrastructure',
    label: defineMessage({ defaultMessage: 'Infrastructure' }),
    isVisible: () => true
  }
]
export type CategoryTab = 'overview' | Omit<CategoryOption,'security'>
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
      'p-switch-memory-high',
      'p-switch-port-congestion',
      'p-switch-uplink-port-congestion'
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
      'i-switch-loop-detection',
      'i-switch-lldp-status',
      'i-apinfra-poe-low',
      'i-apinfra-wanthroughput-low'
    ] as IncidentCode[]
  },
  security: {
    codes: [
      's-switch-tcp-syn-ddos'
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
    [Roles.BUSINESS_INSIGHTS_USER]: defineMessage({ defaultMessage: 'Business Insights User' }),
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
