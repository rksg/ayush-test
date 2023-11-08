import { gql } from 'graphql-request'

import { dataApiSearch, dataApi } from '@acx-ui/store'
import { NodesFilter }            from '@acx-ui/utils'

export interface RequestPayload {
  start: string
  end: string
  query: string
  limit: number
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

export interface ClientList {
  clients: Client[]
}

export const clientListApi = dataApiSearch.injectEndpoints({
  endpoints: (build) => ({
    clientList: build.query<ClientList, RequestPayload>({
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
              manufacturer
            }
          }
        }
        `,
        variables: payload
      }),
      providesTags: [{ type: 'Monitoring', id: 'CLIENT_LIST' }],
      transformResponse: (response: { search: ClientList }) => response.search
    })
  })
})

export const {
  useClientListQuery
} = clientListApi

export const networkClientListApi = dataApi.injectEndpoints({
  endpoints: (build) => ({
    networkClientList: build.query<ClientList, RequestPayload>({
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
                clients {
                  hostname
                  username
                  mac
                  osType
                  ipAddress
                  lastActiveTime
                  manufacturer
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
  useNetworkClientListQuery
} = networkClientListApi

