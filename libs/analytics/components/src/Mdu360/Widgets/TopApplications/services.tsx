import { gql } from 'graphql-request'

import { dataApi }     from '@acx-ui/store'
import { NetworkPath } from '@acx-ui/utils'

interface HierarchyNodeData {
  topNApplicationByClient: {
    clientCount: number
    name: string
  }[]
  topNApplicationByTraffic: {
    applicationTraffic: number
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
    mduTopNApplications: build.query<HierarchyNodeData, Payload>({
      query: (payload) => ({
        document: gql`
          query MDUTopNApplications(
            $path: [HierarchyNodeInput],
            $start: DateTime,
            $end: DateTime,
            $n: Int!
          ) {
            network(start: $start, end: $end) {
              hierarchyNode(path: $path) {
                topNApplicationByClient(n: $n) {
                  clientCount
                  name
                }
                topNApplicationByTraffic(n: $n) {
                  applicationTraffic
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

export const { useMduTopNApplicationsQuery } = api
