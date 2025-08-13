import { TunnelTypeEnum }   from '../../models'
import { EdgeAlarmSummary } from '../edge'

export interface EdgeSdLanActivateNetworkPayload {
  isGuestTunnelUtilized?: boolean // To be deprecated
  forwardingTunnelProfileId?: string
}

export interface EdgeSdLanToggleDmzPayload {
  isGuestTunnelEnabled: boolean
}

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
  guestEdgeClusterVenueId?: string;     // for RBAC API
  guestTunnelProfileId: string;
  guestNetworks: EdgeMvSdLanNetworks;
}

export interface EdgeSdLanTunneledWlan {
  venueId: string
  venueName: string
  networkId: string
  networkName: string
  wlanId: string
  forwardingTunnelProfileId?: string
  forwardingTunnelType?: TunnelTypeEnum | string
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
  tunnelTemplateId?: string
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
  edgeClusterTunnelInfo?: EdgeSdLanDcTunnelInfo[]
  guestEdgeClusterTunnelInfo?: EdgeSdLanDmzTunnelInfo[]
  tunneledWlanTemplates?: EdgeSdLanTunneledWlan[] // GUI used
}

export type EdgeMvSdLanFormNetwork = {
  [venueId: string]: {
    id: string,
    name?: string
  }[]
}

export interface EdgeMvSdLanFormModel extends EdgeMvSdLanExtended {
  edgeClusterVenueId?: string;       // for RBAC API
  guestEdgeClusterVenueId?: string;  // for RBAC API
  edgeClusterName?: string;
  tunnelProfileName?: string;
  guestTunnelProfileName?: string;
  guestEdgeClusterName?: string;
  activatedNetworks: EdgeMvSdLanFormNetwork;
  activatedGuestNetworks: EdgeMvSdLanFormNetwork;
}

export interface EdgeSdLanDcTunnelInfo {
  serialNumber: string
  activeApCount: number
  allocatedApCount: number
}

export interface EdgeSdLanDmzTunnelInfo {
  serialNumber: string
  activeNodeCount: number
  allocatedNodeCount: number
}

export interface EdgeSdLanServiceProfile {
  id?: string
  name: string
  tunnelProfileId: string
  tunnelTemplateId?: string
  customerTenantIds?: string[]
  activeNetwork: {
    venueId: string
    networkId: string
    tunnelProfileId?: string
  }[],
  activeNetworkTemplate?: {
    venueId: string
    networkId: string
    tunnelProfileId?: string
  }[]
}