import { gql } from 'graphql-request'

import { getFilterPayload } from '@acx-ui/analytics/utils'
import { dataApi }          from '@acx-ui/store'
import { NodesFilter }      from '@acx-ui/utils'

export interface PieChartResult {
  topNSwitchesByCpuUsage: TopNByCPUUsageResult[]
  topNSwitchesByDhcpFailure: TopNByDHCPFailureResult[]
}

export interface WidgetType {
  type: 'dhcpFailure' | 'congestion' | 'portStorm' | 'cpuUsage' | ''
}

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
  type: WidgetType['type']
}
const pieChartQuery = (type: WidgetType['type']) => {
  const fieldsMap: Record<Exclude<WidgetType['type'], '' | 'congestion' | 'portStorm'>, string> = {
    cpuUsage: 'cpuUtilization',
    dhcpFailure: 'dhcpFailureCount'
  }

  const field = fieldsMap[type as keyof typeof fieldsMap]
  if (!field) return ''

  return `topNSwitchesBy${type.charAt(0).toUpperCase() + type.slice(1)}(n: $n) {` +
    ` mac name ${field} }`
}

const impactedSwitchesQuery = (type: WidgetType['type']) => {
  const fieldsMap: Record<Exclude<WidgetType['type'], '' | 'congestion' | 'portStorm'>, string> = {
    cpuUsage: 'cpuUtilization',
    dhcpFailure: 'dhcpFailureCount'
  }

  const field = fieldsMap[type as keyof typeof fieldsMap]
  if (!field) return ''

  return `topNSwitchesBy${type.charAt(0).toUpperCase() + type.slice(1)}(n: $n) {` +
    'mac name serial model status firmware numOfPorts }'
}

export const moreDetailsApi = dataApi.injectEndpoints({
  endpoints: (build) => ({
    pieChartData: build.query<PieChartResult, RequestPayload>({
      query: payload => {
        const innerQuery = pieChartQuery(payload.type)
        return ({
          document: gql`
          query PieChartQuery(
            $path: [HierarchyNodeInput],
            $start: DateTime,
            $end: DateTime,
            $filter: FilterInput,
            $n: Int,
            $enableSwitchFirmwareFilter: Boolean
          ) {
            network(start: $start, end: $end, filter: $filter,
              enableSwitchFirmwareFilter: $enableSwitchFirmwareFilter
            ) {
              hierarchyNode(path: $path) {
                ${innerQuery}
              }
            }
          }`,
          variables: {
            ...payload,
            ...getFilterPayload(payload),
            enableSwitchFirmwareFilter: true
          }
        })
      },
      transformResponse: (response: {
        network: { hierarchyNode: PieChartResult } }) => response.network.hierarchyNode
    }),
    impactedSwitchesData: build.query<PieChartResult, RequestPayload>({
      query: payload => {
        const innerQuery = impactedSwitchesQuery(payload.type)
        return ({
          document: gql`
          query ImpactedSwitchesQuery(
            $path: [HierarchyNodeInput],
            $start: DateTime,
            $end: DateTime,
            $filter: FilterInput,
            $n: Int,
            $enableSwitchFirmwareFilter: Boolean
          ) {
            network(start: $start, end: $end, filter: $filter,
              enableSwitchFirmwareFilter: $enableSwitchFirmwareFilter
            ) {
              hierarchyNode(path: $path) {
                ${innerQuery}
              }
            }
          }`,
          variables: {
            ...payload,
            ...getFilterPayload(payload),
            enableSwitchFirmwareFilter: true
          }
        })
      },
      transformResponse: (response: {
        network: { hierarchyNode: PieChartResult } }) => response.network.hierarchyNode
    })
  })
})

export const {
  usePieChartDataQuery,
  useImpactedSwitchesDataQuery
} = moreDetailsApi
