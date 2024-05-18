import { gql } from 'graphql-request'

import { getFilterPayload } from '@acx-ui/analytics/utils'
import { dataApi }          from '@acx-ui/store'
import { NodesFilter }      from '@acx-ui/utils'

export interface PieChartResult {
  topNSwitchesByCpuUsage: TopNByCPUUsageResult[]
  topNSwitchesByDhcpFailure: TopNByDHCPFailureResult[]
}

type SwitchDetails = {
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
  type: String
}

const pieChartQuery = (type: String) => {
  switch(type){
    case 'cpu': {
      return `topNSwitchesByCpuUsage(n: $n) {
        cpuUtilization mac name serial model status firmware numOfPorts }`
    }
    case 'dhcp': {
      return `topNSwitchesByDhcpFailure(n: $n) {
        mac name dhcpFailureCount serial model status firmware numOfPorts }`
    }
    default: {
      return ''
    }
  }
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
    })
  })
})

export const {
  usePieChartDataQuery
//   useTableQuery
} = moreDetailsApi
