import { gql } from 'graphql-request'

import { dataApi }  from '@acx-ui/analytics/services'
import { Incident } from '@acx-ui/analytics/utils'

export interface Response {
  incident: {
    impactedEntities: {
      name: string
      mac: string
      serial: string
      ports: {
        interface: string
        capability: string
        link: string
        eventTime: number
        apGroup: string
      }[]
    }[]
  }
}

export interface ImpactedAP {
  name: string
  mac: string
  serial: string
  interface: string
  capability: string
  link: string
  eventTime: string
  apGroup: string
  key: string
}

export const impactedApi = dataApi.injectEndpoints({
  endpoints: (build) => ({
    wanthroughputTable: build.query<
      ImpactedAP[],
      { id: Incident['id'] }
    >({
      query: (payload) => ({
        document: gql`
          query ImpactedEntities($id: String, $n: Int, $search: String) {
            incident(id: $id) {
              impactedEntities: getImpactedAPs(n: $n, search: $search) {
                name
                mac
                serial
                ports {
                  interface
                  capability
                  link
                  eventTime
                  apGroup
                }
              }
            }
          }
        `,
        variables: payload
      }),
      transformResponse: (response: Response) => {
        return response.incident.impactedEntities.flatMap(datum =>
          datum.ports.flatMap((result, index) => ({
            name: datum.name,
            mac: datum.mac,
            serial: datum.serial,
            interface: result.interface,
            capability: result.capability,
            link: result.link,
            eventTime: (new Date(result.eventTime)).toISOString(),
            apGroup: result.apGroup,
            key: datum.name + index
          }))
        )
      }
    })
  })
})
export const {
  useWanthroughputTableQuery
} = impactedApi
