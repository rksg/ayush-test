import { CountAndNames } from '../..'

export enum SnmpNotificationTypeEnum {
  Trap = 'Trap',
  Inform = 'Inform'
}

export enum RbacSnmpNotificationTypeEnum {
  Trap = 'TRAP',
  Inform = 'INFORM'
}



export type SnmpPrivilege = {
  readPrivilege: boolean
  trapPrivilege: boolean
  notificationType?: SnmpNotificationTypeEnum
  targetAddr?: string
  targetPort?: number
}

export type RbacSnmpPrivilege = {
  // trapPrivilege
  notificationPrivilege: boolean,
  // readPrivilege
  readOnlyPrivilege: boolean,
  // notificationType, targetAddr, targetPort combine in one object.
  notificationSettings?: {
    targetIpAddress: string,
    targetPort: number,
    type: RbacSnmpNotificationTypeEnum
  }
}

export type SnmpV2Agent = SnmpPrivilege & {
  communityName: string
}

export type RbacSnmpV2Agent = RbacSnmpPrivilege & {
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

export enum RbacSnmpPrivacyProtocolEnum {
  None = 'NONE',
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

export type RbacSnmpV3Agent = RbacSnmpPrivilege & {
  userName: string
  // authProtocol
  authenticationType: SnmpAuthProtocolEnum
  // authPassword
  authenticationPassphrase: string
  // privacyProtocol
  privacyType: SnmpPrivacyProtocolEnum
  privacyPassphrase?: string
}

export type ApSnmpPolicy = {
  policyName?: string
  name?: string
  id?: string
  tenantId?: string
  snmpV2Agents: SnmpV2Agent[]
  snmpV3Agents: SnmpV3Agent[]
}

export type RbacApSnmpPolicy = {
  name: string
  id?: string
  snmpV2Agents: RbacSnmpV2Agent[]
  snmpV3Agents: RbacSnmpV3Agent[]
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
    name: string
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
    state: ApSnmpPolicy
  }
}


export function convertNotificationType (
  value: SnmpNotificationTypeEnum | RbacSnmpNotificationTypeEnum,
  sourceEnum: typeof SnmpNotificationTypeEnum | typeof RbacSnmpNotificationTypeEnum
): SnmpNotificationTypeEnum | RbacSnmpNotificationTypeEnum {
  if (sourceEnum === SnmpNotificationTypeEnum) {
    switch (value) {
      case SnmpNotificationTypeEnum.Trap:
        return RbacSnmpNotificationTypeEnum.Trap
      case SnmpNotificationTypeEnum.Inform:
        return RbacSnmpNotificationTypeEnum.Inform
      default:
        throw new Error(`Unknown SnmpNotificationTypeEnum value: ${value}`)
    }
  } else if (sourceEnum === RbacSnmpNotificationTypeEnum) {
    switch (value) {
      case RbacSnmpNotificationTypeEnum.Trap:
        return SnmpNotificationTypeEnum.Trap
      case RbacSnmpNotificationTypeEnum.Inform:
        return SnmpNotificationTypeEnum.Inform
      default:
        throw new Error(`Unknown RbacSnmpNotificationTypeEnum value: ${value}`)
    }
  } else {
    throw new Error('Unsupported enum type')
  }
}


export function convertPrivacyProtocol (
  value: SnmpPrivacyProtocolEnum | RbacSnmpPrivacyProtocolEnum,
  sourceEnum: typeof SnmpPrivacyProtocolEnum | typeof RbacSnmpPrivacyProtocolEnum
): SnmpPrivacyProtocolEnum | RbacSnmpPrivacyProtocolEnum {
  if (sourceEnum === SnmpPrivacyProtocolEnum) {
    switch (value) {
      case SnmpPrivacyProtocolEnum.None:
        return RbacSnmpPrivacyProtocolEnum.None
      case SnmpPrivacyProtocolEnum.DES:
        return RbacSnmpPrivacyProtocolEnum.DES
      case SnmpPrivacyProtocolEnum.AES:
        return RbacSnmpPrivacyProtocolEnum.AES
      default:
        throw new Error(`Unknown SnmpPrivacyProtocolEnum value: ${value}`)
    }
  } else if (sourceEnum === RbacSnmpPrivacyProtocolEnum) {
    switch (value) {
      case RbacSnmpPrivacyProtocolEnum.None:
        return SnmpPrivacyProtocolEnum.None
      case RbacSnmpPrivacyProtocolEnum.DES:
        return SnmpPrivacyProtocolEnum.DES
      case RbacSnmpPrivacyProtocolEnum.AES:
        return SnmpPrivacyProtocolEnum.AES
      default:
        throw new Error(`Unknown RbacSnmpPrivacyProtocolEnum value: ${value}`)
    }
  } else {
    throw new Error('Unsupported enum type')
  }
}

// eslint-disable-next-line max-len
export const convertRbacSnmpAgentToOldFormat = (policy: RbacApSnmpPolicy): [v2: SnmpV2Agent[], v3: SnmpV3Agent[] ] => {
  let v2Agents: SnmpV2Agent[] = []
  let v3Agents: SnmpV3Agent[] = []

  if (policy?.snmpV2Agents?.length > 0 ){
    policy?.snmpV2Agents.forEach((agent) => {
      let oldV2Agent = {
        communityName: agent.communityName,
        trapPrivilege: agent.notificationPrivilege,
        readPrivilege: agent.readOnlyPrivilege
      } as SnmpV2Agent
      if (agent.notificationSettings) {
        oldV2Agent = {
          ...oldV2Agent,
          notificationType:
          // eslint-disable-next-line max-len
            convertNotificationType(agent.notificationSettings.type, RbacSnmpNotificationTypeEnum),
          targetAddr: agent.notificationSettings.targetIpAddress,
          targetPort: agent.notificationSettings.targetPort
        } as SnmpV2Agent
      }
      v2Agents = [...v2Agents, oldV2Agent]
    })
  }

  if (policy?.snmpV3Agents?.length > 0 ){
    policy?.snmpV3Agents.forEach((agent) => {
      let oldV3Agent = {
        userName: agent.userName,
        trapPrivilege: agent.notificationPrivilege,
        readPrivilege: agent.readOnlyPrivilege,
        authProtocol: agent.authenticationType,
        authPassword: agent.authenticationPassphrase,
        privacyProtocol: convertPrivacyProtocol(agent.privacyType, RbacSnmpPrivacyProtocolEnum),
        privacyPassword: agent.privacyPassphrase
      } as SnmpV3Agent
      if (agent.notificationSettings) {
        oldV3Agent = {
          ...oldV3Agent,
          notificationType:
            // eslint-disable-next-line max-len
            convertNotificationType(agent.notificationSettings.type, RbacSnmpNotificationTypeEnum),
          targetAddr: agent.notificationSettings.targetIpAddress,
          targetPort: agent.notificationSettings.targetPort
        } as SnmpV3Agent
      }
      v3Agents = [...v3Agents, oldV3Agent]
    })
  }

  return [v2Agents, v3Agents]
}

export const convertOldPolicyToRbacFormat = (policy: ApSnmpPolicy): RbacApSnmpPolicy => {
  let v2Agents: RbacSnmpV2Agent[] = []
  let v3Agents: RbacSnmpV3Agent[] = []

  if (policy?.snmpV2Agents?.length > 0 ){
    policy?.snmpV2Agents.forEach((agent) => {
      let rbacV2Agent = {
        communityName: agent.communityName,
        notificationPrivilege: agent.trapPrivilege,
        readOnlyPrivilege: agent.readPrivilege
      } as RbacSnmpV2Agent
      if (agent.notificationType) {
        rbacV2Agent = {
          ...rbacV2Agent,
          notificationSettings: {
            type:
            convertNotificationType(agent.notificationType, SnmpNotificationTypeEnum),
            targetIpAddress: agent.targetAddr,
            targetPort: agent.targetPort
          }
        } as RbacSnmpV2Agent
      }
      v2Agents = [...v2Agents, rbacV2Agent]
    })
  }

  if (policy?.snmpV3Agents?.length > 0 ){
    policy?.snmpV3Agents.forEach((agent) => {
      let rbacV3Agent = {
        userName: agent.userName,
        notificationPrivilege: agent.trapPrivilege,
        readOnlyPrivilege: agent.readPrivilege,
        authenticationType: agent.authProtocol,
        authenticationPassphrase: agent.authPassword,
        privacyType:
        convertPrivacyProtocol(agent.privacyProtocol, SnmpPrivacyProtocolEnum),
        privacyPassphrase: agent.privacyPassword
      } as RbacSnmpV3Agent
      if (agent.notificationType) {
        rbacV3Agent = {
          ...rbacV3Agent,
          notificationSettings: {
            type:
            convertNotificationType(agent.notificationType, SnmpNotificationTypeEnum),
            targetIpAddress: agent.targetAddr,
            targetPort: agent.targetPort
          }
        } as RbacSnmpV3Agent
      }
      v3Agents = [...v3Agents, rbacV3Agent]
    })
  }

  return {
    id: policy.id,
    name: policy.name,
    snmpV2Agents: v2Agents,
    snmpV3Agents: v3Agents
  } as RbacApSnmpPolicy

}

export const asyncConvertRbacSnmpPolicyToOldFormat =
  // eslint-disable-next-line max-len
  async (policies: Promise<RbacApSnmpPolicy>[], rbacApSnmpViewModel: RbacApSnmpViewModelData[]) : Promise<ApSnmpPolicy[]> => {
    let result: ApSnmpPolicy[] = []
    const all = await Promise.all(policies)
    all.sort().filter(policy => policy !== undefined).forEach((policy)=> {
      const profile = rbacApSnmpViewModel.find((profile) => profile.id === policy.id)
      const [v2Agents, v3Agents] = convertRbacSnmpAgentToOldFormat(policy)
      let formattedData = {
        id: profile?.id,
        policyName: profile?.name,
        snmpV2Agents: v2Agents,
        snmpV3Agents: v3Agents
      } as ApSnmpPolicy
      result = [...result, formattedData]
    })
    return new Promise(resolve => resolve(result))
  }
// eslint-disable-next-line max-len
export const convertToCountAndNumber = (args: string[] | SnmpV3Agent[] | SnmpV2Agent[] | undefined): CountAndNames => {

  const emptyCountAndNames = { count: 0, names: [] } as CountAndNames

  if (!args) {
    return emptyCountAndNames
  }

  const count = args.length
  const names = args.map((arg) => {
    return (arg as SnmpV3Agent)?.userName ?? (arg as SnmpV2Agent)?.communityName ?? arg as string
  })

  return (count > 0) ? { count, names } : emptyCountAndNames
}
