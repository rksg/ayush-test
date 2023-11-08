
import { gql } from 'graphql-request'

import { dataApi }     from '@acx-ui/store'
import { NodesFilter } from '@acx-ui/utils'

export interface RequestPayload {
  start: string
  end: string
  query: string
  filter: NodesFilter
}
export interface NetworkListReponse {
  wifiNetworks: Network[]
}
export interface Network {
  name: string,
  apCount: number,
  clientCount: number,
  traffic: number,
  rxBytes: number,
  txBytes: number,
  zoneCount: number,
}
export const zoneWiseSearchApi = dataApi.injectEndpoints({
  endpoints: (build) => ({
    zoneWiseNetworkList: build.query<NetworkListReponse, RequestPayload>({
      query: (payload) => ({
        document: gql`
          query Network(
            $start: DateTime
            $end: DateTime
            $query: String
            $limit: Int
            $filter: FilterInput
          ) {
            network(start: $start, end: $end, filter: $filter) {
              search(start: $start, end: $end, query: $query, limit: $limit) {
                wifiNetworks {
                  name
                  apCount
                  clientCount
                  zoneCount
                  traffic
                  rxBytes
                  txBytes
                }
              }
            }
          }
        `,
        variables: payload
      }),
      providesTags: [{ type: 'Monitoring', id: 'ZONES_NETWORK_LIST' }],
      transformResponse: (response: { network: { search: NetworkListReponse } }) =>
        response.network.search
    })
  })
})

export const { useZoneWiseNetworkListQuery } = zoneWiseSearchApi
