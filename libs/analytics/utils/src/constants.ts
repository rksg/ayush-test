import { defineMessage } from 'react-intl'

export const noDataSymbol = '-' as const
// commented codes acc to prod rc config
export const incidentCodes = [
  'ttc',
  'radius-failure',
  'eap-failure',
  'dhcp-failure',
  'auth-failure',
  'assoc-failure',
  'p-cov-clientrssi-low',
  'p-load-sz-cpu-load',
  'p-switch-memory-high',
  //'p-channeldist-suboptimal-plan-24g',
  //'p-channeldist-suboptimal-plan-50g-outdoor',
  //'p-channeldist-suboptimal-plan-50g-indoor',
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
] as const

export type IncidentCode = typeof incidentCodes[number]

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