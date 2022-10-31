import { BssMinRate6GEnum }       from './BssMinRate6GEnum'
import { Channel6GEnum }          from './Channel6GEnum'
import { ChannelBandwidth6GEnum } from './ChannelBandwidth6GEnum'
import { MgmtTxRate6GEnum }       from './MgmtTxRate6GEnum'
import { ScanMethodEnum }         from './ScanMethodEnum'
import { TxPowerEnum }            from './TxPowerEnum'

export class ApRadioParams6G {
  manualChannel?: number

  // Operative Tx Power

  operativeTxPower?: string

  // Operative Channel

  operativeChannel?: number

  snr_dB?: number

  method: ScanMethodEnum

  allowedChannels?: Channel6GEnum[]

  channelBandwidth: ChannelBandwidth6GEnum

  // BSS (Basic Service Set) minimum PHY rate for 6-GHz radio.

  bssMinRate6G: BssMinRate6GEnum

  // Management Frame minimum PHY rate for 6-GHz radio.

  mgmtTxRate6G: MgmtTxRate6GEnum

  changeInterval: number

  txPower: TxPowerEnum

  constructor () {
    this.method = ScanMethodEnum.CHANNELFLY

    this.allowedChannels = []

    this.channelBandwidth = ChannelBandwidth6GEnum.AUTO

    this.bssMinRate6G = BssMinRate6GEnum.HE_MCS_0

    this.mgmtTxRate6G = MgmtTxRate6GEnum._6

    this.changeInterval = 33

    this.txPower = TxPowerEnum.MAX
  }
}
