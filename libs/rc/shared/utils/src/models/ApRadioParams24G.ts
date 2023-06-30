import { Channel24Enum }           from './Channel24Enum'
import { ChannelBandwidth24GEnum } from './ChannelBandwidth24GEnum'
import { ScanMethodEnum }          from './ScanMethodEnum'
import { TxPowerEnum }             from './TxPowerEnum'

export class ApRadioParams24G {
  manualChannel?: number

  // Operative Tx Power

  operativeTxPower?: string

  // Operative Channel

  operativeChannel?: number

  snr_dB?: number

  allowedChannels?: Channel24Enum[]

  channelBandwidth: ChannelBandwidth24GEnum

  method: ScanMethodEnum

  changeInterval: number

  txPower: TxPowerEnum

  constructor () {
    this.allowedChannels = []

    this.channelBandwidth = ChannelBandwidth24GEnum.AUTO

    this.method = ScanMethodEnum.BACKGROUND_SCANNING

    this.changeInterval = 33

    this.txPower = TxPowerEnum.MAX
  }
}
