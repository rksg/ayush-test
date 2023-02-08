import { FacilityEnum }  from '../../models/FacilityEnum'
import { FlowLevelEnum } from '../../models/FlowLevelEnum'
import { PriorityEnum }  from '../../models/PriorityEnum'
import { ProtocolEnum }  from '../../models/ProtocolEnum'

export interface SyslogPolicyType {
  policyName: string,
  name: string,
  id?: string,
  server: string,
  port: number,
  facility?: FacilityEnum,
  priority?: PriorityEnum,
  protocol?: ProtocolEnum,
  flowLevel?: FlowLevelEnum,
  secondaryServer?: string,
  secondaryPort?: number,
  secondaryProtocol?: ProtocolEnum,
  venueIds: string[]
}
