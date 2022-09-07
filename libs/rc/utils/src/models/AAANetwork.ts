import { AAAWlan }       from './AAAWlan'
import { NetworkDetail } from './NetworkDetail'
import { Radius }        from './Radius'

export class AAANetwork extends NetworkDetail {
  wlan: AAAWlan

  authRadius?: Radius

  accountingRadius?: Radius

  cloudpathServerId?: string

  enableAuthProxy?: boolean

  enableAccountingProxy?: boolean

  constructor () {
    super()

    this.wlan = new AAAWlan()

    this.enableAuthProxy = false

    this.enableAccountingProxy = false
  }
}
