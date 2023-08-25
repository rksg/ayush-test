import { WlanSecurityEnum } from './constants'


export const IsWPA3Security = (wlanSecurity?: WlanSecurityEnum) => {
  return wlanSecurity && [WlanSecurityEnum.WPA3, WlanSecurityEnum.OWE].includes(wlanSecurity)
}