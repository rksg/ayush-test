import { GuestPortal }   from './GuestPortal'
import { GuestWlan }     from './GuestWlan'
import { NetworkDetail } from './NetworkDetail'

export class GuestNetwork extends NetworkDetail {
  wlan: GuestWlan

  guestPortal: GuestPortal

  enableDhcp?: boolean

  constructor () {
    super()

    this.wlan = new GuestWlan()

    this.guestPortal = new GuestPortal()

    this.enableDhcp = false
  }
}
