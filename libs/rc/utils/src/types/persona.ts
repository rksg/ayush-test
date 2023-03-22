// https://jira-wiki.ruckuswireless.com/display/ACX/%28WIP%29+Persona+Service+HLD
export interface PersonaGroup {
  id: string,
  name: string,
  description?: string,
  tenantId?: string,
  macRegistrationPoolId?: string,
  dpskPoolId?: string,
  propertyId?: string,
  nsgId?: string,
  createdAt?: string,
  updatedAt?: string,
  personas?: Persona[],
  personaCount?: number
}

export interface Persona {
  id: string,
  name: string,
  groupId: string,
  deviceCount?: number,
  description?: string,
  tenantId?: string,
  email?: string,
  vlan?: number,
  vni?: number,
  dpskGuid?: string,
  dpskPassphrase?: string,
  devices?: PersonaDevice[],
  ethernetPorts?: PersonaEthernetPort[],
  identityId?: string,
  createdAt?: string,
  updatedAt?: string,
  switches?: PersonaSwitch[]
}

export interface PersonaSwitch {
  macAddress: string,
  portId: number,
  personaId: string
}

export interface PersonaDevice {
  macAddress: string,
  personaId: string,
  recentStatus?: string,
  hasMacRegistered?: boolean,
  lastSeenAt?: string,
  createdAt?: string,
  updatedAt?: string
}

export interface PersonaEthernetPort {
  macAddress: string,
  personaId: string,
  portIndex: number,
  name?: string,
  createdAt?: string
}
