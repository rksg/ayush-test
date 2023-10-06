import { gql } from 'graphql-request'

import { dataApiSearch } from '@acx-ui/store'

export interface RequestPayload {
  start: string
  end: string
  query: string
  limit: number,
  metric: string
}

export interface Switch {
  switchName: string
  switchMac: string
  switchModel: string
  switchVersion: string
}

export interface SwitchList {
  switches: Switch[]
}

export const switchListApi = dataApiSearch.injectEndpoints({
  endpoints: (build) => ({
    switchtList: build.query<SwitchList, RequestPayload>({
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
            }
          }
        }
        `,
        variables: payload
      }),
      providesTags: [{ type: 'Monitoring', id: 'SWITCH_LIST' }],
      transformResponse: (response: { search: SwitchList }) => response.search
    })
  })
})

export const {
  useSwitchtListQuery
} = switchListApi
