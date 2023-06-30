import { ApDhcpRoleEnum } from './ApDhcpRoleEnum'
import { DhcpModeEnum }   from './DhcpModeEnum'

export class DhcpApInfo {
  serialNumber: string

  dhcpApRole: ApDhcpRoleEnum

  venueId?: string

  venueDhcpEnabled?: boolean

  venueDhcpMode?: DhcpModeEnum

  constructor () {
    this.serialNumber = ''

    this.dhcpApRole = ApDhcpRoleEnum.PrimaryServer
  }
}
