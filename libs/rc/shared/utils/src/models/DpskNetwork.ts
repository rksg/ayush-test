import { DpskPassphraseGeneration } from './DpskPassphraseGeneration'
import { DpskWlan }                 from './DpskWlan'
import { NetworkDetail }            from './NetworkDetail'

export class DpskNetwork extends NetworkDetail {
  wlan: DpskWlan

  tenantId?: string

  cloudpathServerId?: string

  dpskPassphraseGeneration: DpskPassphraseGeneration

  constructor () {
    super()

    this.wlan = new DpskWlan()

    this.dpskPassphraseGeneration = new DpskPassphraseGeneration()
  }
}
