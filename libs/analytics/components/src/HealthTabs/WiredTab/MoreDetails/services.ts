import { gql } from 'graphql-request'

import { getFilterPayload } from '@acx-ui/analytics/utils'
import { dataApi }          from '@acx-ui/store'
import { NodesFilter }      from '@acx-ui/utils'

export interface PieChartResult {
  topNSwitchesByCpuUsage: topNByCpu[]
  topNSwitchesByDhcpFailure: topNByDhcp[]
}
export type topNByCpu = {
  cpuUtilization: number
  mac: string
  name: string
  serial: string
  model: string
  status: string
  firmware: string
  numOfPorts: number
}
export type topNByDhcp = {
  dhcpFailureCount: number
  mac: string
  name: string
  serial: string
  model: string
  status: string
  firmware: string
  numOfPorts: number
}
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

export const api = dataApi.injectEndpoints({
  endpoints: (build) => ({
    pieChartData: build.query<PieChartResult, RequestPayload>({
      query: payload => {
        const innerQuery = pieChartQuery(payload.type)
        return ({
          document: gql`
          query MoreDetailsQuery(
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
} = api
