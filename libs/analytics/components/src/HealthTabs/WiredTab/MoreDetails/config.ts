import { IntlShape } from 'react-intl'

import { NodesFilter } from '@acx-ui/utils'

export interface PieChartResult {
  topNSwitchesByCpuUsage: TopNByCPUUsageResult[]
  topNSwitchesByDhcpFailure: TopNByDHCPFailureResult[]
  topNSwitchesByPortCongestion: TopNByPortCongestionResult[]
  topNSwitchesByStormPortCount: TopNByStormPortCountResult[]
}
export type WidgetType =
  | 'dhcpFailure'
  | 'congestion'
  | 'portStorm'
  | 'cpuUsage'

export type Switch = {
  mac: string
  name: string | null
}
export type SwitchDetails = {
  serial: string
  model: string
  status: string
  firmware: string
  numOfPorts: number
} & Switch

export type ImpactedClients = {
  switchName: string,
  switchId: string,
  switchSerial?: string,
  deviceName: string,
  deviceMac: string,
  devicePort: string,
  devicePortMac: string,
  devicePortType: string,
  isRuckusAp: boolean,
  localPortName: string,
  metricValue: number,
  metricName: string
}

export type ImpactedClientsResult = {
  wiredDevicesExpStorm: ImpactedClients[],
  wiredDevicesExpCongestion: ImpactedClients[]
}

export type TopNByCPUUsageResult = {
  cpuUtilization: number
} & SwitchDetails

export type TopNByDHCPFailureResult = {
  dhcpFailureCount: number
} & SwitchDetails

export type TopNByPortCongestionResult = {
  congestedPortCount: number
} & Switch

export type TopNByStormPortCountResult = {
  stormPortCount: number
} & Switch

export interface RequestPayload {
  filter: NodesFilter
  start: string
  end: string
  type: WidgetType
  switchIds?: string[]
  n?: number
  isMlisaVersion4110?: boolean // TODO: remove this once this version is deployed
}

export const topImpactedSwitchesLimit = 10

export const showTopNTableResult = ($t: IntlShape['$t'], count: number, limit: number) =>
  count === limit
    ? $t({ defaultMessage: 'Top {limit}' }, { limit })
    : count
