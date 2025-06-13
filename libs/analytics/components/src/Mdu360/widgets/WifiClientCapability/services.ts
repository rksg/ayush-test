import { gql } from 'graphql-request'

import { dataApi } from '@acx-ui/store'

import { Mdu360Filter } from '../../types'

export type HierarchyNodeData = {
  clientCapability: ClientCapability[]
  apDistribution: ApDistribution[]
}

export type ClientCapability = {
    name: string
    value: number
}
export type ApDistribution = {
  name: string
  apCapability: string
  apCount: number
  clientCount: number
}
interface Response <T> {
  network: {
    hierarchyNode: {
      wifiClientCapability: [T]
    }
  }
}

export const api = dataApi.injectEndpoints({
  endpoints: (build) => ({
    wifiClientCapability: build.query<
      HierarchyNodeData,
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
            wifiClientCapability {
              clientCapability {
                name
                value
              }
              clientDistribution {
                name
                clientCount
                apCompatibility
                apCount
              }
            }
          }
        }
      }
        `,
        variables: {
          start: payload.start,
          end: payload.end,
          path: payload.path
        }
      }),
      transformResponse: (response: Response<HierarchyNodeData>) =>{
        return response.network.hierarchyNode.wifiClientCapability[0]
      }
    })
  })
})

export const { useWifiClientCapabilityQuery } = api
