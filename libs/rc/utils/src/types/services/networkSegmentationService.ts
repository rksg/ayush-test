

export interface CreateNetworkSegmentationFormFields {
  name: string
}

export interface NetworkSegmentationSaveData extends CreateNetworkSegmentationFormFields{
  id?: string;
}

export interface WebAuthTemplate {
  name: string
  id: string
  webAuth_userId_label?: string
  webAuth_password_label?: string
  webAuth_custom_title?: string
  webAuth_custom_top?: string
  webAuth_custom_login_button?: string
  webAuth_custom_bottom?: string
  switches?: AccessSwitch[]
  tag?: string
}

export interface AccessSwitch extends Omit<WebAuthTemplate, 'name' | 'switches' | 'tag' > {
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