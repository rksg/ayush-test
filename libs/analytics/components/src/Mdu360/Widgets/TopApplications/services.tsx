import { gql } from 'graphql-request'

import { dataApi }     from '@acx-ui/store'
import { NetworkPath } from '@acx-ui/utils'

interface HierarchyNodeData {
  topNApplicationByClient: {
    applicationTraffic: number
    clientCount: number
    name: string
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
    topNApplication: build.query<HierarchyNodeData, Payload>({
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
                topNApplicationByClient(n: $n) {
                  applicationTraffic
                  clientCount
                  name
                }
              }
            }
          }
          `,
        variables: payload
      }),
      transformResponse: (response: { network: { hierarchyNode: HierarchyNodeData } }) =>
        response.network.hierarchyNode
    })
  })
})

export const { useTopNApplicationQuery } = api
