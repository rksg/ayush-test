import { gql } from 'graphql-request'

import { dataApi }      from '@acx-ui/analytics/services'
import { GlobalFilter } from '@acx-ui/analytics/utils'

export interface NetworkNodeInfo {
  type: string,
  name: string,
  clientCount?: number,
  apCount?: number,
  switchCount?: number
}

interface Response <NetworkNodeInfo> {
  network: {
    node: NetworkNodeInfo
  }
}

export const api = dataApi.injectEndpoints({
  endpoints: (build) => ({
    networkNodeInfo: build.query<
      NetworkNodeInfo,
      GlobalFilter
    >({
      query: (payload) => ({
        document: gql`
          query Network($path: [HierarchyNodeInput], $startDate: DateTime, $endDate: DateTime) {
            network(start: $startDate, end: $endDate) {
              node: hierarchyNode(path: $path) {
                type
                name
                type
                clientCount
                apCount
                switchCount
              }
            }
          }
        `,
        variables: {
          path: payload.path,
          start: payload.startDate,
          end: payload.endDate
        }
      }),
      transformResponse: (response: Response<NetworkNodeInfo>) =>
        response.network.node
    })
  })
})

export const { networkNodeInfoQuery } = api
