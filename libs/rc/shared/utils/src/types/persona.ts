// https://jira-wiki.ruckuswireless.com/display/ACX/%28WIP%29+Persona+Service+HLD
export interface PersonaGroup {
  id: string,
  name: string,
  description?: string,
  tenantId?: string,
  macRegistrationPoolId?: string,
  dpskPoolId?: string,
  propertyId?: string,
  personalIdentityNetworkId?: string,
  createdAt?: string,
  updatedAt?: string,
  identities?: Persona[],
  identityCount?: number,
  certificateTemplateId?: string,
  policySetId?: string
  networkCount?: number
}

export interface Persona {
  id: string,
  name: string,
  groupId: string,
  revoked: boolean,
  deviceCount?: number,
  certificateCount?: number,  // Calculate from UI
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
  meteringProfileId?: string,
  expirationEpoch?: number | null,
  expirationDate?: string | null,
  unit?: string | null,
  phoneNumber?: string
}

export interface IdentityClient {
  id: string,
  tenantId: string,
  groupId: string,
  identityId: string,
  clientMac: string,
  networkId?: string,
  sessionId?: string,
  apMac?: string,
  ssid?: string,
  username?: string,
  onboardType?: string,

  // Below fields are from ES client-index
  lastSeenAt?: string,
  os?: string,
  ip?: string,
  deviceName?: string, // aka hostname
  venueInformation?: { id: string,name: string },
  apInformation?: { serialNumber: string, name: string },
  networkInformation?: { id: string, type: string,ssid: string }
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
  online?: boolean,
  recentStatus?: string,
  hasMacRegistered?: boolean,     // detect whether the device is connected by MAC auth or not (Persona service provided)
  hasDpskRegistered?: boolean,    // detect whether the device is connected by DPSK passphrase or not (DPSK service provided)
  lastSeenAt?: string,
  createdAt?: string,
  updatedAt?: string,
  os?: string
}

export interface PersonaEthernetPort {
  macAddress: string,
  personaId: string,
  portIndex: number,
  name?: string,
  createdAt?: string
}

export interface PersonaAssociation {
  unitId: string,
  personaType: string,
  personaId: string,
  links: string[]
}
