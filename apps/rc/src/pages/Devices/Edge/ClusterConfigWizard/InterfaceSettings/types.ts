import { Moment } from 'moment-timezone'

import { CompatibilityNodeError }                             from '@acx-ui/rc/components'
import { ClusterNetworkSettings, EdgePort, EdgeSerialNumber } from '@acx-ui/rc/utils'

import { VirtualIpFormType }            from '../../EditEdgeCluster/VirtualIp'
import { SubInterfaceSettingsFormType } from '../SubInterfaceSettings/types'

export const enum InterfaceSettingsTypeEnum {
  LAGS = 'lagSettings',
  PORTS = 'portSettings',
  SUB_INTERFACE = 'subInterfaceSettings',
  DUAL_WAN = 'dualWanSettings',
  VIRTUAL_IP = 'virtualIpSettings',
  HA_SETTING = 'haSettings'
}

// eslint-disable-next-line max-len
type FallbackSettingsType = Exclude<ClusterNetworkSettings['highAvailabilitySettings'], undefined>['fallbackSettings']

interface FallbackSettingsFormType extends Omit<FallbackSettingsType, 'schedule'> {
  schedule: Omit<FallbackSettingsType['schedule'], 'time'> & { time?: Moment }
}

export interface InterfaceSettingsFormStepProps {
      title: string
      id: InterfaceSettingsTypeEnum | 'summary'
      content: React.ReactNode
      onFinish?: boolean | ((typeKey: string, event?: React.MouseEvent) => Promise<boolean|void>)
      onValuesChange?: (changedValues: Partial<InterfaceSettingsFormType>) => void
}

export interface InterfaceSettingsFormType extends SubInterfaceSettingsFormType {
  portSettings: Record<EdgeSerialNumber, { [portId:string]: EdgePort[] }>
  lagSettings: ClusterNetworkSettings['lagSettings']
  timeout: number
  vipConfig: VirtualIpFormType['vipConfig']
  fallbackSettings: FallbackSettingsFormType
  // eslint-disable-next-line max-len
  loadDistribution: Exclude<ClusterNetworkSettings['highAvailabilitySettings'], undefined>['loadDistribution'],
  multiWanSettings: ClusterNetworkSettings['multiWanSettings']
}

export interface InterfacePortFormCompatibility {
    ports: { isError?: boolean, value: number }
    corePorts: { isError?: boolean, value: number }
    portTypes: { [portType:string]:
       { isError?: boolean, value: number } }
    totalSubInterfaceCount: { isError?: boolean, value: number }
    portSubInterfaceVlans: {
      [portId: string]: {
        vlanIds: { value: number[] }
      }
    }
    lagSubInterfaceVlans: {
      [lagId: string]: {
        vlanIds: { value: number[] }
      }
    }
}

export interface CompatibilityCheckResult {
  results: CompatibilityNodeError<InterfacePortFormCompatibility>[]
  isError: boolean
  ports: boolean
  corePorts: boolean
  portTypes: boolean
}

export interface InterfaceSettingFormStepCommonProps {
  onInit?: () => void
}