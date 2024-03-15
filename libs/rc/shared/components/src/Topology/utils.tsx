import { hierarchy } from 'd3'
import { get }       from 'lodash'

import {
  TopologyCloud,
  TopologyAPOperational,
  TopologyAPDegraded,
  TopologyAPDisconnected,
  TopologyAPInitiate,
  TopologyAPMeshDegraded,
  TopologyAPMeshDisconnected,
  TopologyAPMeshOperational,
  TopologyAPMeshInitiate,
  TopologyAPMeshRootDegraded,
  TopologyAPMeshRootDisconnected,
  TopologyAPMeshRootInitiate,
  TopologyAPMeshRootOperational,
  TopologyAPWiredDegraded,
  TopologyAPWiredDisconnected,
  TopologyAPWiredInitiate,
  TopologyAPWiredOperational,
  TopologyStackSwitchDisconnected,
  TopologyStackSwitchInitiate,
  TopologyStackSwitchOperational,
  TopologySwitchDisconnected,
  TopologySwitchInitiate,
  TopologySwitchOperational,
  TopologyUnknown
} from '@acx-ui/icons'
import { ApDeviceStatusEnum, APMeshRole, ConnectionStatus, TopologyDeviceStatus, SwitchStatusEnum, DeviceTypes } from '@acx-ui/rc/utils'
import { getIntl }                                                                                       from '@acx-ui/utils'



export function getDeviceColor (deviceStatus: TopologyDeviceStatus
  | SwitchStatusEnum
  | ApDeviceStatusEnum) {
  switch(deviceStatus) {
    case TopologyDeviceStatus.Operational:
    case SwitchStatusEnum.OPERATIONAL:
    case ApDeviceStatusEnum.APPLYING_CONFIGURATION:
    case ApDeviceStatusEnum.OPERATIONAL:
      return 'var(--acx-semantics-green-50)'
    case TopologyDeviceStatus.Degraded:
    case ApDeviceStatusEnum.REBOOTING:
    case ApDeviceStatusEnum.HEARTBEAT_LOST:
    case ApDeviceStatusEnum.APPLYING_FIRMWARE:
      return 'var(--acx-semantics-yellow-40)'
    case ApDeviceStatusEnum.FIRMWARE_UPDATE_FAILED:
    case ApDeviceStatusEnum.CONFIGURATION_UPDATE_FAILED:
    case ApDeviceStatusEnum.DISCONNECTED_FROM_CLOUD:
    case SwitchStatusEnum.DISCONNECTED:
    case TopologyDeviceStatus.Disconnected:
      return 'var(--acx-semantics-red-70)'
    case TopologyDeviceStatus.Unknown:
    case ApDeviceStatusEnum.NEVER_CONTACTED_CLOUD:
    case ApDeviceStatusEnum.INITIALIZING:
    case ApDeviceStatusEnum.OFFLINE:
    case SwitchStatusEnum.INITIALIZING:
    case SwitchStatusEnum.NEVER_CONTACTED_CLOUD:
      return 'var(--acx-neutrals-50)'
    default: return 'var(--acx-neutrals-50)'
  }
}


export function getDeviceIcon (deviceType: DeviceTypes, deviceStatus: TopologyDeviceStatus
  | SwitchStatusEnum
  | ApDeviceStatusEnum) {
  switch(deviceType) {
    case DeviceTypes.Ap:
      switch(deviceStatus) {
        case TopologyDeviceStatus.Operational:
        case ApDeviceStatusEnum.APPLYING_CONFIGURATION:
        case ApDeviceStatusEnum.OPERATIONAL:
          return <TopologyAPOperational width={24} height={24} x={-12} y={-12} />
        case TopologyDeviceStatus.Degraded:
        case ApDeviceStatusEnum.REBOOTING:
        case ApDeviceStatusEnum.HEARTBEAT_LOST:
        case ApDeviceStatusEnum.APPLYING_FIRMWARE:
          return <TopologyAPDegraded width={24} height={24} x={-12} y={-12} />
        case TopologyDeviceStatus.Disconnected:
        case ApDeviceStatusEnum.FIRMWARE_UPDATE_FAILED:
        case ApDeviceStatusEnum.CONFIGURATION_UPDATE_FAILED:
        case ApDeviceStatusEnum.DISCONNECTED_FROM_CLOUD:
          return <TopologyAPDisconnected width={24} height={24} x={-12} y={-12} />
        case TopologyDeviceStatus.Unknown:
        case TopologyDeviceStatus.Initializing:
        case ApDeviceStatusEnum.NEVER_CONTACTED_CLOUD:
        case ApDeviceStatusEnum.INITIALIZING:
        case ApDeviceStatusEnum.OFFLINE:
          return <TopologyAPInitiate width={24} height={24} x={-12} y={-12} />
      }
      break
    case DeviceTypes.ApMesh:
      switch(deviceStatus) {
        case TopologyDeviceStatus.Operational:
        case ApDeviceStatusEnum.APPLYING_CONFIGURATION:
        case ApDeviceStatusEnum.OPERATIONAL:
          return <TopologyAPMeshOperational width={24} height={24} x={-12} y={-12} />
        case TopologyDeviceStatus.Degraded:
        case ApDeviceStatusEnum.REBOOTING:
        case ApDeviceStatusEnum.HEARTBEAT_LOST:
        case ApDeviceStatusEnum.APPLYING_FIRMWARE:
          return <TopologyAPMeshDegraded width={24} height={24} x={-12} y={-12} />
        case TopologyDeviceStatus.Disconnected:
        case ApDeviceStatusEnum.FIRMWARE_UPDATE_FAILED:
        case ApDeviceStatusEnum.CONFIGURATION_UPDATE_FAILED:
        case ApDeviceStatusEnum.DISCONNECTED_FROM_CLOUD:
          return <TopologyAPMeshDisconnected width={24} height={24} x={-12} y={-12} />
        case TopologyDeviceStatus.Unknown:
        case TopologyDeviceStatus.Initializing:
        case ApDeviceStatusEnum.NEVER_CONTACTED_CLOUD:
        case ApDeviceStatusEnum.INITIALIZING:
        case ApDeviceStatusEnum.OFFLINE:
          return <TopologyAPMeshInitiate width={24} height={24} x={-12} y={-12} />
      }
      break
    case DeviceTypes.ApMeshRoot:
      switch(deviceStatus) {
        case TopologyDeviceStatus.Operational:
        case ApDeviceStatusEnum.APPLYING_CONFIGURATION:
        case ApDeviceStatusEnum.OPERATIONAL:
          return <TopologyAPMeshRootOperational width={24} height={24} x={-12} y={-12} />
        case TopologyDeviceStatus.Degraded:
        case ApDeviceStatusEnum.REBOOTING:
        case ApDeviceStatusEnum.HEARTBEAT_LOST:
        case ApDeviceStatusEnum.APPLYING_FIRMWARE:
          return <TopologyAPMeshRootDegraded width={24} height={24} x={-12} y={-12} />
        case TopologyDeviceStatus.Disconnected:
        case ApDeviceStatusEnum.FIRMWARE_UPDATE_FAILED:
        case ApDeviceStatusEnum.CONFIGURATION_UPDATE_FAILED:
        case ApDeviceStatusEnum.DISCONNECTED_FROM_CLOUD:
          return <TopologyAPMeshRootDisconnected width={24} height={24} x={-12} y={-12} />
        case TopologyDeviceStatus.Unknown:
        case TopologyDeviceStatus.Initializing:
        case ApDeviceStatusEnum.NEVER_CONTACTED_CLOUD:
        case ApDeviceStatusEnum.INITIALIZING:
        case ApDeviceStatusEnum.OFFLINE:
          return <TopologyAPMeshRootInitiate width={24} height={24} x={-12} y={-12} />
      }
      break
    case DeviceTypes.ApWired:
      switch(deviceStatus) {
        case TopologyDeviceStatus.Operational:
        case ApDeviceStatusEnum.APPLYING_CONFIGURATION:
        case ApDeviceStatusEnum.OPERATIONAL:
          return <TopologyAPWiredOperational width={24} height={24} x={-12} y={-12} />
        case TopologyDeviceStatus.Degraded:
        case ApDeviceStatusEnum.REBOOTING:
        case ApDeviceStatusEnum.HEARTBEAT_LOST:
        case ApDeviceStatusEnum.APPLYING_FIRMWARE:
          return <TopologyAPWiredDegraded width={24} height={24} x={-12} y={-12} />
        case TopologyDeviceStatus.Disconnected:
        case ApDeviceStatusEnum.FIRMWARE_UPDATE_FAILED:
        case ApDeviceStatusEnum.CONFIGURATION_UPDATE_FAILED:
        case ApDeviceStatusEnum.DISCONNECTED_FROM_CLOUD:
          return <TopologyAPWiredDisconnected width={24} height={24} x={-12} y={-12} />
        case TopologyDeviceStatus.Unknown:
        case TopologyDeviceStatus.Initializing:
        case ApDeviceStatusEnum.NEVER_CONTACTED_CLOUD:
        case ApDeviceStatusEnum.INITIALIZING:
        case ApDeviceStatusEnum.OFFLINE:
          return <TopologyAPWiredInitiate width={24} height={24} x={-12} y={-12} />
      }
      break
    case DeviceTypes.Switch:
      switch(deviceStatus) {
        case TopologyDeviceStatus.Operational:
        case SwitchStatusEnum.OPERATIONAL:
          return <TopologySwitchOperational width={24} height={24} x={-12} y={-12} />
        case TopologyDeviceStatus.Disconnected:
          return <TopologySwitchDisconnected width={24} height={24} x={-12} y={-12} />
        case TopologyDeviceStatus.Unknown:
        case TopologyDeviceStatus.Degraded:
        case TopologyDeviceStatus.Initializing:
        case SwitchStatusEnum.INITIALIZING:
        case SwitchStatusEnum.NEVER_CONTACTED_CLOUD:
        case SwitchStatusEnum.DISCONNECTED:
          return <TopologySwitchInitiate width={24} height={24} x={-12} y={-12} />
      }
      break
    case DeviceTypes.SwitchStack:
      switch(deviceStatus) {
        case TopologyDeviceStatus.Operational:
        case SwitchStatusEnum.OPERATIONAL:
          return <TopologyStackSwitchOperational width={24} height={24} x={-12} y={-12} />
        case TopologyDeviceStatus.Disconnected:
          return <TopologyStackSwitchDisconnected width={24} height={24} x={-12} y={-12} />
        case TopologyDeviceStatus.Unknown:
        case TopologyDeviceStatus.Degraded:
        case TopologyDeviceStatus.Initializing:
        case SwitchStatusEnum.INITIALIZING:
        case SwitchStatusEnum.NEVER_CONTACTED_CLOUD:
        case SwitchStatusEnum.DISCONNECTED:
          return <TopologyStackSwitchInitiate width={24} height={24} x={-12} y={-12} />
      }
      break
    default:
      return <TopologyUnknown width={24} height={24} x={-12} y={-12} />
  }
  return <TopologyCloud width={24} height={24} x={-12} y={-12} />
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const transformData = (data: { data: any }) => {
  const root = get(data, 'data[0]', null)
  if (root !== null) {
    return hierarchy(root, (d) => d.children)
  } else {
    return null
  }
}

export const truncateLabel = (label: string, maxWidth: number) => {
  const ellipsis = '...'
  if (label.length <= maxWidth) {
    return label
  } else {
    return label.slice(0, maxWidth - ellipsis.length) + ellipsis
  }
}