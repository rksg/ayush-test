import { ColumnsType } from 'antd/lib/table'

import { ApDeviceStatusEnum, ConnectionStatus, DeviceStatus, RadioProperties, SwitchStatusEnum } from '@acx-ui/rc/utils'
import { getIntl }                                                                               from '@acx-ui/utils'


export function getDeviceColor (deviceStatus: DeviceStatus
  | SwitchStatusEnum
  | ApDeviceStatusEnum) {
  switch(deviceStatus) {
    case DeviceStatus.Operational:
    case SwitchStatusEnum.OPERATIONAL:
    case ApDeviceStatusEnum.APPLYING_CONFIGURATION:
    case ApDeviceStatusEnum.APPLYING_FIRMWARE:
    case ApDeviceStatusEnum.OPERATIONAL:
      return 'var(--acx-semantics-green-50)'
    case DeviceStatus.Degraded:
    case ApDeviceStatusEnum.REBOOTING:
    case ApDeviceStatusEnum.HEARTBEAT_LOST:
      return 'var(--acx-semantics-yellow-40)'
    case ApDeviceStatusEnum.FIRMWARE_UPDATE_FAILED:
    case ApDeviceStatusEnum.CONFIGURATION_UPDATE_FAILED:
    case ApDeviceStatusEnum.DISCONNECTED_FROM_CLOUD:
    case DeviceStatus.Disconnected:
      return 'var(--acx-semantics-red-70)'
    case DeviceStatus.Unknown:
    case ApDeviceStatusEnum.NEVER_CONTACTED_CLOUD:
    case ApDeviceStatusEnum.INITIALIZING:
    case ApDeviceStatusEnum.OFFLINE:
    case SwitchStatusEnum.INITIALIZING:
    case SwitchStatusEnum.NEVER_CONTACTED_CLOUD:
    case SwitchStatusEnum.DISCONNECTED:
      return 'var(--acx-neutrals-50)'
    default: return 'var(--acx-neutrals-50)'
  }
}

export function getPathColor (connectionStatus: ConnectionStatus): string{
  switch(connectionStatus) {
    case ConnectionStatus.Good:
      return 'var(--acx-semantics-green-50)'
    case ConnectionStatus.Degraded:
      return 'var(--acx-semantics-yellow-40)'
    case ConnectionStatus.Unknown:
      return 'var(--acx-neutrals-50)'
    default:
      return 'var(--acx-neutrals-50)'
  }
}

export const switchStatus = (switchStatus: SwitchStatusEnum) => {
  const { $t } = getIntl()
  switch (switchStatus) {
    case SwitchStatusEnum.OPERATIONAL:
      return $t({ defaultMessage: 'Operational' })
    case SwitchStatusEnum.DISCONNECTED:
      return $t({ defaultMessage: 'Requires Attention' })
    case SwitchStatusEnum.NEVER_CONTACTED_CLOUD:
      return $t({ defaultMessage: 'Never contacted cloud' })
    case SwitchStatusEnum.INITIALIZING:
      return $t({ defaultMessage: 'Initializing' })
    case SwitchStatusEnum.APPLYING_FIRMWARE:
      return $t({ defaultMessage: 'Firmware updating' })
    case SwitchStatusEnum.STACK_MEMBER_NEVER_CONTACTED:
      return $t({ defaultMessage: 'Never contacted Active Switch' })
    default:
      return $t({ defaultMessage: 'Never contacted cloud' })
  }
}

export function getWirelessRadioColumns () :ColumnsType<RadioProperties> {
  const { $t } = getIntl()
  return [
    {
      title: '',
      dataIndex: 'band',
      align: 'center'
    },
    {
      title: $t({ defaultMessage: 'RF Channel' }),
      dataIndex: 'channel',
      align: 'center'
    },
    {
      title: $t({ defaultMessage: 'RF Bandwidth' }),
      dataIndex: 'operativeChannelBandwidth',
      align: 'center'
    },
    {
      title: $t({ defaultMessage: 'TX Power' }),
      dataIndex: 'txPower',
      align: 'center'
    }
  ]
}