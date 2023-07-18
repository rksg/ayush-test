
import { DpskWlanAdvancedCustomization } from './DpskWlanAdvancedCustomization'
import { DpskWlanSecurityEnum }          from './DpskWlanSecurityEnum'

export class DpskWlan {
  wlanSecurity: DpskWlanSecurityEnum

  advancedCustomization?: DpskWlanAdvancedCustomization

  vlanId: number

  ssid?: string

  enabled?: boolean

  constructor () {
    this.wlanSecurity = DpskWlanSecurityEnum.WPA2Personal

    this.advancedCustomization = new DpskWlanAdvancedCustomization()

    this.vlanId = 1

    this.enabled = true
  }
}
