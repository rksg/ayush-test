import { gql } from 'graphql-request'

import { dataApiSearch } from '@acx-ui/store'

export interface RequestPayload {
  start: string
  end: string
  query: string
  limit: number
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
