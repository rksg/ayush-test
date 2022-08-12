/* eslint-disable max-len */
import { defineMessage, MessageDescriptor } from 'react-intl'

import { IncidentCode } from './constants'

export interface IncidentInformation {
  category: MessageDescriptor
  subCategory: MessageDescriptor
  shortDescription: MessageDescriptor
  longDescription: MessageDescriptor
  incidentType: 'common' | 'network' | 'switch'
}

export const incidentInformation: Record<IncidentCode, IncidentInformation> = {
  'ttc': {
    category: defineMessage({ defaultMessage: 'Connection' }),
    subCategory: defineMessage({ defaultMessage: 'Time To Connect' }),
    shortDescription: defineMessage({
      defaultMessage: 'Time to connect is greater than {threshold} in {scope}'
    }),
    longDescription: defineMessage({
      defaultMessage: 'Time to connect is high in {scope}, impacting connectivity for {impact} of clients.'
    }),
    incidentType: 'network'
  },
  'radius-failure': {
    category: defineMessage({ defaultMessage: 'Connection' }),
    subCategory: defineMessage({ defaultMessage: 'RADIUS' }),
    shortDescription: defineMessage({
      defaultMessage: 'RADIUS failures are unusually high in {scope}'
    }),
    longDescription: defineMessage({
      defaultMessage: 'RADIUS failures are high in {scope} impacting connectivity for {impact} of clients.'
    }),
    incidentType: 'network'
  },
  'eap-failure': {
    category: defineMessage({ defaultMessage: 'Connection' }),
    subCategory: defineMessage({ defaultMessage: 'EAP' }),
    shortDescription: defineMessage({
      defaultMessage: 'EAP failures are unusually high in {scope}'
    }),
    longDescription: defineMessage({
      defaultMessage: 'EAP failures are high in {scope} impacting connectivity for {impact} of clients.'
    }),
    incidentType: 'network'
  },
  'dhcp-failure': {
    category: defineMessage({ defaultMessage: 'Connection' }),
    subCategory: defineMessage({ defaultMessage: 'DHCP' }),
    shortDescription: defineMessage({
      defaultMessage: 'DHCP failures are unusually high in {scope}'
    }),
    longDescription: defineMessage({
      defaultMessage: 'DHCP failures are high in {scope} impacting connectivity for {impact} of clients.'
    }),
    incidentType: 'network'
  },
  'auth-failure': {
    category: defineMessage({ defaultMessage: 'Connection' }),
    subCategory: defineMessage({ defaultMessage: '802.11 Authentication' }),
    shortDescription: defineMessage({
      defaultMessage: '802.11 Authentication failures are unusually high in {scope}'
    }),
    longDescription: defineMessage({
      defaultMessage: '802.11 Authentication failures are high in {scope} impacting connectivity for {impact} of clients.'
    }),
    incidentType: 'network'
  },
  'assoc-failure': {
    category: defineMessage({ defaultMessage: 'Connection' }),
    subCategory: defineMessage({ defaultMessage: 'Association' }),
    shortDescription: defineMessage({
      defaultMessage: 'Association failures are unusually high in {scope}'
    }),
    longDescription: defineMessage({
      defaultMessage: 'Association failures are high in {scope} impacting connectivity for {impact} of clients.'
    }),
    incidentType: 'network'
  },
  'p-cov-clientrssi-low': {
    category: defineMessage({ defaultMessage: 'Performance' }),
    subCategory: defineMessage({ defaultMessage: 'Coverage' }),
    shortDescription: defineMessage({
      defaultMessage: 'Clients with low RSS are unusually high in {scope}'
    }),
    longDescription: defineMessage({
      defaultMessage: 'Clients with low RSS are unusually high in {scope}, impacting {impact} of connected clients.'
    }),
    incidentType: 'network'
  },
  'i-net-time-future': {
    category: defineMessage({ defaultMessage: 'Infrastructure' }),
    subCategory: defineMessage({ defaultMessage: 'Network' }),
    shortDescription: defineMessage({
      defaultMessage: 'The controller cluster is sending data with an incorrect future timestamp'
    }),
    longDescription: defineMessage({
      defaultMessage: 'The controller cluster is sending data with an incorrect future timestamp. To avoid false or misleading data analysis, all future timestamped data is dropped.'
    }),
    incidentType: 'common'
  },
  'i-net-time-past': {
    category: defineMessage({ defaultMessage: 'Infrastructure' }),
    subCategory: defineMessage({ defaultMessage: 'Network' }),
    shortDescription: defineMessage({
      defaultMessage: 'The controller cluster is sending data with an incorrect past timestamp'
    }),
    longDescription: defineMessage({
      defaultMessage: 'The controller cluster is sending data with an incorrect past timestamp. To avoid false or misleading data analysis, past timestamped data is not analyzed for incidents.'
    }),
    incidentType: 'common'
  },
  'i-net-sz-net-latency': {
    category: defineMessage({ defaultMessage: 'Infrastructure' }),
    subCategory: defineMessage({ defaultMessage: 'Network' }),
    shortDescription: defineMessage({
      defaultMessage: 'The network latency between the SZ nodes is unusually high'
    }),
    longDescription: defineMessage({
      defaultMessage: 'The network latency between the SZ nodes is unusually high.'
    }),
    incidentType: 'common'
  },
  'p-load-sz-cpu-load': {
    category: defineMessage({ defaultMessage: 'Performance' }),
    subCategory: defineMessage({ defaultMessage: 'Load' }),
    shortDescription: defineMessage({
      defaultMessage: '{scope} is experiencing unusually high CPU usage'
    }),
    longDescription: defineMessage({
      defaultMessage: '{scope} is experiencing unusually high CPU usage. Prolonged high usage can cause CPU tasks to be queued, and also impact sending of data to northbound systems, including, but not limited to, RUCKUS Analytics.'
    }),
    incidentType: 'common'
  },
  'i-apserv-downtime-high': {
    category: defineMessage({ defaultMessage: 'Infrastructure' }),
    subCategory: defineMessage({ defaultMessage: 'Service Availability' }),
    shortDescription: defineMessage({
      defaultMessage: 'High AP-Controller connection failures in {scope}'
    }),
    longDescription: defineMessage({
      defaultMessage: 'High AP-Controller connection failures in {scope}.'
    }),
    incidentType: 'network'
  },
  'i-apserv-high-num-reboots': {
    category: defineMessage({ defaultMessage: 'Infrastructure' }),
    subCategory: defineMessage({ defaultMessage: 'Service Availability' }),
    shortDescription: defineMessage({
      defaultMessage: 'AP service is affected due to high number of AP reboots'
    }),
    longDescription: defineMessage({
      defaultMessage: 'AP service is affected due to high number of AP reboots.'
    }),
    incidentType: 'network'
  },
  'i-apserv-continuous-reboots': {
    category: defineMessage({ defaultMessage: 'Infrastructure' }),
    subCategory: defineMessage({ defaultMessage: 'Service Availability' }),
    shortDescription: defineMessage({
      defaultMessage: 'AP service is affected due to high number of AP reboots'
    }),
    longDescription: defineMessage({
      defaultMessage: 'AP service is affected due to high number of AP reboots.'
    }),
    incidentType: 'network'
  },
  // 'p-channeldist-suboptimal-plan-24g': {
  //   category: defineMessage({ defaultMessage: 'Performance' }),
  //   subCategory: defineMessage({ defaultMessage: 'Channel Conditions' }),
  //   shortDescription: defineMessage({
  //     defaultMessage: 'Sub-optimal channel conditions detected for 2.4 GHz in {scope}'
  //   }),
  //   longDescription: defineMessage({
  //     defaultMessage: 'Sub-optimal channel conditions detected for 2.4 GHz in {scope}.'
  //   }),
  //   incidentType: 'network'
  // },
  // 'p-channeldist-suboptimal-plan-50g-outdoor': {
  //   category: defineMessage({ defaultMessage: 'Performance' }),
  //   subCategory: defineMessage({ defaultMessage: 'Channel Conditions' }),
  //   shortDescription: defineMessage({
  //     defaultMessage: 'Sub-optimal channel conditions detected for 5 GHz (outdoor) in {scope}'
  //   }),
  //   longDescription: defineMessage({
  //     defaultMessage: 'Sub-optimal channel conditions detected for 5 GHz (outdoor) in {scope}.'
  //   }),
  //   incidentType: 'network'
  // },
  // 'p-channeldist-suboptimal-plan-50g-indoor': {
  //   category: defineMessage({ defaultMessage: 'Performance' }),
  //   subCategory: defineMessage({ defaultMessage: 'Channel Conditions' }),
  //   shortDescription: defineMessage({
  //     defaultMessage: 'Sub-optimal channel conditions detected for 5 GHz (indoor) in {scope}'
  //   }),
  //   longDescription: defineMessage({
  //     defaultMessage: 'Sub-optimal channel conditions detected for 5 GHz (indoor) in {scope}.'
  //   }),
  //   incidentType: 'network'
  // },
  'i-switch-vlan-mismatch': {
    category: defineMessage({ defaultMessage: 'Infrastructure' }),
    subCategory: defineMessage({ defaultMessage: 'VLAN Mismatch' }),
    shortDescription: defineMessage({
      defaultMessage: 'VLAN mismatch found in {scope}'
    }),
    longDescription: defineMessage({
      defaultMessage: 'VLAN mismatch found in {scope}.'
    }),
    incidentType: 'switch'
  },
  'p-switch-memory-high': {
    category: defineMessage({ defaultMessage: 'Performance' }),
    subCategory: defineMessage({ defaultMessage: 'Memory' }),
    shortDescription: defineMessage({
      defaultMessage: 'High memory utilization detected in {scope}'
    }),
    longDescription: defineMessage({
      defaultMessage: 'High memory utilization detected in {scope}.'
    }),
    incidentType: 'switch'
  },
  'i-switch-poe-pd': {
    category: defineMessage({ defaultMessage: 'Infrastructure' }),
    subCategory: defineMessage({ defaultMessage: 'PoE' }),
    shortDescription: defineMessage({
      defaultMessage: 'PoE power denied in {scope}'
    }),
    longDescription: defineMessage({
      defaultMessage: 'PoE power denied in {scope}.'
    }),
    incidentType: 'switch'
  },
  'i-apinfra-poe-low': {
    category: defineMessage({ defaultMessage: 'Infrastructure' }),
    subCategory: defineMessage({ defaultMessage: 'PoE' }),
    shortDescription: defineMessage({
      defaultMessage: 'AP(s) operating in Low Power Mode: {scope}'
    }),
    longDescription: defineMessage({
      defaultMessage: 'AP(s) operating in Low Power Mode: {scope}.'
    }),
    incidentType: 'network'
  },
  'i-apinfra-wanthroughput-low': {
    category: defineMessage({ defaultMessage: 'Infrastructure' }),
    subCategory: defineMessage({ defaultMessage: 'WAN' }),
    shortDescription: defineMessage({
      defaultMessage: 'Sub-optimal WAN throughput - speed mismatch between AP and peer device: {scope}'
    }),
    longDescription: defineMessage({
      defaultMessage: 'Sub-optimal WAN throughput - speed mismatch between AP and peer device: {scope}.'
    }),
    incidentType: 'network'
  }
}
