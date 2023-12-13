import { NetworkTypeEnum, WlanSecurityEnum } from './constants'
import { NetworkDetail, NetworkSaveData }    from './types/network'

const SupportRadio6gSecurityList = [
  WlanSecurityEnum.WPA3,
  WlanSecurityEnum.OWE
]

export const IsSecuritySupport6g = (wlanSecurity?: WlanSecurityEnum) => {
  return !!(wlanSecurity && SupportRadio6gSecurityList.includes(wlanSecurity))
}

export const IsNetworkSupport6g = (networkDetail?: NetworkDetail | NetworkSaveData | null) => {
  const { type, wlan } = networkDetail || {}
  const { wlanSecurity } = wlan || {}

  if (!wlanSecurity) return false

  if (type === NetworkTypeEnum.DPSK && wlanSecurity === WlanSecurityEnum.WPA23Mixed) {
    return true
  }

  return IsSecuritySupport6g(wlanSecurity)
}
