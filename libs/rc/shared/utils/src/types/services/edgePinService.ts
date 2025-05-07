import { EdgeAlarmSummary } from '../..'
export interface PersonalIdentityNetworks {
  id: string
  name: string
  vxlanTunnelProfileId: string
  personaGroupId: string
  venueId: string
  edgeClusterInfo: EdgeClusterInfo
  tunneledWlans: EdgePinTunneledWlan[]
  distributionSwitchInfos: DistributionSwitch[]
  accessSwitchInfos: AccessSwitch[]
  networkSegmentConfiguration: Omit<EdgeClusterInfo, 'edgeClusterId'>
}

export interface PersonalIdentityNetworksViewData {
  id?: string
  name?: string
  tags?: string[]
  venueId?: string
  venueName?: string
  vxlanTunnelProfileId?: string
  personaGroupId?: string
  edgeClusterInfo?: EdgeClusterInfo & {
    edgeClusterName: string
  }
  tunneledWlans?: EdgePinTunneledWlan[]
  distributionSwitchInfos?: DistributionSwitch[]
  accessSwitchInfos?: AccessSwitch[]
  serviceStatus?: string
  tunnelNumber?: string
  edgeAlarmSummary?: EdgeAlarmSummary[]
}

export interface PersonalIdentityNetworkFormData extends PersonalIdentityNetworks {
  networkIds: string[]
  venueName: string
  edgeClusterId: string
  edgeClusterName: string
  dhcpId: string
  dhcpName: string
  poolId: string
  poolName: string
  tags: string[]
  segments: number
  tunnelProfileName: string
  networkNames: string[]
  originalAccessSwitchInfos: AccessSwitch[]
  dhcpRelay: boolean
  networkTopologyType?: string
}

export interface EdgePinTunneledWlan {
  // should unmark this when support multi-venue PIN
  // venueId: string
  networkId: string
}

export interface EdgeClusterInfo {
  edgeClusterId: string
  segments: number
  dhcpInfoId: string
  dhcpPoolId: string
}

export interface WebAuthTemplate {
  name: string
  id: string
  webAuthPasswordLabel?: string
  webAuthCustomTitle?: string
  webAuthCustomTop?: string
  webAuthCustomLoginButton?: string
  webAuthCustomBottom?: string
  tag?: string
}

export interface WebAuthTemplateTableData extends WebAuthTemplate{
  switchCount?: number
  venueCount?: number
}

export type UplinkInfo = {
  uplinkType: 'PORT' | 'LAG'
  uplinkId: string
}

interface MduSwitchAddtionalInfo {
  name: string
  firmwareVersion: string
  familyId: string
  model: string
  dispatchMessage: string
}

export interface AccessSwitch extends
  AccessSwitchSaveData,
  Partial<MduSwitchAddtionalInfo>{}

export interface AccessSwitchSaveData extends
  Omit<WebAuthTemplate, 'name' | 'tag' >
{
  id: string
  vlanId?: number
  webAuthPageType?: 'TEMPLATE' | 'USER_DEFINED'
  templateId?: string
  uplinkInfo?: UplinkInfo
  distributionSwitchId: string
}

export interface DistributionSwitch extends
  DistributionSwitchSaveData,
  Partial<MduSwitchAddtionalInfo>
{
  siteIp?: string
  siteActive: string
  siteConnection: string
  forwardingProfile?: string,
  accessSwitches?: AccessSwitch[]
}

export interface DistributionSwitchSaveData {
  id: string
  vlans: string
  siteKeepAlive: string
  siteRetry: string
  loopbackInterfaceId: string
  loopbackInterfaceIp: string
  loopbackInterfaceSubnetMask: string
}

export interface SwitchLite extends Partial<UplinkInfo> {
  id: string
  name?: string
  firmwareVersion?: string
  familyId?: string
  model?: string
}
