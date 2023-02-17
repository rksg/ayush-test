

export interface CreateNetworkSegmentationFormFields {
  name: string
}

export interface NetworkSegmentationSaveData extends
  CreateNetworkSegmentationFormFields,
  Partial<NetworkSegmentationSwitchSaveData>
{
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

export interface NetworkSegmentationGroup {
  id: string,
  name: string
}
