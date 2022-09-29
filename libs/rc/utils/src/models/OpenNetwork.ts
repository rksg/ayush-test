import { NetworkDetail } from './NetworkDetail'
import { OpenWlan }      from './OpenWlan'

export class OpenNetwork extends NetworkDetail{
  wlan: OpenWlan

  cloudpathServerId?: string

  constructor () {
    super()

    this.wlan = new OpenWlan()
  }
}
