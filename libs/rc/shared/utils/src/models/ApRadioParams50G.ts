import { Channel50Enum }          from './Channel50Enum'
import { ChannelBandwidth5GEnum } from './ChannelBandwidth5GEnum'
import { ScanMethodEnum }         from './ScanMethodEnum'
import { TxPowerEnum }            from './TxPowerEnum'

export class ApRadioParams50G {
  allowedChannels?: Channel50Enum[]

  channelBandwidth: ChannelBandwidth5GEnum

  manualChannel?: number

  // Operative Tx Power

  operativeTxPower?: string

  // Operative Channel

  operativeChannel?: number

  snr_dB?: number

  method: ScanMethodEnum

  changeInterval: number

  txPower: TxPowerEnum

  constructor () {
    this.allowedChannels = []

    this.channelBandwidth = ChannelBandwidth5GEnum.AUTO

    this.method = ScanMethodEnum.BACKGROUND_SCANNING

    this.changeInterval = 33

    this.txPower = TxPowerEnum.MAX
  }
}
