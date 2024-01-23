/* eslint-disable @typescript-eslint/no-explicit-any */

import _ from 'lodash'

import { Features, TierFeatures, useIsSplitOn, useIsTierAllowed } from '@acx-ui/feature-toggle'
import { useGetTunnelProfileViewDataListQuery }                   from '@acx-ui/rc/services'
import {
  AuthRadiusEnum,
  GuestNetworkTypeEnum,
  NetworkSaveData,
  NetworkTypeEnum,
  DpskWlanAdvancedCustomization,
  TunnelTypeEnum,
  TunnelProfileViewData
} from '@acx-ui/rc/utils'

export interface NetworkVxLanTunnelProfileInfo {
  enableTunnel: boolean,
  enableVxLan: boolean,
  vxLanTunnels: TunnelProfileViewData[] | undefined
}

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

export const useNetworkVxLanTunnelProfileInfo =
  (data: NetworkSaveData | null): NetworkVxLanTunnelProfileInfo => {
    const isEdgeEnabled = useIsTierAllowed(TierFeatures.SMART_EDGES)
    const isEdgeReady = useIsSplitOn(Features.EDGES_TOGGLE)

    const { data: tunnelProfileData } = useGetTunnelProfileViewDataListQuery(
      { payload: {
        filters: { networkIds: [data?.id] }
      } },
      { skip: !isEdgeEnabled || !isEdgeReady || !data }
    )

    const vxLanTunnels = tunnelProfileData?.data.filter(item => item.type === TunnelTypeEnum.VXLAN
      && item.personalIdentityNetworkIds.length > 0)
    const enableTunnel = !_.isEmpty(tunnelProfileData?.data)
    const enableVxLan = !_.isEmpty(vxLanTunnels)

    return {
      enableTunnel,
      enableVxLan,
      vxLanTunnels
    }
  }