/* eslint-disable max-len */
export interface IncidentInformation {
  category: string
  subCategory: string
  unit?: string
  isThresholdBased?: boolean
  shortDescription: string
  longDescription: string
  isBeta?: boolean
  incidentType: 'network' | 'common' | 'switch'
}

export const incidentInformation: Record<string, IncidentInformation> = {
  'ttc': {
    category: 'Connection',
    subCategory: 'Time To Connect',
    unit: 'seconds',
    isThresholdBased: true,
    shortDescription: 'Time to connect is greater than {{threshold}} in {{scope}}',
    longDescription: 'Time to connect is high in {{scope}}, impacting connectivity for {{impact}} of clients.',
    incidentType: 'network'
  },
  'ttc+radius-failure': {
    category: 'Connection',
    subCategory: 'Time To Connect',
    isThresholdBased: true,
    unit: 'seconds',
    shortDescription: 'Time to connect is greater than {{threshold}} in {{scope}} due to high RADIUS failures',
    longDescription: 'Time to connect is high in {{scope}}, impacting connectivity for {{impact}} of clients.',
    incidentType: 'network'
  },
  'ttc+auth-failure': {
    category: 'Connection',
    subCategory: 'Time To Connect',
    isThresholdBased: true,
    unit: 'seconds',
    shortDescription: 'Time to connect is greater than {{threshold}} in {{scope}} due to  high AUTHENTICATION failures',
    longDescription: 'Time to connect is high in {{scope}}, impacting connectivity for {{impact}} of clients.',
    incidentType: 'network'
  },
  'ttc+assoc-failure': {
    category: 'Connection',
    subCategory: 'Time To Connect',
    isThresholdBased: true,
    unit: 'seconds',
    shortDescription: 'Time to connect is greater than {{threshold}} in {{scope}} due to  high ASSOCIATION failures',
    longDescription: 'Time to connect is high in {{scope}}, impacting connectivity for {{impact}} of clients.',
    incidentType: 'network'
  },
  'ttc+eap-failure': {
    category: 'Connection',
    subCategory: 'Time To Connect',
    isThresholdBased: true,
    unit: 'seconds',
    shortDescription: 'Time to connect is greater than {{threshold}} in {{scope}} due to high EAP failures',
    longDescription: 'Time to connect is high in {{scope}}, impacting connectivity for {{impact}} of clients.',
    incidentType: 'network'
  },
  'ttc+dhcp-failure': {
    category: 'Connection',
    subCategory: 'Time To Connect',
    isThresholdBased: true,
    unit: 'seconds',
    shortDescription: 'Time to connect is greater than {{threshold}} in {{scope}} due to high DHCP failures',
    longDescription: 'Time to connect is high in {{scope}}, impacting connectivity for {{impact}} of clients.',
    incidentType: 'network'
  },
  'radius-failure': {
    category: 'Connection',
    subCategory: 'RADIUS',
    shortDescription: 'RADIUS failures are unusually high in {{scope}}',
    longDescription: 'RADIUS failures are high in {{scope}} impacting connectivity for {{impact}} of clients.',
    incidentType: 'network'
  },
  'high-radius-failure': {
    category: 'Connection',
    subCategory: 'RADIUS',
    shortDescription: 'RADIUS failures are excessively high in {{scope}}',
    longDescription: 'RADIUS failures are high in {{scope}} impacting connectivity for {{impact}} of clients.',
    incidentType: 'network'
  },
  'eap-failure': {
    category: 'Connection',
    subCategory: 'EAP',
    shortDescription: 'EAP failures are unusually high in {{scope}}',
    longDescription: 'EAP failures are high in {{scope}} impacting connectivity for {{impact}} of clients.',
    incidentType: 'network'
  },
  'high-eap-failure': {
    category: 'Connection',
    subCategory: 'EAP',
    shortDescription: 'EAP failures are excessively high in {{scope}}',
    longDescription: 'EAP failures are high in {{scope}} impacting connectivity for {{impact}} of clients.',
    incidentType: 'network'
  },
  'dhcp-failure': {
    category: 'Connection',
    subCategory: 'DHCP',
    shortDescription: 'DHCP failures are unusually high in {{scope}}',
    longDescription: 'DHCP failures are high in {{scope}} impacting connectivity for {{impact}} of clients.',
    incidentType: 'network'
  },
  'high-dhcp-failure': {
    category: 'Connection',
    subCategory: 'DHCP',
    shortDescription: 'DHCP failures are excessively high in {{scope}}',
    longDescription: 'DHCP failures are high in {{scope}} impacting connectivity for {{impact}} of clients.',
    incidentType: 'network'
  },
  'auth-failure': {
    category: 'Connection',
    subCategory: '802.11 Authentication',
    shortDescription: '802.11 Authentication failures are unusually high in {{scope}}',
    longDescription: '802.11 Authentication failures are high in {{scope}} impacting connectivity for {{impact}} of clients.',
    incidentType: 'network'
  },
  'high-auth-failure': {
    category: 'Connection',
    subCategory: '802.11 Authentication',
    shortDescription: '802.11 Authentication failures are excessively high in {{scope}}',
    longDescription: '802.11 Authentication failures are high in {{scope}} impacting connectivity for {{impact}} of clients.',
    incidentType: 'network'
  },
  'assoc-failure': {
    category: 'Connection',
    subCategory: 'Association',
    shortDescription: 'Association failures are unusually high in {{scope}}',
    longDescription: 'Association failures are high in {{scope}} impacting connectivity for {{impact}} of clients.',
    incidentType: 'network'
  },
  'high-assoc-failure': {
    category: 'Connection',
    subCategory: 'Association',
    shortDescription: 'Association failures are excessively high in {{scope}}',
    longDescription: 'Association failures are high in {{scope}} impacting connectivity for {{impact}} of clients.',
    incidentType: 'network'
  },
  'p-cov-clientrssi-low': {
    category: 'Performance',
    subCategory: 'Coverage',
    shortDescription: 'Clients with low RSS are unusually high in {{scope}}',
    longDescription: 'Clients with low RSS are unusually high in {{scope}}, impacting {{impact}} of connected clients.',
    incidentType: 'network'
  },
  'i-net-time-future': {
    category: 'Infrastructure',
    subCategory: 'Network',
    shortDescription: 'The controller cluster is sending data with an incorrect future timestamp',
    longDescription: 'The controller cluster is sending data with an incorrect future timestamp. To avoid false or misleading data analysis, all future timestamped data is dropped.',
    incidentType: 'common'
  },
  'i-net-time-past': {
    category: 'Infrastructure',
    subCategory: 'Network',
    shortDescription: 'The controller cluster is sending data with an incorrect past timestamp',
    longDescription: 'The controller cluster is sending data with an incorrect past timestamp. To avoid false or misleading data analysis, past timestamped data is not analyzed for incidents.',
    incidentType: 'common'
  },
  'i-net-sz-net-latency': {
    category: 'Infrastructure',
    subCategory: 'Network',
    shortDescription: 'The network latency between the SZ nodes is unusually high',
    longDescription: 'The network latency between the SZ nodes is unusually high.',
    incidentType: 'common'
  },
  'p-load-sz-cpu-load': {
    category: 'Performance',
    subCategory: 'Load',
    shortDescription: '{{scope}} is experiencing unusually high CPU usage',
    longDescription: '{{scope}} is experiencing unusually high CPU usage. Prolonged high usage can cause CPU tasks to be queued, and also impact sending of data to northbound systems, including, but not limited to, RUCKUS Analytics.',
    incidentType: 'common'
  },
  'i-apserv-downtime-high': {
    category: 'Infrastructure',
    subCategory: 'Service Availability',
    shortDescription: 'High AP-Controller connection failures in {{scope}}',
    longDescription: 'High AP-Controller connection failures in {{scope}}.',
    incidentType: 'network'
  },
  'i-apserv-high-num-reboots': {
    category: 'Infrastructure',
    subCategory: 'Service Availability',
    shortDescription: 'AP service is affected due to high number of AP reboots',
    longDescription: 'AP service is affected due to high number of AP reboots.',
    incidentType: 'network'
  },
  'i-apserv-continuous-reboots': {
    category: 'Infrastructure',
    subCategory: 'Service Availability',
    shortDescription: 'AP service is affected due to high number of AP reboots',
    longDescription: 'AP service is affected due to high number of AP reboots.',
    incidentType: 'network'
  },
  'p-channeldist-suboptimal-plan-24g': {
    category: 'Performance',
    subCategory: 'Channel Conditions',
    shortDescription: 'Sub-optimal channel conditions detected for 2.4 GHz in {{scope}}',
    longDescription: 'Sub-optimal channel conditions detected for 2.4 GHz in {{scope}}.',
    isBeta: true,
    incidentType: 'network'
  },
  'p-channeldist-suboptimal-plan-50g-outdoor': {
    category: 'Performance',
    subCategory: 'Channel Conditions',
    shortDescription: 'Sub-optimal channel conditions detected for 5 GHz (outdoor) in {{scope}}',
    longDescription: 'Sub-optimal channel conditions detected for 5 GHz (outdoor) in {{scope}}.',
    isBeta: true,
    incidentType: 'network'
  },
  'p-channeldist-suboptimal-plan-50g-indoor': {
    category: 'Performance',
    subCategory: 'Channel Conditions',
    shortDescription: 'Sub-optimal channel conditions detected for 5 GHz (indoor) in {{scope}}',
    longDescription: 'Sub-optimal channel conditions detected for 5 GHz (indoor) in {{scope}}.',
    isBeta: true,
    incidentType: 'network'
  },
  'i-switch-vlan-mismatch': {
    category: 'Infrastructure',
    subCategory: 'VLAN Mismatch',
    shortDescription: 'VLAN mismatch found in {{scope}}',
    longDescription: 'VLAN mismatch found in {{scope}}.',
    incidentType: 'switch'
  },
  'p-switch-memory-high': {
    category: 'Performance',
    subCategory: 'Memory',
    shortDescription: 'High memory utilization detected in {{scope}}',
    longDescription: 'High memory utilization detected in {{scope}}.',
    incidentType: 'switch'
  },
  'i-switch-poe-pd': {
    category: 'Infrastructure',
    subCategory: 'PoE',
    shortDescription: 'PoE power denied in {{scope}}',
    longDescription: 'PoE power denied in {{scope}}.',
    incidentType: 'switch'
  },
  'i-apinfra-poe-low': {
    category: 'Infrastructure',
    subCategory: 'PoE',
    shortDescription: 'AP(s) operating in Low Power Mode: {{scope}}',
    longDescription: 'AP(s) operating in Low Power Mode: {{scope}}.',
    incidentType: 'network'
  },
  'i-apinfra-wanthroughput-low': {
    category: 'Infrastructure',
    subCategory: 'WAN',
    shortDescription: 'Sub-optimal WAN throughput - speed mismatch between AP and peer device: {{scope}}',
    longDescription: 'Sub-optimal WAN throughput - speed mismatch between AP and peer device: {{scope}}.',
    incidentType: 'network'
  }
}

export default incidentInformation
