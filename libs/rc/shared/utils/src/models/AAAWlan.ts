import { AAAWlanAdvancedCustomization }  from './AAAWlanAdvancedCustomization'
import { AAAWlanSecurityEnum }           from './AAAWlanSecurityEnum'
import { ManagementFrameProtectionEnum } from './ManagementFrameProtectionEnum'

export class AAAWlan {
  wlanSecurity: AAAWlanSecurityEnum

  advancedCustomization?: AAAWlanAdvancedCustomization

  managementFrameProtection?: ManagementFrameProtectionEnum

  vlanId: number

  ssid?: string

  enabled?: boolean

  bypassCPUsingMacAddressAuthentication?: boolean

  bypassCNA?: boolean

  constructor () {
    this.wlanSecurity = AAAWlanSecurityEnum.WPA2Enterprise

    this.advancedCustomization = new AAAWlanAdvancedCustomization()

    this.vlanId = 1

    this.enabled = true

    this.bypassCPUsingMacAddressAuthentication = false

    this.bypassCNA = false
  }
}
