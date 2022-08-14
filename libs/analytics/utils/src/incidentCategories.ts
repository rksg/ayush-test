export const categoryNames = [
  { text: 'Connection', value: 'connection' },
  { text: 'Performance', value: 'performance' },
  { text: 'Infrastructure', value: 'infrastructure' }
]
  
export const categoryCodeMap = {
  connection: {
    codes: [
      'ttc',
      'ttc+radius-failure',
      'ttc+auth-failure',
      'ttc+assoc-failure',
      'ttc+eap-failure',
      'ttc+dhcp-failure',
      'radius-failure',
      'high-radius-failure',
      'eap-failure',
      'high-eap-failure',
      'dhcp-failure',
      'high-dhcp-failure',
      'auth-failure',
      'high-auth-failure',
      'assoc-failure',
      'high-assoc-failure'
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
      'i-switch-poe-pd'
    ]
  }
}