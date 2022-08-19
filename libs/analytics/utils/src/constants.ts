
// commented codes acc to prod rc config
export const incidentCodes = [
  'ttc',
  'radius-failure',
  'eap-failure',
  'dhcp-failure',
  'auth-failure',
  'assoc-failure',
  //'high-assoc-failure',
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
]

export const Severities = {
  P1: { gt: 0.9, lte: 1 },
  P2: { gt: 0.75, lte: 0.9 },
  P3: { gt: 0.6, lte: 0.75 },
  P4: { gt: 0, lte: 0.6 }
}

export type IncidentCode = typeof incidentCodes[number]

export const noDataSymbol = '-'
