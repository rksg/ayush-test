import { gql } from 'graphql-request'

import { dataApi }     from '@acx-ui/store'
import { NetworkPath } from '@acx-ui/utils'

export interface ApplicationCategoriesData {
  clientCount: {
    name: string
    value: number
  }[]
  dataUsage: {
    name: string
    value: number
  }[]
}

export interface TopNApplicationCategoriesResponse {
  network: { hierarchyNode: { nodes: ApplicationCategoriesData[] } }
}

export interface Payload {
  path: NetworkPath
  start: string
  end: string
  n: number
}

export const api = dataApi.injectEndpoints({
  endpoints: (build) => ({
    topNApplicationCategories: build.query<ApplicationCategoriesData, Payload>({
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
                nodes: topNApplicationCategories(n: $n) {
                  clientCount {
                    name
                    value
                  }
                  dataUsage {
                    name
                    value
                  }
                }
              }
            }
          }
          `,
        variables: payload
      }),
      transformResponse: (response: TopNApplicationCategoriesResponse) =>
        response.network.hierarchyNode.nodes[0]
    })
  })
})

export const { useTopNApplicationCategoriesQuery } = api