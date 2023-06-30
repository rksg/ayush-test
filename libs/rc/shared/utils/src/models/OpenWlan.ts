import { OpenWlanAdvancedCustomization } from './OpenWlanAdvancedCustomization'

export class OpenWlan {
  advancedCustomization?: OpenWlanAdvancedCustomization

  vlanId: number

  ssid?: string

  enabled?: boolean

  constructor () {
    this.advancedCustomization = new OpenWlanAdvancedCustomization()

    this.vlanId = 1

    this.enabled = true
  }
}
