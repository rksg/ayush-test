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
  edgeClusterId: string;
  networkIds: string[];
  tunnelProfileId: string;
  isGuestTunnelEnabled: boolean;
  guestEdgeClusterId: string;
  guestTunnelProfileId: string;
  guestNetworkIds: string[];
}

export interface EdgeSdLanViewDataP2 {
  id?: string
  tenantId?: string
  name?: string
  tags?: string[]
  venueId: string
  edgeId?: string
  edgeName?: string
  edgeClusterId: string
  networkIds: string[]
  tunnelProfileId: string
  venueName?: string
  edgeClusterName?: string
  tunnelProfileName?: string
  networkInfos?: {
    networkId: string
    networkName: string
    }[]
  isGuestTunnelEnabled: boolean
  guestEdgeClusterId: string
  guestTunnelProfileId: string
  guestNetworkIds: string[]
  guestEdgeClusterName?: string
  guestTunnelProfileName?: string
  guestNetworkInfos?: {
    networkId: string
    networkName: string
    }[]
  serviceVersion?: string
  edgeAlarmSummary?: EdgeAlarmSummary
  vlanNum?: number
  vxlanTunnelNum?: number
  guestVlanNum?: number
  guestVxlanTunnelNum?: number
  vlans?: string[]
  guestVlans?: string[]
}

export interface EdgeSdLanActivateNetworkPayload {
  isGuestTunnelUtilized?: boolean
}

export interface EdgeSdLanToggleDmzPayload {
  isGuestTunnelEnabled: boolean
}

// ======== Multi-venue SD-LAN ========
type PartiallyOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

export interface EdgeMvSdLanResponseType {
  id: string;
  name: string;
  edgeClusterId: string;
  tunnelProfileId: string;
}

export type EdgeMvSdLanNetworks = {
   [venueId: string]: string[] // venueId: network-id[]
}

export interface EdgeMvSdLanExtended extends PartiallyOptional<EdgeMvSdLanResponseType, 'id'> {
  venueId?: string;
  networks: EdgeMvSdLanNetworks;
  isGuestTunnelEnabled: boolean;
  guestEdgeClusterId: string;
  guestEdgeClusterVenueId?: string;
  guestTunnelProfileId: string;
  guestNetworks: EdgeMvSdLanNetworks;
}

export interface EdgeSdLanTunneledWlan {
  venueId: string,
  venueName: string,
  networkId: string,
  networkName: string,
  wlanId: string,
}

export interface EdgeMvSdLanViewData {
  id?: string
  tenantId?: string
  name?: string
  tags?: string[]
  venueId?: string
  venueName?: string
  edgeId?: string
  edgeName?: string
  edgeClusterId?: string
  tunnelProfileId?: string
  edgeClusterName?: string
  tunnelProfileName?: string
  isGuestTunnelEnabled?: boolean
  guestEdgeClusterId?: string
  guestTunnelProfileId?: string
  guestEdgeClusterName?: string
  guestTunnelProfileName?: string
  serviceVersion?: string
  edgeAlarmSummary?: EdgeAlarmSummary
  vlanNum?: number
  vxlanTunnelNum?: number
  guestVlanNum?: number
  guestVxlanTunnelNum?: number
  vlans?: string[]
  guestVlans?: string[]
  timestamp?: number
  tunneledWlans?: EdgeSdLanTunneledWlan[]
  tunneledGuestWlans?: EdgeSdLanTunneledWlan[]
}

export type EdgeMvSdLanFormNetwork = {
  [venueId: string]: {
    id: string,
    name?: string
  }[]
}

export interface EdgeMvSdLanFormModel extends EdgeMvSdLanExtended {
  edgeClusterVenueId?: string;
  guestEdgeClusterVenueId?: string;
  edgeClusterName?: string;
  tunnelProfileName?: string;
  guestEdgeClusterName?: string;
  activatedNetworks: EdgeMvSdLanFormNetwork;
  activatedGuestNetworks: EdgeMvSdLanFormNetwork;
}