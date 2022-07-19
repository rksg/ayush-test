/**
 *	GuestNetwork
 *	Guest Wi-Fi network
 **/

import { GuestPortal } from './GuestPortal'
import { GuestWlan }   from './GuestWlan'

export class GuestNetwork {
  wlan: GuestWlan

  guestPortal: GuestPortal

  tenantId?: string

  // Enable DHCP (requires a bound DHCP Profile)
  enableDhcp?: boolean

  cloudpathServerId?: string

  name: string

  description?: string

  id?: string

  constructor () {
    this.wlan = new GuestWlan()

    this.guestPortal = new GuestPortal()

    this.enableDhcp = false

    this.name = ''
  }
}
