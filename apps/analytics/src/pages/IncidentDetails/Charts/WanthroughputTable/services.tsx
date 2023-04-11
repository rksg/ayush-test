import { gql } from 'graphql-request'

import { Incident } from '@acx-ui/analytics/utils'
import { dataApi }  from '@acx-ui/store'

export interface Response {
  incident: {
    impactedEntities: {
      name: string
      mac: string
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
