/* eslint-disable max-len */
import { ConfigStatusEnum, ConfigTypeEnum, ConfigurationBackupStatus } from '../constants'
import { ConfigurationBackup }                                         from '../types'

import { transformConfigBackupStatus, transformConfigBackupType, transformConfigStatus, transformConfigType } from './switchPipes'

describe('Switch Pipes', () => {
  it('Test transformConfigType function', async () => {
    expect(transformConfigType(ConfigTypeEnum.AAA_SERVER)).toBe('AAA Server')
    expect(transformConfigType(ConfigTypeEnum.AAA_SETTING)).toBe('AAA Setting')
    expect(transformConfigType(ConfigTypeEnum.DNS_SERVER)).toBe('DNS Server')
    expect(transformConfigType(ConfigTypeEnum.LAG_SETTINGS)).toBe('LAG Setting')
    expect(transformConfigType(ConfigTypeEnum.MODEL)).toBe('Model')
    expect(transformConfigType(ConfigTypeEnum.OVERWRITE)).toBe('Overwrite')
    expect(transformConfigType(ConfigTypeEnum.PORT_CONFIGURATION)).toBe('Port Configuration')
    expect(transformConfigType(ConfigTypeEnum.PROVISIONING)).toBe('Provisioning')
    expect(transformConfigType(ConfigTypeEnum.STACK)).toBe('Stack')
    expect(transformConfigType(ConfigTypeEnum.SYSLOG_SERVER)).toBe('Syslog Server')
    expect(transformConfigType(ConfigTypeEnum.VE_PORTS)).toBe('VE Ports')
    expect(transformConfigType(ConfigTypeEnum.CLI_PROVISIONING)).toBe('CLI Provisioning')
    expect(transformConfigType(ConfigTypeEnum.CLI_UPDATE)).toBe('CLI Update')
    expect(transformConfigType(ConfigTypeEnum.IP_CONFIG)).toBe('IP Config')
    expect(transformConfigType(ConfigTypeEnum.SPECIFIC_SETTING)).toBe('Specific Setting')
    expect(transformConfigType(ConfigTypeEnum.STATIC_ROUTE)).toBe('Static Route')
    expect(transformConfigType('VLAN')).toBe('VLAN')
    expect(transformConfigType('ACL')).toBe('ACL')
  })

  it('Test transformConfigStatus function', async () => {
    expect(transformConfigStatus(ConfigStatusEnum.SUCCESS)).toBe('Success')
    expect(transformConfigStatus(ConfigStatusEnum.FAILED)).toBe('Failed')
    expect(transformConfigStatus(ConfigStatusEnum.NO_CONFIG_CHANGE)).toBe('No Config Change')
    expect(transformConfigStatus(ConfigStatusEnum.FAILED_NO_RESPONSE)).toBe('Failed No Response')
    expect(transformConfigStatus(ConfigStatusEnum.PENDING)).toBe('Pending')
  })

  it('Test transformConfigBackupStatus function', async () => {
    expect(transformConfigBackupStatus({
      status: ConfigurationBackupStatus.SUCCESS,
      restoreStatus: ConfigurationBackupStatus.FAILED,
      failureReason: 'something error'
    } as ConfigurationBackup)).toBe('Backup restore failed (something error)')
    expect(transformConfigBackupStatus({
      status: ConfigurationBackupStatus.FAILED,
      failureReason: 'something error'
    } as ConfigurationBackup)).toBe('Backup creation failed (something error)')
  })

  it('Test transformConfigBackupType function', async () => {
    expect(transformConfigBackupType('SCHEDULED')).toBe('Automatic')
    expect(transformConfigBackupType('MANUAL')).toBe('Manual')
  })

})
