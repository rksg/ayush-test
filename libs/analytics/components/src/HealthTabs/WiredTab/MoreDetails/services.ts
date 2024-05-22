import { gql } from 'graphql-request'

import { getFilterPayload } from '@acx-ui/analytics/utils'
import { dataApi }          from '@acx-ui/store'

import { PieChartResult, RequestPayload, WidgetType } from './config'

export const generateQuery = (type: WidgetType, detailed: boolean = false) => {
  const fieldsMap: Record<WidgetType, string> = {
    cpuUsage: 'cpuUtilization',
    dhcpFailure: 'dhcpFailureCount',
    congestion: 'congestedPortCount',
    portStorm: 'stormPortCount'
  }

  const queryMapping: Record<WidgetType, string> = {
    dhcpFailure: 'topNSwitchesByDhcpFailure',
    congestion: 'topNSwitchesByPortCongestion',
    portStorm: 'topNSwitchesByStormPortCount',
    cpuUsage: 'topNSwitchesByCpuUsage'
  }

  const field = fieldsMap[type as keyof typeof fieldsMap]
  if (!field) return ''

  const baseFields = `mac name ${field}`
  const detailedFields = `${field} mac name serial model status firmware numOfPorts`
  const queryName = queryMapping[type as keyof typeof queryMapping]

  return `${queryName}(n: $n) { ${detailed ? detailedFields : baseFields} }`
}

export const moreDetailsApi = dataApi.injectEndpoints({
  endpoints: (build) => ({
    pieChartData: build.query<PieChartResult, RequestPayload>({
      query: payload => {
        const innerQuery = generateQuery(payload.type)
        return ({
          document: gql`
          query Network(
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
        const innerQuery = generateQuery(payload.type, true)
        return ({
          document: gql`
          query Network(
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
