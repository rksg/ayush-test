
import { Channel6GEnum }          from './Channel6GEnum'
import { ChannelBandwidth6GEnum } from './ChannelBandwidth6GEnum'
import { ScanMethodEnum }         from './ScanMethodEnum'
import { TxPowerEnum }            from './TxPowerEnum'

export class RadioParams6G {
  method: ScanMethodEnum

  allowedChannels?: Channel6GEnum[]

  channelBandwidth: ChannelBandwidth6GEnum

  changeInterval: number

  scanInterval: number

  txPower: TxPowerEnum

  constructor () {
    this.method = ScanMethodEnum.CHANNELFLY

    this.allowedChannels = []

    this.channelBandwidth = ChannelBandwidth6GEnum.AUTO

    this.changeInterval = 33

    this.scanInterval = 20

    this.txPower = TxPowerEnum.MAX
  }
}
