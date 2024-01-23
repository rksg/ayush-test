import { gql }  from 'graphql-request'
import { omit } from 'lodash'

import { dataApi } from '@acx-ui/store'

export interface RequestPayload {
  start: string
  end: string
}

export type Zone = {
    systemName: string
    domain?: string
    zoneName: string
    apCount: number
    clientCount: number
    network: string
    id: string
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
      transformResponse: (response: { network: ZonesList }) => ({
        zones: response.network.zones.map((zone) => ({
          ...omit(zone, zone.domain === '1||Administration Domain' ? 'domain' : ''),
          network:
            zone.domain === '1||Administration Domain'
              ? `${zone.systemName}`
              : `${zone.systemName} > ${zone.domain?.split('||')?.[1]}`,
          id: `${zone.systemName}-${zone.domain}-${zone.zoneName}`
        }))
      })
    })
  })
})

export const { useZonesListQuery } = zonesListApi
