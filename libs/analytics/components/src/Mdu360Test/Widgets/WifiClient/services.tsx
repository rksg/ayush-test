import { gql } from 'graphql-request'

import { dataApi }     from '@acx-ui/store'
import { NetworkPath } from '@acx-ui/utils'

interface HierarchyNodeData {
  nodes: {
    manufacturer: {
      name: string
      value: number
    }[]
    deviceType: {
      name: string
      value: number
    }[]
  }[]
}

export interface Payload {
  path: NetworkPath
  start: string
  end: string
  n: number
}

export const api = dataApi.injectEndpoints({
  endpoints: (build) => ({
    topNWifiClient: build.query<HierarchyNodeData, Payload>({
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
                nodes: topNWifiClient(n: $n) {
                  manufacturer {
                    name
                    value
                  }
                  deviceType {
                    name
                    value
                  }
                }
              }
            }
          }
          `,
        variables: {
          path: payload.path,
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

export const { useTopNWifiClientQuery } = api
