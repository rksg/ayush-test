import { BonjourGatewayRule } from '../../models/BonjourGatewayRule'
import { BridgeServiceEnum }  from '../../models/BridgeServiceEnum'

export interface EdgeMdnsProxySetting {
  serviceName: string
  forwardingProxyRules: Omit<BonjourGatewayRule, 'service'> & {
    serviceType: BridgeServiceEnum
  }[]
}

export interface EdgeMdnsProxyViewData {
  id?: string
  name?: string
  forwardingProxyRules?: BonjourGatewayRule[]
  venueInfo?: EdgeMdnsProxyVenueInfo[]
}

export interface EdgeMdnsProxyVenueInfo {
  venueId: string,
  venueName: string
}