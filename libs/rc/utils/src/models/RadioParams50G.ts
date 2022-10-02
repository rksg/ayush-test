import { Channel50Enum }          from './Channel50Enum'
import { ChannelBandwidth5GEnum } from './ChannelBandwidth5GEnum'
import { ScanMethodEnum }         from './ScanMethodEnum'
import { TxPowerEnum }            from './TxPowerEnum'
  
export class RadioParams50G {
  allowedIndoorChannels?: Channel50Enum[]
  
  allowedOutdoorChannels?: Channel50Enum[]
  
  channelBandwidth: ChannelBandwidth5GEnum
  
  method: ScanMethodEnum

  changeInterval: number

  scanInterval: number

  txPower: TxPowerEnum

  constructor () {
    this.allowedIndoorChannels = []
  
    this.allowedOutdoorChannels = []
  
    this.channelBandwidth = ChannelBandwidth5GEnum.AUTO
  
    this.method = ScanMethodEnum.BACKGROUND_SCANNING
  
    this.changeInterval = 33
  
    this.scanInterval = 20
  
    this.txPower = TxPowerEnum.MAX
  }
}
  