import { FacilityEnum }  from './FacilityEnum'
import { FlowLevelEnum } from './FlowLevelEnum'
import { PriorityEnum }  from './PriorityEnum'
import { ProtocolEnum }  from './ProtocolEnum'

export class VenueSyslog {
  enabled?: boolean

  server?: string

  port: number

  facility: FacilityEnum

  priority: PriorityEnum

  protocol: ProtocolEnum

  flowLevel: FlowLevelEnum

  secondaryServer?: string

  secondaryPort: number

  secondaryProtocol: ProtocolEnum

  constructor () {
    this.enabled = false

    this.port = 514

    this.facility = FacilityEnum.KEEP_ORIGINAL

    this.priority = PriorityEnum.INFO

    this.protocol = ProtocolEnum.UDP

    this.flowLevel = FlowLevelEnum.CLIENT_FLOW

    this.secondaryPort = 514

    this.secondaryProtocol = ProtocolEnum.TCP
  }
}
