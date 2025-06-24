import { gql } from 'graphql-request'

import { dataApi } from '@acx-ui/store'

import { Mdu360Filter } from '../../types'
export interface ApDistribution {
  apWifiCapability: string
  clientCapability: string
  apCount: number
  clientCount: number
}
export interface HierarchyNodeData {
  apWifiCapabilityDistribution: ApDistribution[]
}
interface Response <T> {
  network: {
    hierarchyNode: T
  }
}

export const api = dataApi.injectEndpoints({
  endpoints: (build) => ({
    WifiGeneration: build.query<
      ApDistribution[],
      Mdu360Filter
    >({
      query: (payload) => ({
        document: gql`
       query Network(
        $path: [HierarchyNodeInput],
        $start: DateTime,
        $end: DateTime
      ) {
        network(start: $start, end: $end) {
          hierarchyNode(path: $path) {
            apWifiCapabilityDistribution {
              apWifiCapability
              clientCapability
              apCount
              clientCount
            }
          }
        }
      }
        `,
        variables: payload
      }),
      transformResponse: (response: Response<HierarchyNodeData>) =>{
        return response.network.hierarchyNode.apWifiCapabilityDistribution ?? []
      }
    })
  })
})

export const { useWifiGenerationQuery } = api
