
import { gql } from 'graphql-request'

import { dataApiSearch, dataApi }   from '@acx-ui/store'
import { NetworkPath, NodesFilter } from '@acx-ui/utils'

export interface RequestPayload {
  start: string
  end: string
  query: string
  limit: number,
  isReportOnly?: boolean
}

export interface ListPayload extends RequestPayload {
  metric?: string
  filter?: NodesFilter
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
  aps: AP[]
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
  traffic: number
  networkPath: NetworkPath
}

export interface Switch {
  switchName: string
  switchMac: string
  switchModel: string
  switchVersion: string
  traffic: number
}

export interface ClientByTraffic {
  hostname: string
  username: string
  mac: string
  osType: string
  ipAddress: string
  lastSeen: string
  traffic: number
}

export interface ClientList {
  clientsByTraffic: ClientByTraffic[]
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
            aps {
              apName,
              macAddress,
              apModel,
              ipAddress,
              version,
              apZone
              networkPath {name type}
            },
            networkHierarchy {
              name
              root
              type
              apCount
              networkPath {name type}
              switchCount
            },
            clients {
              hostname
              username
              mac
              osType
              ipAddress
              lastActiveTime
              manufacturer
            }
            ${payload.isReportOnly
          ? ''
          : `
            ,
            switches {
              switchName
              switchMac: switchId
              switchModel
              switchVersion: switchFirmware
            },
            wifiNetworks {
              name
              apCount
              clientCount
              zoneCount
              traffic
              rxBytes
              txBytes
            }
              `}
          }
        }
        `,
        variables: payload
      }),
      providesTags: [{ type: 'Monitoring', id: 'GLOBAL_SEARCH_CLIENTS' }],
      transformResponse: (response: { search: SearchResponse }) => response.search
    }),
    switchtList: build.query<SwitchListResponse, ListPayload>({
      query: (payload) => ({
        document: gql`
        query Search(
          $start: DateTime,
          $end: DateTime,
          $query: String,
          $metric: String,
          $limit: Int
        ) {
          search(start: $start, end: $end, query: $query, metric: $metric, limit: $limit) {
            switches {
              switchName
              switchMac: switchId
              switchModel
              switchVersion: switchFirmware
              traffic
            }
          }
        }
        `,
        variables: payload
      }),
      providesTags: [{ type: 'Monitoring', id: 'SWITCH_LIST' }],
      transformResponse: (response: { search: SwitchListResponse }) => response.search
    })
  })
})
export const networkSearchApi = dataApi.injectEndpoints({
  endpoints: (build) => ({
    apList: build.query<APListResponse, ListPayload>({
      query: (payload) => ({
        document: gql`
        query Network(
          $start: DateTime
          $end: DateTime
          $query: String
          $limit: Int
          $filter: FilterInput
          $metric: String
        ) {
          network(start: $start, end: $end, filter: $filter) {
            search(start: $start, end: $end, query: $query, limit: $limit, metric: $metric) {
              aps {
                apName
                macAddress
                apModel
                ipAddress
                version
                apZone
                traffic
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
      providesTags: [{ type: 'Monitoring', id: 'AP_LIST' }],
      transformResponse: (response: { network: { search: APListResponse } }) =>
        response.network.search
    }),
    networkList: build.query<NetworkListReponse, ListPayload>({
      query: (payload) => ({
        document: gql`
        query Network(
          $start: DateTime
          $end: DateTime
          $query: String
          $limit: Int
          $filter: FilterInput
          $metric: String
        ) {
          network(start: $start, end: $end, filter: $filter) {
            search(start: $start, end: $end, query: $query, limit: $limit, metric: $metric) {
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
      providesTags: [{ type: 'Monitoring', id: 'NETWORK_LIST' }],
      transformResponse: (response: { network: { search: NetworkListReponse } }) =>
        response.network.search
    }),
    networkClientList: build.query<ClientList, ListPayload>({
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
                clientsByTraffic {
                  hostname
                  username
                  mac
                  osType
                  ipAddress
                  lastSeen
                  manufacturer
                  traffic
                }
              }
            }
          }
        `,
        variables: payload
      }),
      providesTags: [{ type: 'Monitoring', id: 'ZONES_CLIENT_LIST' }],
      transformResponse: (response: { network: { search: ClientList } }) => response.network.search
    })
  })
})

export const {
  useSearchQuery,
  useSwitchtListQuery
} = searchApi
export const {
  useApListQuery,
  useNetworkListQuery,
  useNetworkClientListQuery
} = networkSearchApi
