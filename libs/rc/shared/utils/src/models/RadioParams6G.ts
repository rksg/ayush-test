
import { BssMinRate6GEnum }       from './BssMinRate6GEnum'
import { Channel6GEnum }          from './Channel6GEnum'
import { ChannelBandwidth6GEnum } from './ChannelBandwidth6GEnum'
import { MgmtTxRate6GEnum }       from './MgmtTxRate6GEnum'
import { ScanMethodEnum }         from './ScanMethodEnum'
import { TxPowerEnum }            from './TxPowerEnum'
import { VenueHeight }            from './VenueHeight'

export class RadioParams6G {
  method: ScanMethodEnum

  allowedChannels?: Channel6GEnum[]

  allowedIndoorChannels?: Channel6GEnum[]

  allowedOutdoorChannels?: Channel6GEnum[]

  channelBandwidth: ChannelBandwidth6GEnum

  changeInterval: number

  scanInterval: number

  // BSS (Basic Service Set) minimum PHY rate for 6-GHz radio.
  bssMinRate6G: BssMinRate6GEnum

  // Management Frame minimum PHY rate for 6-GHz radio.
  mgmtTxRate6G: MgmtTxRate6GEnum

  txPower: TxPowerEnum

  enableAfc: boolean

  venueHeight?: VenueHeight

  enableMulticastDownlinkRateLimiting?: boolean
  enableMulticastUplinkRateLimiting?: boolean
  enableMulticastRateLimiting?: boolean

  multicastDownlinkRateLimiting?: number
  multicastUplinkRateLimiting?: number

  constructor () {
    this.method = ScanMethodEnum.CHANNELFLY

    this.allowedChannels = []

    this.allowedIndoorChannels = []

    this.allowedOutdoorChannels = []

    this.channelBandwidth = ChannelBandwidth6GEnum.AUTO

    this.bssMinRate6G = BssMinRate6GEnum.HE_MCS_0

    this.mgmtTxRate6G = MgmtTxRate6GEnum._6

    this.changeInterval = 33

    this.scanInterval = 20

    this.txPower = TxPowerEnum.MAX

    this.enableAfc = false

    this.venueHeight = {}
  }
}
