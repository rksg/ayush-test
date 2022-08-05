export class VlanPool {
  // Tenant ID
  tenantId?: string

  // The name of the VLAN pool
  name: string

  // The description of the VLAN pool
  description?: string

  vlanMembers: string[]

  id?: string

  constructor () {
    this.name = ''

    //@Size(    max = 16 )
    this.vlanMembers = []
  }
}
