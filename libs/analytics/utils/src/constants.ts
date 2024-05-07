import { defineMessage, MessageDescriptor } from 'react-intl'

import { get } from '@acx-ui/config'
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
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

export const permissions: Record<string, string> = {
  READ_DASHBOARD: 'READ_DASHBOARD',
  READ_INCIDENTS: 'READ_INCIDENTS',
  WRITE_INCIDENTS: 'WRITE_INCIDENTS',
  READ_AI_DRIVEN_RRM: 'READ_AI_DRIVEN_RRM',
  WRITE_AI_DRIVEN_RRM: 'WRITE_AI_DRIVEN_RRM',
  READ_AI_OPERATIONS: 'READ_AI_OPERATIONS',
  WRITE_AI_OPERATIONS: 'WRITE_AI_OPERATIONS',
  READ_HEALTH: 'READ_HEALTH',
  WRITE_HEALTH: 'WRITE_HEALTH',
  READ_CLIENT_TROUBLESHOOTING: 'READ_CLIENT_TROUBLESHOOTING',
  READ_SERVICE_VALIDATION: 'READ_SERVICE_VALIDATION',
  WRITE_SERVICE_VALIDATION: 'WRITE_SERVICE_VALIDATION',
  READ_CONFIG_CHANGE: 'READ_CONFIG_CHANGE',
  READ_APP_INSIGHTS: 'READ_APP_INSIGHTS',
  WRITE_APP_INSIGHTS: 'WRITE_APP_INSIGHTS',
  READ_VIDEO_CALL_QOE: 'READ_VIDEO_CALL_QOE',
  WRITE_VIDEO_CALL_QOE: 'WRITE_VIDEO_CALL_QOE',

  READ_ZONES: 'READ_ZONES',

  READ_WIRELESS_CLIENTS_LIST: 'READ_WIRELESS_CLIENTS_LIST',
  READ_WIRELESS_CLIENTS_REPORT: 'READ_WIRELESS_CLIENTS_REPORT',
  READ_WIRED_CLIENTS_LIST: 'READ_WIRED_CLIENTS_LIST',
  READ_WIRED_CLIENTS_REPORT: 'READ_WIRED_CLIENTS_REPORT',

  READ_ACCESS_POINTS_LIST: 'READ_ACCESS_POINTS_LIST',
  READ_ACCESS_POINTS_REPORT: 'READ_ACCESS_POINTS_REPORT',
  READ_WIFI_NETWORKS_LIST: 'READ_WIFI_NETWORKS_LIST',
  READ_WLANS_REPORT: 'READ_WLANS_REPORT',
  READ_APPLICATIONS_REPORT: 'READ_APPLICATIONS_REPORT',
  READ_WIRELESS_REPORT: 'READ_WIRELESS_REPORT',

  READ_SWITCH_LIST: 'READ_SWITCH_LIST',
  READ_WIRED_REPORT: 'READ_WIRED_REPORT',

  READ_DATA_STUDIO: 'READ_DATA_STUDIO',
  WRITE_DATA_STUDIO: 'WRITE_DATA_STUDIO',
  READ_REPORTS: 'READ_REPORTS',
  READ_OCCUPANCY: 'READ_OCCUPANCY',
  WRITE_OCCUPANCY: 'WRITE_OCCUPANCY',

  READ_ONBOARDED_SYSTEMS: 'READ_ONBOARDED_SYSTEMS',
  READ_USERS: 'READ_USERS',
  WRITE_USERS: 'WRITE_USERS',
  READ_LABELS: 'READ_LABELS',
  WRITE_LABELS: 'WRITE_LABELS',
  READ_RESOURCE_GROUPS: 'READ_RESOURCE_GROUPS',
  WRITE_RESOURCE_GROUPS: 'WRITE_RESOURCE_GROUPS',
  READ_SUPPORT: 'READ_SUPPORT',
  WRITE_SUPPORT: 'WRITE_SUPPORT',
  READ_LICENSES: 'READ_LICENSES',
  WRITE_LICENSES: 'WRITE_LICENSES',
  READ_REPORT_SCHEDULES: 'READ_REPORT_SCHEDULES',
  WRITE_REPORT_SCHEDULES: 'WRITE_REPORT_SCHEDULES',
  READ_WEBHOOKS: 'READ_WEBHOOKS',
  WRITE_WEBHOOKS: 'WRITE_WEBHOOKS',

  READ_BRAND360: 'READ_BRAND360'
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
