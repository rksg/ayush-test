
import {
  PskWlanSecurityEnum,
  MacAuthMacFormatEnum,
  ManagementFrameProtectionEnum
} from '../contents'

import { PskWlanAdvancedCustomization } from './PskWlanAdvancedCustomization'

export class PskWlan {
  wlanSecurity: PskWlanSecurityEnum

  advancedCustomization?: PskWlanAdvancedCustomization

  macAddressAuthentication?: boolean

  macAuthMacFormat?: MacAuthMacFormatEnum

  managementFrameProtection?: ManagementFrameProtectionEnum

  vlanId: number

  ssid: string

  enabled?: boolean

  passphrase?: string

  saePassphrase?: string

  wepHexKey?: string

  constructor () {
    this.wlanSecurity = PskWlanSecurityEnum.WPA2Personal

    this.advancedCustomization = new PskWlanAdvancedCustomization()

    this.macAddressAuthentication = false

    this.vlanId = 1

    this.ssid = ''

    this.enabled = true
  }
}