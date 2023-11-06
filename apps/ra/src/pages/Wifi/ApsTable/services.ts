
import { gql } from 'graphql-request'

import { dataApi }     from '@acx-ui/store'
import { NetworkPath } from '@acx-ui/utils'
import { NodesFilter } from '@acx-ui/utils'

export interface RequestPayload {
  start: string
  end: string
  query: string
  filter: NodesFilter
}
export interface APListResponse {
  network : {
    search : Search
  }
}
export interface Search {
    aps : AP[]
}
export interface AP {
  apName: string
  macAddress: string
  apModel: string
  ipAddress: string
  version: string
  apZone: string
  networkPath: NetworkPath
}



export const zoneWiseSearchApi = dataApi.injectEndpoints({
  endpoints: (build) => ({
    zoneWiseApList: build.query<Search, RequestPayload>({
      query: (payload) => ({
        document: gql`
          query Network(
            $start: DateTime
            $end: DateTime
            $query: String
            $limit: Int
            $rootNode: HierarchyNodeInput
            $metric: String
            $filter: FilterInput
          ) {
            network(start: $start, end: $end, rootNode: $rootNode, filter: $filter) {
              search(start: $start, end: $end, query: $query, limit: $limit, metric: $metric) {
                aps {
                  apName
                  macAddress
                  apModel
                  ipAddress
                  version
                  apZone
                  networkPath {
                    name
                    type
                  }
                }
              }
            }
          }
        `,
        variables: payload
      }),
      providesTags: [{ type: 'Monitoring', id: 'ZONES_AP_LIST' }],
      transformResponse: (response: { network: { search: Search } }) => response.network.search
    })
  })
})

export const { useZoneWiseApListQuery } = zoneWiseSearchApi
