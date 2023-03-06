export interface NetworkSegmentationGroup {
  id: string
  name: string
  vxlanTunnelProfileId: string
  venueInfos: VenueInfo[]
  edgeInfos: EdgeInfo[]
  networkIds: string[]
  distributionSwitchInfos: DistributionSwitch[]
  accessSwitchInfos: AccessSwitch[]
  forceOverwriteReboot: boolean
  adminName: string
}

export interface NetworkSegmentationGroupStats {
  id: string
  name: string
  tags: string[]
  networkIds: string[]
  venueInfos: VenueInfo[]
  edgeInfos: EdgeInfo[]
  distributionSwitchInfos: DistributionSwitch[]
  accessSwitchInfos: AccessSwitch[]
}

export interface VenueInfo {
  venueId: string
  personaId: string
}

export interface EdgeInfo {
  edgeId: string
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

export type UplinkInfo = {
  uplinkType: 'PORT' | 'LAG'
  uplinkId: string
}

interface MduSwitchAddtionalInfo {
  name: string
  siteConnection: string
  siteActive: string
  dispatchMessage: string
}

export interface AccessSwitch extends
  Omit<WebAuthTemplate, 'name' | 'tag' >,
  Partial<MduSwitchAddtionalInfo>
{
  id: string
  vlanId?: number
  webAuthPageType?: 'TEMPLATE' | 'USER_DEFINED',
  templateId?: string
  uplinkInfo?: UplinkInfo
  distributionSwitchId: string
}

export interface DistributionSwitch extends Partial<MduSwitchAddtionalInfo> {
  id: string
  siteName: string
  siteIp: string
  vlans: string
  siteKeepAlive: string
  siteRetry: string
  loopbackInterfaceId: string
  loopbackInterfaceIp: string
  loopbackInterfaceSubnetMask: string
  accessSwitches?: AccessSwitch[]
}

export interface SwitchLite extends Partial<UplinkInfo> {
  id: string
  name: string
  firmwareVersion: string
  familyId: string
  model: string
}

export interface NetworkSegmentationSwitchSaveData {
  distributionSwitches: DistributionSwitch[]
  accessSwitches: AccessSwitch[]
  forceOverwriteReboot?: boolean
}
