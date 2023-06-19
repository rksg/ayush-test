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
  revoked: boolean,
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
  primary?: boolean,
  identityId?: string,
  createdAt?: string,
  updatedAt?: string,
  switches?: PersonaSwitch[],
  meteringProfileId?: string | null,
  expirationEpoch?: number | null,
  expirationDate?: string | null
}

export interface PersonaSwitch {
  macAddress: string,
  portId: string,
  personaId: string
}

export interface PersonaDevice {
  macAddress: string,
  personaId: string,
  recentStatus?: string,
  hasMacRegistered?: boolean,
  lastSeenAt?: string,
  createdAt?: string,
  updatedAt?: string,
  identityId?: string
}

export interface PersonaEthernetPort {
  macAddress: string,
  personaId: string,
  portIndex: number,
  name?: string,
  createdAt?: string
}
