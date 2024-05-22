
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

export type SwitchName = {
  mac: string
  name: string
}
export type SwitchDetails = {
  serial: string
  model: string
  status: string
  firmware: string
  numOfPorts: number
} & SwitchName

export type TopNByCPUUsageResult = {
  cpuUtilization: number
} & SwitchDetails

export type TopNByDHCPFailureResult = {
  dhcpFailureCount: number
} & SwitchDetails

export type TopNByPortCongestionResult = {
  congestedPortCount: number
} & SwitchName

export type TopNByStormPortCountResult = {
  stormPortCount: number
} & SwitchName

export interface RequestPayload {
  filter: NodesFilter
  start: string
  end: string
  n: number
  type: WidgetType
}

export const topImpactedSwitchesLimit = 10

export const showTopResult = ($t: IntlShape['$t'], count: number, limit: number) => count === limit
  ? $t({ defaultMessage: 'Top {limit}' }, { limit })
  : count
