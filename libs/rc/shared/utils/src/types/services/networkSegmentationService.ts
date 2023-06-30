export interface NetworkSegmentationGroup {
  id: string
  name: string
  vxlanTunnelProfileId: string
  venueInfos: VenueInfo[]
  edgeInfos: EdgeInfo[]
  networkIds: string[]
  distributionSwitchInfos: DistributionSwitch[]
  accessSwitchInfos: AccessSwitch[]
  forceOverwriteReboot?: boolean
}

export interface NetworkSegmentationGroupViewData {
  id: string
  name: string
  tags: string[]
  vxlanTunnelProfileId: string
  networkIds: string[]
  venueInfos: VenueInfo[]
  edgeInfos: EdgeInfo[]
  distributionSwitchInfos: DistributionSwitch[]
  accessSwitchInfos: AccessSwitch[]
  serviceStatus: string
  tunnelNumber: string
}

export interface VenueInfo {
  venueId: string
  venueName: string
  personaGroupId: string
}

export interface EdgeInfo {
  edgeId: string
  edgeName: string
  segments: number
  devices: number
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
  siteName: string
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
