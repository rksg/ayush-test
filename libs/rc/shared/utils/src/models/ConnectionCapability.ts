import { ProtocolEnum } from './ProtocolEnum'
import { StatusEnum }   from './StatusEnum'

export class ConnectionCapability {
  protocol?: ProtocolEnum
  protocolNumber?: number
  port?: number
  status?: StatusEnum
}
