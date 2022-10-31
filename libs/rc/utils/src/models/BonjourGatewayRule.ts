import { BridgeServiceEnum }         from './BridgeServiceEnum'
import { BridgeServiceProtocolEnum } from './BridgeServiceProtocolEnum'

export class BonjourGatewayRule {
  enabled?: boolean

  service: BridgeServiceEnum

  mdnsName?: string

  mdnsProtocol?: BridgeServiceProtocolEnum

  fromVlan: number

  toVlan: number

  constructor () {
    this.enabled = false

    this.service = BridgeServiceEnum['AIRDISK']

    this.fromVlan = 0

    this.toVlan = 0
  }
}
