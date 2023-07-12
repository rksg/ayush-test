import { defineMessage } from 'react-intl'

import { get } from '@acx-ui/config'

export const productNames = get('IS_MLISA_SA')
  ? { smartZone: 'Smart Zone' }
  : { smartZone: 'RUCKUS One' }

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

export const PERMISSION_VIEW_ANALYTICS = 'view-analytics'
export const PERMISSION_VIEW_REPORT_CONTROLLER_INVENTORY = 'view-report-controller-inventory'
export const PERMISSION_VIEW_DATA_EXPLORER = 'view-data-explorer'
export const PERMISSION_MANAGE_SERVICE_GUARD = 'manage-service-guard'
export const PERMISSION_MANAGE_MLISA = 'manage-mlisa'
export const PERMISSION_MANAGE_CALL_MANAGER = 'manage-call-manager'
export const PERMISSION_MANAGE_OCCUPANCY = 'manage-occupancy'
export const PERMISSION_MANAGE_CONFIG_RECOMMENDATION = 'manage-config-recommendation'
export const PERMISSION_MANAGE_LABEL = 'manage-label'
export const PERMISSION_MANAGE_TENANT_SETTINGS = 'manage-tenant-settings'

export const PERMISSION_FRANCHISOR = 'franchisor'
