import { ApDhcpRoleEnum } from './ApDhcpRoleEnum'
  
export class DhcpServiceAp {
  serialNumber: string

  role: ApDhcpRoleEnum
  
  // DHCP Server and Gateway IP addresses assigned from DHCP pools.
  dhcpIps?: string[]
  
  constructor () {
    this.serialNumber = ''
  
    this.role = ApDhcpRoleEnum.PrimaryServer

    this.dhcpIps = []
  }
}
  