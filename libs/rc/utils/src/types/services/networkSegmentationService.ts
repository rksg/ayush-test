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

export interface AccessSwitch extends Omit<WebAuthTemplate, 'name' | 'tag' > {
  id: string
  name: string
  vlanId: number
  templateId?: string
  model: string
  distributionSwitchId: string
  uplinkInfo: {
    uplinkType: 'PORT' | 'LAG'
    uplinkId: string
  }
}

export interface DistributionSwitch {
  id: string
  name: string
  siteName: string
  siteIpAddress: string
  vlanList: string
  siteKeepAlive: string
  siteRetry: string
  loopbackInterfaceId: string
  loopbackInterfaceIpAddress: string
  loopbackInterfaceSubnetMask: string
}
