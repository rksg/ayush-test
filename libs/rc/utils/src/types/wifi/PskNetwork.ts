import { NetworkDetail } from './NetworkDetail'
import { PskWlan }       from './PskWlan'
import { Radius }        from './Radius'

export class PskNetwork extends NetworkDetail {
  wlan: PskWlan

  authRadius?: Radius

  accountingRadius?: Radius

  constructor () {
    super()

    this.wlan = new PskWlan()

    this.authRadius = new Radius()

    this.accountingRadius = new Radius()
  }
}
