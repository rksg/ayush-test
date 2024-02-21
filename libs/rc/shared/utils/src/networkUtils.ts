import { WlanSecurityEnum }                        from './constants'
import { Network, NetworkDetail, NetworkSaveData } from './types/network'

const SupportRadio6gSecurityList = [
  WlanSecurityEnum.WPA3,
  WlanSecurityEnum.OWE,
  WlanSecurityEnum.WPA23Mixed // support with AP firmware 7.0+
]

export const IsSecuritySupport6g = (wlanSecurity?: WlanSecurityEnum) => {
  return !!(wlanSecurity && SupportRadio6gSecurityList.includes(wlanSecurity))
}

export const IsNetworkSupport6g = (networkDetail?: NetworkDetail | NetworkSaveData | null) => {
  const { wlan } = networkDetail || {}
  const { wlanSecurity } = wlan || {}

  if (!wlanSecurity) return false

  return IsSecuritySupport6g(wlanSecurity)
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
