/**
 *	GuestWlan
 *	Guest WLAN
 **/

import { GuestWlanAdvancedCustomization } from './GuestWlanAdvancedCustomization'
import { GuestWlanSecurityEnum }          from './GuestWlanSecurityEnum'
import { MacAuthMacFormatEnum }           from './MacAuthMacFormatEnum'
import { ManagementFrameProtectionEnum }  from './ManagementFrameProtectionEnum'

export class GuestWlan {
  wlanSecurity: GuestWlanSecurityEnum

  bypassCPUsingMacAddressAuthentication?: boolean

  advancedCustomization?: GuestWlanAdvancedCustomization

  macAddressAuthentication?: boolean

  macAuthMacFormat?: MacAuthMacFormatEnum

  managementFrameProtection?: ManagementFrameProtectionEnum

  vlanId: number

  enabled?: boolean

  bypassCNA?: boolean

  passphrase?: string

  saePassphrase?: string

  wepHexKey?: string

  constructor () {
    this.wlanSecurity = GuestWlanSecurityEnum.None

    this.bypassCPUsingMacAddressAuthentication = true

    this.advancedCustomization = new GuestWlanAdvancedCustomization()

    this.macAddressAuthentication = false

    this.vlanId = 1

    this.enabled = true

    this.bypassCNA = false
  }
}
