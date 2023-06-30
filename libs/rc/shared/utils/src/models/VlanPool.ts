export class VlanPool {
  // Tenant ID
  tenantId?: string

  // The name of the VLAN pool
  name: string

  // The description of the VLAN pool
  description?: string

  // The VLAN pool members. Expected format is a list of single and/or range of vlans, e.g.: 5, 40-50
  vlanMembers: string[]

  id?: string

  constructor () {
    this.name = ''

    this.vlanMembers = []
  }
}
