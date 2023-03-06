export enum SnmpNotificationTypeEnum {
  Trap,
  Inform
}

export interface SnmpPrivilege {
  readPrivilege: boolean,
  trapPrivilege: boolean,
  notificationType: SnmpNotificationTypeEnum,
  targetAddr: string,
  targetPort: number
}

export interface SnmpV2Agents extends SnmpPrivilege {
  communityName: string
}

export enum SnmpAuthProtocolEnum {
  SHA,
  MD5
}

export enum SnmpPrivacyProtocolEnum {
  None,
  DES,
  AES
}

export interface SnmpV3Agents extends SnmpPrivilege {
  userName: string,
  authProtocol: SnmpAuthProtocolEnum,
  authPassword: string,
  privacyProtocol: SnmpPrivacyProtocolEnum,
  privacyPassword: string
}

export interface ApSnmpProfile {
  policyName: string,
  id?: string,
  tenantId?: string,
  snmpV2Agents: SnmpV2Agents[],
  snmpV3Agents: SnmpV3Agents[]
}

export interface VenueApSnmpSettings {
  enableApSnmp: boolean,
  apSnmpAgentProfileId: string
}

export interface ApSnmpSettings extends VenueApSnmpSettings {
  useVenueSettings: boolean
}

export interface ApSnmpApUsage {
  apId: string,
  apName: string,
  venueId: string,
  venueName: string
}

interface SnmpColumnData {
  count: number,
  names: string[]
}

export interface ApSnmpViewModelData {
  id: string,
  name: string,
  v2Agents: SnmpColumnData,
  v3Agents: SnmpColumnData,
  venues: SnmpColumnData,
  aps: SnmpColumnData,
  tags: string[]
}
