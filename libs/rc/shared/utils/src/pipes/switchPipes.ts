import { getIntl } from '@acx-ui/utils'

import { BACKUP_IN_PROGRESS_TOOLTIP, ConfigStatusEnum, ConfigTypeEnum, ConfigurationBackupStatus, RESTORE_IN_PROGRESS_TOOLTIP } from '../constants'
import { ConfigurationBackup }                                                                                                  from '../types'

export function transformConfigType (type: ConfigTypeEnum | string) {
  const { $t } = getIntl()
  let transform = type
  switch (type) {
    case ConfigTypeEnum.AAA_SERVER:
      transform = $t({ defaultMessage: 'AAA Server' })
      break
    case ConfigTypeEnum.AAA_SETTING:
      transform = $t({ defaultMessage: 'AAA Setting' })
      break
    case ConfigTypeEnum.DNS_SERVER:
      transform = $t({ defaultMessage: 'DNS Server' })
      break
    case ConfigTypeEnum.DHCP_SERVER:
      transform = $t({ defaultMessage: 'DHCP Server' })
      break
    case ConfigTypeEnum.NTP_SERVER:
      transform = $t({ defaultMessage: 'NTP Server' })
      break
    case ConfigTypeEnum.LAG_SETTINGS:
      transform = $t({ defaultMessage: 'LAG Setting' })
      break
    case ConfigTypeEnum.MODEL:
      transform = $t({ defaultMessage: 'Model' })
      break
    case ConfigTypeEnum.OVERWRITE:
      transform = $t({ defaultMessage: 'Overwrite' })
      break
    case ConfigTypeEnum.PORT_CONFIGURATION:
      transform = $t({ defaultMessage: 'Port Configuration' })
      break
    case ConfigTypeEnum.PROVISIONING:
      transform = $t({ defaultMessage: 'Provisioning' })
      break
    case ConfigTypeEnum.STACK:
      transform = $t({ defaultMessage: 'Stack' })
      break
    case ConfigTypeEnum.SYSLOG_SERVER:
      transform = $t({ defaultMessage: 'Syslog Server' })
      break
    case ConfigTypeEnum.VE_PORTS:
      transform = $t({ defaultMessage: 'VE Ports' })
      break
    case ConfigTypeEnum.CLI_PROVISIONING:
      transform = $t({ defaultMessage: 'CLI Provisioning' })
      break
    case ConfigTypeEnum.CLI_UPDATE:
      transform = $t({ defaultMessage: 'CLI Update' })
      break
    case ConfigTypeEnum.IP_CONFIG:
      transform = $t({ defaultMessage: 'IP Config' })
      break
    case ConfigTypeEnum.SPECIFIC_SETTING:
      transform = $t({ defaultMessage: 'Specific Setting' })
      break
    case ConfigTypeEnum.STATIC_ROUTE:
      transform = $t({ defaultMessage: 'Static Route' })
      break
    case ConfigTypeEnum.TRIGGER_SYNC:
      transform = $t({ defaultMessage: 'Trigger Sync' })
      break
    case ConfigTypeEnum.DEFAULT_VLAN:
      transform = $t({ defaultMessage: 'Default Vlan' })
      break
    case ConfigTypeEnum.ADMIN_PASSWORD:
      transform = $t({ defaultMessage: 'Admin Password' })
      break
    case ConfigTypeEnum.VLAN:
      transform = $t({ defaultMessage: 'VLAN' })
      break
    case ConfigTypeEnum.ACL:
      transform = $t({ defaultMessage: 'ACL' })
      break
    case ConfigTypeEnum.AUTHENTICATION:
      transform = $t({ defaultMessage: 'Port Authentication' })
      break
    case ConfigTypeEnum.PORT_PROFILE:
      transform = $t({ defaultMessage: 'Port Profile' })
      break
    case ConfigTypeEnum.PORT_DISABLE_RECOVERY:
      transform = $t({ defaultMessage: 'Port Disable Recovery' })
      break
    case ConfigTypeEnum.MAC_ACL:
      transform = $t({ defaultMessage: 'MAC ACL' })
      break
  }

  return transform
}

export function transformConfigStatus (type: ConfigStatusEnum | string) {
  const { $t } = getIntl()
  let transform = type
  switch (type) {
    case ConfigStatusEnum.SUCCESS:
      transform = $t({ defaultMessage: 'Success' })
      break
    case ConfigStatusEnum.FAILED:
      transform = $t({ defaultMessage: 'Failed' })
      break
    case ConfigStatusEnum.NO_CONFIG_CHANGE:
      transform = $t({ defaultMessage: 'No Config Change' })
      break
    case ConfigStatusEnum.NOTIFY_IN_PROGRESS:
      transform = $t({ defaultMessage: 'Notify In Progress' })
      break
    case ConfigStatusEnum.NOTIFY_SUCCESS:
      transform = $t({ defaultMessage: 'Notify Success' })
      break
    case ConfigStatusEnum.FAILED_NO_RESPONSE:
      transform = $t({ defaultMessage: 'Failed No Response' })
      break
    case ConfigStatusEnum.PENDING:
      transform = $t({ defaultMessage: 'Pending' })
      break
    case ConfigStatusEnum.IN_PROGRESS:
      transform = $t({ defaultMessage: 'In Progress' })
      break
    case ConfigStatusEnum.SWITCH_NOT_FOUND:
      transform = $t({ defaultMessage: 'Switch Not Found' })
      break
  }

  return transform
}

export const transformConfigBackupStatus = (data: ConfigurationBackup) => {
  const { $t } = getIntl()
  const { status, restoreStatus, failureReason } = data
  let text = ''
  const restoreMap = {
    PENDING: $t(RESTORE_IN_PROGRESS_TOOLTIP),
    STARTED: $t(RESTORE_IN_PROGRESS_TOOLTIP),
    SUCCESS: $t({ defaultMessage: 'Backup restored successfully' }),
    FAILED: $t({ defaultMessage: 'Backup restore failed' })
  }
  const backupMap = {
    PENDING: $t(BACKUP_IN_PROGRESS_TOOLTIP),
    STARTED: $t(BACKUP_IN_PROGRESS_TOOLTIP),
    SUCCESS: $t({ defaultMessage: 'Backup created successfully' }),
    FAILED: $t({ defaultMessage: 'Backup creation failed' })
  }
  if (restoreMap[restoreStatus]) {
    text = restoreMap[restoreStatus]
    if (restoreStatus === ConfigurationBackupStatus.FAILED && failureReason) {
      text += ` (${failureReason})`
    }
  } else {
    text = backupMap[status]
    if (status === ConfigurationBackupStatus.FAILED && failureReason) {
      text += ` (${failureReason})`
    }
  }
  return text
}

export const transformConfigBackupType = (type:string) => {
  const { $t } = getIntl()
  if (type === 'SCHEDULED') {
    return $t({ defaultMessage: 'Automatic' })
  } else {
    return $t({ defaultMessage: 'Manual' })
  }
}
