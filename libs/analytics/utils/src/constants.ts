export enum NetworkNodeTypeForDisplay {
  network = 'Network',
  apGroupName = 'AP Group',
  apGroup = 'AP Group',
  zoneName = 'Venue',
  zone = 'Venue', // can be moved i18n translation later
  switchGroup = 'Venue',
  switch = 'Switch',
  apMac = 'Access Point',
  ap = 'Access Point',
  AP = 'Access Point' // since data-api sends AP
}

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
]
