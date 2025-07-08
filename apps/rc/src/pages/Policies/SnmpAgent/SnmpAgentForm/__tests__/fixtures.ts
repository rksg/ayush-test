import {
  SnmpAuthProtocolEnum,
  SnmpNotificationTypeEnum,
  SnmpPrivacyProtocolEnum,
  SnmpV2Agent,
  SnmpV3Agent
} from '@acx-ui/rc/utils'


export const newEmptySnmpData = {
  policyName: '',
  snmpV2Agents: [] as SnmpV2Agent[],
  snmpV3Agents: [] as SnmpV3Agent[]
}

export const mockSnmpV2Agents = [
  {
    communityName: 'joe_cn1',
    readPrivilege: true,
    trapPrivilege: false
  },
  {
    communityName: 'joe_cn2',
    readPrivilege: false,
    trapPrivilege: true,
    notificationType: SnmpNotificationTypeEnum.Inform,
    targetAddr: '192.168.0.120',
    targetPort: 162
  }
]

export const mockSnmpV3Agents = [
  {
    userName: 'joe_un1',
    readPrivilege: false,
    trapPrivilege: true,
    notificationType: SnmpNotificationTypeEnum.Trap,
    targetAddr: '192.168.0.100',
    targetPort: 162,
    authProtocol: SnmpAuthProtocolEnum.SHA,
    authPassword: '1234567aB+',
    privacyProtocol: SnmpPrivacyProtocolEnum.None
  },
  {
    userName: 'joe_un2',
    readPrivilege: true,
    trapPrivilege: false,
    notificationType: SnmpNotificationTypeEnum.Inform,
    targetPort: 162,
    authProtocol: SnmpAuthProtocolEnum.MD5,
    authPassword: '123456aB+',
    privacyProtocol: SnmpPrivacyProtocolEnum.AES,
    privacyPassword: '12345678'
  }
]