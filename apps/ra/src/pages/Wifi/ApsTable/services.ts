
import { gql } from 'graphql-request'

import { dataApi }     from '@acx-ui/store'
import { NetworkPath } from '@acx-ui/utils'

export interface RequestPayload {
  start: string
  end: string
  query: string
}

export interface ListPayload extends RequestPayload {
    limit: number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  filter: any
}

export interface Client {
  hostname: string
  username: string
  mac: string
  osType: string
  ipAddress: string
  lastActiveTime: string
}

export interface NetworkHierarchy {
  name: string
  root: string
  type: string
  apCount: number
  networkPath: NetworkPath
  switchCount: number
}

export interface SearchResponse extends APListResponse, SwitchListResponse, NetworkListReponse {
  clients: Client[]
  networkHierarchy: NetworkHierarchy[]
}

export interface APListResponse {
    network : {
    search : Search
    }
}
export interface Search {
    aps : AP[]
}

export interface SwitchListResponse {
  switches: Switch[]
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

export interface AP {
  apName: string
  macAddress: string
  apModel: string
  ipAddress: string
  version: string
  apZone: string
  networkPath: NetworkPath
}

export interface Switch {
  switchName: string
  switchMac: string
  switchModel: string
  switchVersion: string
}

export const zoneWiseSearchApi = dataApi.injectEndpoints({
  endpoints: (build) => ({
    zoneWiseApList: build.query<APListResponse, ListPayload>({
      query: (payload) => ({
        document: gql`
        query Network(
          $start: DateTime,
          $end: DateTime,
          $query: String,
          $limit: Int,
          $rootNode: HierarchyNodeInput,
          $metric: String,
          $filter: FilterInput
        ) {
        network(start: $start, end: $end, rootNode: $rootNode, filter: $filter) {
          search(start: $start, end: $end, query: $query, limit: $limit, metric: $metric) {
            aps {
              apName,
              macAddress,
              apModel,
              ipAddress,
              version,
              apZone
              networkPath {name type}
            }
          }
        }
        }
        `,
        variables: payload
      }),
      providesTags: [{ type: 'Monitoring', id: 'ZONES_AP_LIST' }],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      transformResponse: (response : any) => response
    })
  })
})

export const {
  useZoneWiseApListQuery
} = zoneWiseSearchApi
