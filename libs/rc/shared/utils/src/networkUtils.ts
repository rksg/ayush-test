import { NetworkTypeEnum, WlanSecurityEnum }       from './constants'
import { Network, NetworkDetail, NetworkSaveData } from './types/network'
import { TableResult }                             from './useTableQuery'

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

export const transformNetworkListResponse = (result: TableResult<Network>) => {
  result.data = result.data.map(item => ({
    ...item,
    activated: item.activated ?? { isActivated: false },
    ...(item?.dsaeOnboardNetwork &&
      { children: [{ ...item?.dsaeOnboardNetwork,
        isOnBoarded: true,
        id: item?.name + 'onboard' } as Network] })
  })) as Network[]

  return result
}
