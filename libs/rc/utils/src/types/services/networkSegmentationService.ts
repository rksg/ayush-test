

export interface CreateNetworkSegmentationFormFields {
  name: string
}

export interface NetworkSegmentationSaveData extends CreateNetworkSegmentationFormFields{
  id?: string
  venueId?: string
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

export interface AccessSwitch extends Omit<WebAuthTemplate, 'name' | 'tag' > {
  id: string
  name?: string
  vlanId: number
  webAuthPageType: 'TEMPLATE' | 'USER_DEFINED',
  templateId?: string
  model: string
  distributionSwitchId: string
  uplinkInfo: UplinkInfo
}

export interface DistributionSwitch {
  id: string
  name?: string
  siteName: string
  siteIpAddress: string
  vlanList: string
  siteKeepAlive: string
  siteRetry: string
  loopbackInterfaceId: string
  loopbackInterfaceIpAddress: string
  loopbackInterfaceSubnetMask: string
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

