export enum SnmpNotificationTypeEnum {
  Trap = 'Trap',
  Inform = 'Inform'
}

export interface SnmpPrivilege {
  readPrivilege: boolean,
  trapPrivilege: boolean,
  notificationType?: SnmpNotificationTypeEnum,
  targetAddr?: string,
  targetPort?: number
}

export interface SnmpV2Agent extends SnmpPrivilege {
  communityName: string
}

export enum SnmpAuthProtocolEnum {
  SHA = 'SHA',
  MD5 = 'MD5'
}

export enum SnmpPrivacyProtocolEnum {
  None = 'None',
  DES = 'DES',
  AES = 'AES'
}

export interface SnmpV3Agent extends SnmpPrivilege {
  userName: string,
  authProtocol: SnmpAuthProtocolEnum,
  authPassword: string,
  privacyProtocol: SnmpPrivacyProtocolEnum,
  privacyPassword?: string
}

export interface ApSnmpPolicy {
  policyName: string,
  id?: string,
  tenantId?: string,
  snmpV2Agents: SnmpV2Agent[],
  snmpV3Agents: SnmpV3Agent[]
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

export interface SnmpColumnData {
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
  tags?: string[]
}
