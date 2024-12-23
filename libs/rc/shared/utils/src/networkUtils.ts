import { WlanSecurityEnum }                                     from './constants'
import { Network, NetworkDetail, NetworkSaveData, WifiNetwork } from './types/network'

const SupportRadio6gSecurityList = [
  WlanSecurityEnum.WPA3,
  WlanSecurityEnum.OWE,
  WlanSecurityEnum.WPA23Mixed, // support with AP firmware 7.0+
  WlanSecurityEnum.OWETransition // support with AP firmware 7.1+
]

export const IsSecuritySupport6g = (wlanSecurity?: WlanSecurityEnum,
  options?: Record<string, boolean>) => {
  const supportSecurityList = options?.isSupport6gOWETransition
    ? SupportRadio6gSecurityList
    : SupportRadio6gSecurityList.filter((wlanSecurityEnum) => (
      wlanSecurityEnum !== WlanSecurityEnum.OWETransition
    ))
  //console.log('supportSecurityList: ', supportSecurityList)
  return !!(wlanSecurity && supportSecurityList.includes(wlanSecurity))
}

export const IsNetworkSupport6g = (networkDetail?: NetworkDetail | NetworkSaveData | null,
  options?: Record<string, boolean>) => {
  const { wlan } = networkDetail || {}
  const { wlanSecurity } = wlan || {}

  if (!wlanSecurity) return false

  return IsSecuritySupport6g(wlanSecurity, options)
}

export const transformNetwork = (item: Network) => {
  return {
    ...item,
    activated: item.activated ?? { isActivated: false },
    ...(item?.dsaeOnboardNetwork &&
      { children: [{ ...item?.dsaeOnboardNetwork,
        isOnBoarded: true,
        id: item?.name + 'onboard' } as Network] })
  }
}

export const transformWifiNetwork = (item: WifiNetwork) => {
  const { clientCount, venueApGroups, apSerialNumbers, apCount } = item
  const venues = transVenuesForNetwork(venueApGroups)

  return {
    ...item,
    aps: apCount ?? apSerialNumbers?.length ?? 0,
    clients: clientCount ?? 0,
    venues: venues,
    activated: item.activated ?? { isActivated: false },
    ...(item?.dsaeOnboardNetwork &&
      { children: [{ ...item?.dsaeOnboardNetwork,
        isOnBoarded: true,
        id: item?.name + 'onboard' } as Network] })
  }
}

// eslint-disable-next-line max-len
export function transVenuesForNetwork (venueApGroups: WifiNetwork['venueApGroups'] = []): Network['venues'] {
  return {
    count: venueApGroups.length,
    names: [],
    ids: venueApGroups.map(v => v.venueId)
  }
}

export function formatMacAddress (macAddress: string): string {
  const replaceMacAddress = macAddress.replace(/[^a-z0-9]/gi, '')
  return replaceMacAddress?.match(/.{1,2}/g)?.join(':') ?? ''
}
