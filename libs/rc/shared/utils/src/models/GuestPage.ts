import { File } from './File'

export class GuestPage {
  langCode?: string

  title?: string

  tagLine?: string

  welcomeMessage?: string

  termsAndConditions?: string

  logoImage?: File

  advertImage?: File

  // Inserts WiFi4EU snippet in the head tag of the web auth portal page. This allows the WLAN to be used by members of the WiFi4EU \"digital single market\" for EU member states.

  wifi4Eu?: boolean

  // The network identifier (UUID) is obtained from your WiFi4EU Installation Report.

  wifi4EuNetworkId?: string

  constructor () {
    this.logoImage = new File()

    this.advertImage = new File()

    this.wifi4Eu = false
  }
}
