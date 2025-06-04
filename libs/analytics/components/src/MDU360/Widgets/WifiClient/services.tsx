import { gql } from 'graphql-request'

import { getSelectedNodePath } from '@acx-ui/analytics/utils'
import { dataApi }             from '@acx-ui/store'
import { NodesFilter }         from '@acx-ui/utils'

interface HierarchyNodeData {
  nodes: Array<{
    osType: string
    manufacturer: string
    count: number
  }>
}

export interface TopNDeviceTypePayload {
  filter: NodesFilter
  start: string
  end: string
  n: number
}

export const api = dataApi.injectEndpoints({
  endpoints: (build) => ({
    topNDeviceType: build.query<HierarchyNodeData, TopNDeviceTypePayload>({
      query: (payload) => ({
        document: gql`
          query Network(
            $path: [HierarchyNodeInput],
            $start: DateTime,
            $end: DateTime,
            $n: Int!
          ) {
            network(start: $start, end: $end) {
              hierarchyNode(path: $path) {
                nodes: topNDeviceType(n: $n) {
                  osType
                  manufacturer
                  count
                }
              }
            }
          }
          `,
        variables: {
          path: getSelectedNodePath(payload.filter),
          start: payload.start,
          end: payload.end,
          n: payload.n
        }
      }),
      transformResponse: (response: { network: { hierarchyNode: HierarchyNodeData } }) =>
        response.network.hierarchyNode
    })
  })
})

export const { useTopNDeviceTypeQuery } = api
