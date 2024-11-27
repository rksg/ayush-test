import { BridgeServiceEnum } from '../../models/BridgeServiceEnum'

import { NewMdnsProxyForwardingRule } from './mdnsProxyService'

export interface EdgeMdnsProxySetting {
  name: string
  forwardingRules: Omit<NewMdnsProxyForwardingRule, 'service'> & {
    serviceType: BridgeServiceEnum
  }[]
}

export interface EdgeMdnsProxyViewData {
  id?: string
  name?: string
  forwardingRules?: NewMdnsProxyForwardingRule[]
  activations?: EdgeMdnsProxyActivation[]
}

export interface EdgeMdnsProxyActivation {
  venueId: string,
  venueName: string,
  edgeClusterId: string,
  edgeClusterName: string
}

export interface EdgeMdnsProxyStatsData {
  profileId?: string
  edgeId?: string
  clusterId?: string
  venueId?: string
  rxPackets?: number
  rxBytes?: number
  txPackets?: number
  txBytes?: number
  numRequest?: number
  numResponse?: number
  numMdnsServices?: number
  discoveredMdnsServices?: DiscoveredMdnsService[]
}

export interface DiscoveredMdnsService {
  mdnsStr: string
  vlanId: number
  macAddr: string
}