import { gql } from 'graphql-request'

import { dataApi } from '@acx-ui/store'

export interface RequestPayload {
  start: string
  end: string
}
export type Zone = {
    systemName: String
    domain: String
    zoneName: String
    apCount: Number
    clientCount: Number
}


export interface ZonesList {
  zones: Zone[]
}

export const zonesListApi = dataApi.injectEndpoints({
  endpoints: (build) => ({
    zonesList: build.query<ZonesList, RequestPayload>({
      query: (payload) => ({
        document: gql`
          query ZonesList($start: DateTime, $end: DateTime) {
            network(start: $start, end: $end) {
              zones {
                systemName
                domain
                zoneName
                apCount
                clientCount
              }
            }
          }
        `,
        variables: payload
      }),
      providesTags: [{ type: 'Monitoring', id: 'ZONES_LIST' }],
      transformResponse: (response: { network: ZonesList }) => response.network
    })
  })
})

export const { useZonesListQuery } = zonesListApi
