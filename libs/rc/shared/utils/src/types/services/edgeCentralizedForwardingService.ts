import { EdgeAlarmSummary } from '../edge'

export interface EdgeCentralizedForwardingSetting {
  id: string;
  serviceName: string;
  venueId: string;
  edgeId: string;
  corePortId: string; // TODO: need to confirm
  networkIds: string[];
  tunnelProfileId: string;
}

export interface EdgeCentralizedForwardingViewData {
  id?: string
  tenantId?: string
  name?: string
  tags?: string[]
  venueId?: string;
  edgeId?: string;
  networkIds?: string[];
  tunnelProfileId?: string;
  corePortMac?: string;
  venueName?: string,
  edgeName?: string,
  tunnelProfileName?: string,
  networkInfos?: {
    networkId: string,
    networkName: string,
    }[]
  serviceVersions?: Record<string, string>;
  edgeAlarmSummary?: EdgeAlarmSummary[]
}