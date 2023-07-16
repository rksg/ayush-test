
import { ApDeviceStatusEnum, APMeshRole, ConnectionStatus, DeviceStatus, SwitchStatusEnum } from '@acx-ui/rc/utils'
import { getIntl }                                                                          from '@acx-ui/utils'


export function getDeviceColor (deviceStatus: DeviceStatus
  | SwitchStatusEnum
  | ApDeviceStatusEnum) {
  switch(deviceStatus) {
    case DeviceStatus.Operational:
    case SwitchStatusEnum.OPERATIONAL:
    case ApDeviceStatusEnum.APPLYING_CONFIGURATION:
    case ApDeviceStatusEnum.OPERATIONAL:
      return 'var(--acx-semantics-green-50)'
    case DeviceStatus.Degraded:
    case ApDeviceStatusEnum.REBOOTING:
    case ApDeviceStatusEnum.HEARTBEAT_LOST:
    case ApDeviceStatusEnum.APPLYING_FIRMWARE:
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
      return $t({ defaultMessage: 'Disconnected' })
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

export function getMeshRole (meshRole: APMeshRole) {
  const { $t } = getIntl()

  switch(meshRole) {
    case APMeshRole.RAP: return $t({ defaultMessage: 'Root AP' })
    case APMeshRole.MAP: return $t({ defaultMessage: 'Mesh AP' })
    case APMeshRole.EMAP: return $t({ defaultMessage: 'eMesh AP' })
    case APMeshRole.DISABLED: return $t({ defaultMessage: 'disabled' })
  }

}
