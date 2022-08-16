import { MacAuthMacFormatEnum }          from './MacAuthMacFormatEnum'
import { ManagementFrameProtectionEnum } from './ManagementFrameProtectionEnum'
import { PskWlanAdvancedCustomization }  from './PskWlanAdvancedCustomization'
import { PskWlanSecurityEnum }           from './PskWlanSecurityEnum'

export class PskWlan {
  wlanSecurity: PskWlanSecurityEnum

  advancedCustomization?: PskWlanAdvancedCustomization

  macAddressAuthentication?: boolean

  macAuthMacFormat?: MacAuthMacFormatEnum

  managementFrameProtection?: ManagementFrameProtectionEnum

  vlanId: number
  
  ssid?: string

  enabled?: boolean

  passphrase?: string

  saePassphrase?: string

  wepHexKey?: string

  constructor () {
    this.wlanSecurity = PskWlanSecurityEnum.WPA2Personal

    this.advancedCustomization = new PskWlanAdvancedCustomization()

    this.macAddressAuthentication = false

    this.vlanId = 1

    this.enabled = true
  }
}
