import { Hotspot20AccessNetworkTypeEnum }          from './Hotspot20AccessNetworkTypeEnum'
import { Hotspot20ConnectionCapability }           from './Hotspot20ConnectionCapability'
import { Hotspot20ConnectionCapabilityStatusEnum } from './Hotspot20ConnectionCapabilityStatusEnum'
import { Hotspot20Ipv4AddressTypeEnum }            from './Hotspot20Ipv4AddressTypeEnum'

export class NetworkHotspot20Settings {
  allowInternetAccess?: boolean
  accessNetworkType?: Hotspot20AccessNetworkTypeEnum
  ipv4AddressType?: Hotspot20Ipv4AddressTypeEnum
  connectionCapabilities?: Hotspot20ConnectionCapability[]
  wifiOperator?: string
  identityProviders?: string[]
  accProviders?: Set<string>

  // operator only allow to activate once
  originalOperator?: string | null      // for editMode

  // identity provider only allow to activate same provider once
  originalProviders?: string[]           // for editMode

  constructor () {
    this.allowInternetAccess = true
    this.accessNetworkType = 'PRIVATE' as Hotspot20AccessNetworkTypeEnum
    this.ipv4AddressType = 'SINGLE_NATED_PRIVATE' as Hotspot20Ipv4AddressTypeEnum
    this.connectionCapabilities = [
      {
        protocol: 'ICMP',
        protocolNumber: 1,
        port: 0,
        status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
      },
      {
        protocol: 'FTP',
        protocolNumber: 6,
        port: 20,
        status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
      },
      {
        protocol: 'SSH',
        protocolNumber: 6,
        port: 22,
        status: Hotspot20ConnectionCapabilityStatusEnum.OPEN
      },
      {
        protocol: 'HTTP',
        protocolNumber: 6,
        port: 80,
        status: Hotspot20ConnectionCapabilityStatusEnum.OPEN
      },
      {
        protocol: 'Used by TLS VPN',
        protocolNumber: 6,
        port: 443,
        status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
      },
      {
        protocol: 'Used by PPTP VPNs',
        protocolNumber: 6,
        port: 1723,
        status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
      },
      {
        protocol: 'VoIP',
        protocolNumber: 6,
        port: 5060,
        status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
      },
      {
        protocol: 'VoIP',
        protocolNumber: 17,
        port: 5060,
        status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
      },
      {
        protocol: 'Used by IKEv2 (IPsec VPN)',
        protocolNumber: 17,
        port: 500,
        status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
      },
      {
        protocol: 'IPsec VPN',
        protocolNumber: 17,
        port: 4500,
        status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
      },
      {
        protocol: 'ESP',
        protocolNumber: 50,
        port: 0,
        status: Hotspot20ConnectionCapabilityStatusEnum.CLOSED
      }
    ] as Hotspot20ConnectionCapability[]
  }
}