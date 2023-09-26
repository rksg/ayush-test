
import { gql } from 'graphql-request'

import { dataApiSearch } from '@acx-ui/store'
import { NetworkPath }   from '@acx-ui/utils'

export interface RequestPayload {
  start: string
  end: string
  query: string
  limit: number
}

export interface ListPayload extends Omit<RequestPayload, 'query'>{
  metric: string
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

export interface SearchResponse {
  clients: Client[]
  networkHierarchy: NetworkHierarchy[]
  aps: AP[]
  switches: Switch[]
}

export interface APListResponse {
  aps: AP[]
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

export const searchApi = dataApiSearch.injectEndpoints({
  endpoints: (build) => ({
    search: build.query<SearchResponse, RequestPayload>({
      query: (payload) => ({
        document: gql`
        query Search(
          $start: DateTime,
          $end: DateTime,
          $query: String,
          $limit: Int
        ) {
          search(start: $start, end: $end, query: $query, limit: $limit) {
            clients {
              hostname
              username
              mac
              osType
              ipAddress
              lastActiveTime
            },
            networkHierarchy {
              name
              root
              type
              apCount
              networkPath {name type}
              switchCount
            },
            aps {
              apName,
              macAddress,
              apModel,
              ipAddress,
              version,
              apZone
              networkPath {name type}
            },
            switches {
              switchName
              switchMac: switchId
              switchModel
              switchVersion: switchFirmware
            }
          }
        }
        `,
        variables: payload
      }),
      providesTags: [{ type: 'Monitoring', id: 'GLOBAL_SEARCH_CLIENTS' }],
      transformResponse: (response: { search: SearchResponse }) => response.search
    }),
    apList: build.query<APListResponse, RequestPayload>({
      query: (payload) => ({
        document: gql`
        query Search(
          $start: DateTime,
          $end: DateTime,
          $query: String,
          $limit: Int
        ) {
          search(start: $start, end: $end, query: $query, limit: $limit) {
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
        `,
        variables: payload
      }),
      providesTags: [{ type: 'Monitoring', id: 'AP_LIST' }],
      transformResponse: (response: { search: APListResponse }) => response.search
    })
  })
})

export const {
  useSearchQuery,
  useApListQuery

} = searchApi
