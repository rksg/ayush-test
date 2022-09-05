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
  // 'p-channeldist-suboptimal-plan-24g',
  // 'p-channeldist-suboptimal-plan-50g-outdoor',
  // 'p-channeldist-suboptimal-plan-50g-indoor',
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

export type IncidentCode = typeof incidentCodes[number]

export const categoryNames = [
  { text: 'Connection', value: 'connection' },
  { text: 'Performance', value: 'performance' },
  { text: 'Infrastructure', value: 'infrastructure' }
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
    ]
  },
  performance: {
    codes: [
      'p-cov-clientrssi-low',
      'p-load-sz-cpu-load',
      'p-switch-memory-high'
    ]
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
    ]
  }
}

