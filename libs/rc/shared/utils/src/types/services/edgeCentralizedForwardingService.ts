import { EdgeAlarmSummary } from '../edge'

export interface EdgeCentralizedForwardingSetting {
  id: string;
  name: string;
  venueId: string;
  edgeId: string;
  corePortMac: string;
  networkIds: string[];
  tunnelProfileId: string;
}

export interface EdgeCentralizedForwardingViewData {
  id?: string
  tenantId?: string
  name?: string
  tags?: string[]
  venueId: string
  edgeId: string
  networkIds: string[]
  tunnelProfileId: string
  corePortMac: string
  venueName?: string
  edgeName?: string
  tunnelProfileName?: string,
  networkInfos?: {
    networkId: string
    networkName: string
    }[]
  serviceVersion?: string
  edgeAlarmSummary?: EdgeAlarmSummary
}