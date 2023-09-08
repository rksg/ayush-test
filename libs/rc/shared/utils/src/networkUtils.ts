import { WlanSecurityEnum } from './constants'

const SupportRadio6gSecurityList = [
  WlanSecurityEnum.WPA3,
  WlanSecurityEnum.WPA23Mixed,
  WlanSecurityEnum.OWE
]

export const IsSecuritySupport6g = (wlanSecurity?: WlanSecurityEnum) => {
  return !!(wlanSecurity && SupportRadio6gSecurityList.includes(wlanSecurity))
}