import { CountAndNames } from '../..'

export enum SnmpNotificationTypeEnum {
  Trap = 'Trap',
  Inform = 'Inform'
}

export type SnmpPrivilege = {
  readPrivilege: boolean
  trapPrivilege: boolean
  notificationType?: SnmpNotificationTypeEnum
  targetAddr?: string
  targetPort?: number
}

export type SnmpV2Agent = SnmpPrivilege & {
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

export type SnmpV3Agent = SnmpPrivilege & {
  userName: string
  authProtocol: SnmpAuthProtocolEnum
  authPassword: string
  privacyProtocol: SnmpPrivacyProtocolEnum
  privacyPassword?: string
}

export type ApSnmpPolicy = {
  policyName: string
  id?: string
  tenantId?: string
  snmpV2Agents: SnmpV2Agent[]
  snmpV3Agents: SnmpV3Agent[]
}

export type RbacApSnmpPolicy = {
  name: string
  id?: string
  tenantId?: string
  snmpV2Agents: SnmpV2Agent[]
  snmpV3Agents: SnmpV3Agent[]
}

export type VenueApSnmpSettings = {
  enableApSnmp: boolean
  apSnmpAgentProfileId: string
}

export type ApSnmpSettings = VenueApSnmpSettings & {
  useVenueSettings: boolean
}

export type ApSnmpApUsage = {
  apId: string
  apName: string
  venueId: string
  venueName: string
}

export type RbacApSnmpViewModelData = {
  id: string,
  name: string,
  communityNames: string[]
  userNames: string[]
  apSerialNumbers: string
  apNames: string[]
  venueIds: string[]
  venueNames: string[]
}

export type ApSnmpViewModelData = {
  id: string
  name: string
  v2Agents: CountAndNames
  v3Agents: CountAndNames
  venues: CountAndNames
  aps: CountAndNames
  tags?: string[]
}

export enum ApSnmpActionType {
  NAME = 'NAME',
  ADD_SNMP_V2 = 'ADD_SNMP_V2',
  UPDATE_SNMP_V2 = 'UPDATE_SNMP_V2',
  DELETE_SNMP_V2 = 'DELETE_SNMP_V2',
  ADD_SNMP_V3 = 'ADD_SNMP_V3',
  UPDATE_SNMP_V3 = 'UPDATE_SNMP_V3',
  DELETE_SNMP_V3 = 'DELETE_SNMP_V3',
  UPDATE_STATE = 'UPDATE_STATE'
}

export type ApSnmpActionPayload = {
  type: ApSnmpActionType.NAME,
  payload: {
    name: string,
    isUseRbacApi: boolean
  }
} | {
  type: ApSnmpActionType.ADD_SNMP_V2,
  payload: SnmpV2Agent
} | {
  type: ApSnmpActionType.UPDATE_SNMP_V2,
  payload: SnmpV2Agent & { editIndex: number }
} | {
  type: ApSnmpActionType.DELETE_SNMP_V2,
  payload: {
    names: string[]
  }
} | {
  type: ApSnmpActionType.ADD_SNMP_V3,
  payload: SnmpV3Agent
} | {
  type: ApSnmpActionType.UPDATE_SNMP_V3,
  payload: SnmpV3Agent & { editIndex: number }
} | {
  type: ApSnmpActionType.DELETE_SNMP_V3,
  payload: {
    names: string[]
  }
} | {
  type: ApSnmpActionType.UPDATE_STATE,
  payload: {
    state: ApSnmpPolicy | RbacApSnmpPolicy
  }
}
