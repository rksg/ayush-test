/* eslint-disable @typescript-eslint/no-explicit-any */

import { AuthRadiusEnum, GuestNetworkTypeEnum, NetworkSaveData, NetworkTypeEnum, DpskWlanAdvancedCustomization } from '@acx-ui/rc/utils'

export const hasAuthRadius = (data: NetworkSaveData | null, wlanData: any) => {
  if (!data) return false

  const { type } = data
  const { wlan={} } = wlanData

  switch (type) {
    case NetworkTypeEnum.AAA:
      return true

    case NetworkTypeEnum.OPEN:
    case NetworkTypeEnum.PSK:
      const { macAddressAuthentication=false, isMacRegistrationList=false } = wlan
      return (macAddressAuthentication && !isMacRegistrationList)

    case NetworkTypeEnum.DPSK:
      return wlanData?.isCloudpathEnabled

    case NetworkTypeEnum.CAPTIVEPORTAL:
      const { guestPortal, enableAccountingService } = data
      if (guestPortal?.guestNetworkType === GuestNetworkTypeEnum.Cloudpath) {
        return true
      }

      if  (guestPortal?.guestNetworkType === GuestNetworkTypeEnum.WISPr) {
        // keep this for next feature ( authservice is 'always accept')
        const wisprPage = wlanData?.guestPortal?.wisprPage
        if (wisprPage?.customExternalProvider === true) { // custom provider
          if (enableAccountingService !== true &&
              wisprPage?.authType === AuthRadiusEnum.ALWAYS_ACCEPT) {
            return false
          }
        }
        return true
      }
      return false

    default:
      return false
  }
}

const noAccountingPorviderNames = ['Height8', 'SocialSignin', 'WILAS', 'WILAS-2']

export const hasAccountingRadius = (data: NetworkSaveData | null, wlanData: any) => {
  if (!data) return false

  const { type, enableAccountingService } = data

  if (type === NetworkTypeEnum.CAPTIVEPORTAL) {
    const { guestPortal } = data
    if (guestPortal?.guestNetworkType === GuestNetworkTypeEnum.WISPr) {
      const wisprPage = wlanData?.guestPortal?.wisprPage
      if (wisprPage) {
        const { customExternalProvider = false, externalProviderName = '' } = wisprPage
        if (!customExternalProvider && externalProviderName !== '' ) {
          return !noAccountingPorviderNames.includes(externalProviderName)
        }
      }
    }
  }

  return enableAccountingService === true
}

export const hasVxLanTunnelProfile = (data: NetworkSaveData | null) => {
  if (!data) return false

  const wlanAdvaced = (data?.wlan?.advancedCustomization as DpskWlanAdvancedCustomization)
  if (wlanAdvaced?.tunnelProfileId) {
    return true
  }
  return false
}