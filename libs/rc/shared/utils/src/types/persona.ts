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

export interface PersonaErrorResponse {
  status: number,
  data: {
    status: string,
    timestamp?: string,
    message?: string,
    debugMessage?: string,
    subErrors?: PersonaSubError[]
  }
}

export interface PersonaSubError {
  object: string,
  field?: string,
  rejectedValue?: string,
  message: string
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
  hasMacRegistered?: boolean,     // detect whether the device is connected by MAC auth or not (Persona service provided)
  hasDpskRegistered?: boolean,    // detect whether the device is connected by DPSK passphrase or not (DPSK service provided)
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
