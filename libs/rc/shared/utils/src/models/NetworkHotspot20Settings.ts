import { Hotspot20AccessNetworkTypeEnum } from './Hotspot20AccessNetworkTypeEnum'
import { Hotspot20ConnectionCapability } from './Hotspot20ConnectionCapability'
import { Hotspot20Ipv4AddressTypeEnum } from './Hotspot20Ipv4AddressTypeEnum'

export class NetworkHotspot20Settings {
  allowInternetAccess?: boolean
  accessNetworkType?: Hotspot20AccessNetworkTypeEnum
  ipv4AddressType?: Hotspot20Ipv4AddressTypeEnum
  connectionCapability?: Hotspot20ConnectionCapability[]
}