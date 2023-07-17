import { Channel24Enum }           from './Channel24Enum'
import { ChannelBandwidth24GEnum } from './ChannelBandwidth24GEnum'
import { ScanMethodEnum }          from './ScanMethodEnum'
import { TxPowerEnum }             from './TxPowerEnum'

export class RadioParams24G {
  allowedChannels?: Channel24Enum[]

  channelBandwidth: ChannelBandwidth24GEnum

  method: ScanMethodEnum

  changeInterval: number

  scanInterval: number

  txPower: TxPowerEnum

  constructor () {
    this.allowedChannels = []

    this.channelBandwidth = ChannelBandwidth24GEnum.AUTO

    this.method = ScanMethodEnum.BACKGROUND_SCANNING

    this.changeInterval = 33

    this.scanInterval = 20

    this.txPower = TxPowerEnum.MAX
  }
}
