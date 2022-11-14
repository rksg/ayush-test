import { NetworkVenue } from './NetworkVenue'
import { OpenWlan }     from './OpenWlan'

export class OpenNetwork {
  wlan: OpenWlan

  tenantId?: string

  venues?: NetworkVenue[]

  cloudpathServerId?: string

  name: string

  description?: string

  id?: string

  constructor () {
    this.wlan = new OpenWlan()

    this.venues = []

    this.name = ''
  }
}
