
import { IntlShape } from 'react-intl'

import { NodesFilter } from '@acx-ui/utils'

export interface PieChartResult {
  topNSwitchesByCpuUsage: TopNByCPUUsageResult[]
  topNSwitchesByDhcpFailure: TopNByDHCPFailureResult[]
}

export type WidgetType =
  | 'dhcpFailure'
  | 'congestion'
  | 'portStorm'
  | 'cpuUsage'

export type SwitchDetails = {
  mac: string
  name: string
  serial: string
  model: string
  status: string
  firmware: string
  numOfPorts: number
}

export type TopNByCPUUsageResult = {
  cpuUtilization: number
} & SwitchDetails

export type TopNByDHCPFailureResult = {
  dhcpFailureCount: number
} & SwitchDetails

export interface RequestPayload {
  filter: NodesFilter
  start: string
  end: string
  n: number
  type: WidgetType
}

export const topImpactedSwitchesLimit = 10

export const showTopResult = ($t: IntlShape['$t'], count: number, limit: number) => count >= limit
  ? $t({ defaultMessage: 'Top {limit}' }, { limit })
  : count
