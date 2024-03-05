import { EdgeAlarmSummary } from '../edge'

export interface EdgeSdLanSetting {
  id: string;
  name: string;
  venueId?: string; // UI used
  venueName?: string; // UI used
  edgeId: string;
  corePortMac: string;
  networkIds: string[];
  tunnelProfileId: string;
}

export interface EdgeSdLanViewData {
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
  tunnelProfileName?: string
  networkInfos?: {
    networkId: string
    networkName: string
    }[]
  serviceVersion?: string
  edgeAlarmSummary?: EdgeAlarmSummary
  vlanNum?: number
  vxlanTunnelNum?: number
}

export interface EdgeSdLanSettingP2 {
  id: string;
  name: string;
  venueId?: string; // UI used
  venueName?: string; // UI used
  clusterId: string;
  networkIds: string[];
  tunnelProfileId: string;
  isGuestTunnelEnabled: boolean;
  guestClusterId: string;
  guestTunnelProfileId: string;
  guestNetworkIds: string[];
}

export interface EdgeSdLanViewDataP2 {
  id?: string
  tenantId?: string
  name?: string
  tags?: string[]
  venueId: string
  clusterId: string
  networkIds: string[]
  tunnelProfileId: string
  venueName?: string
  clusterName?: string
  tunnelProfileName?: string
  networkInfos?: {
    networkId: string
    networkName: string
    }[]
  isGuestTunnelEnabled: boolean
  guestClusterId: string
  guestTunnelProfileId: string
  guestNetworkIds: string[]
  guestClusterName?: string
  guestTunnelProfileName?: string
  guestNetworkInfos?: {
    networkId: string
    networkName: string
    }[]
  serviceVersion?: string
  edgeAlarmSummary?: EdgeAlarmSummary
  vlanNum?: number
  vxlanTunnelNum?: number
}

export interface EdgeSdLanActivateNetworkPayload {
  isGuestTunnelUtilized: boolean
}

export interface EdgeSdLanToggleDmzPayload {
  isGuestTunnelEnabled: boolean
}