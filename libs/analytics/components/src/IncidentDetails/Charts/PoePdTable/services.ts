import { gql } from 'graphql-request'

import { Incident } from '@acx-ui/analytics/utils'
import { dataApi }  from '@acx-ui/store'

export interface Response {
  incident: {
    impactedEntities: {
      name: string
      serial: string
      mac: string
      ports: {
        portNumber: string
        metadata: string
      }[]
    }[]
  }
}

export interface ImpactedSwitch {
  name: string
  serial: string
  mac: string
  portNumber: string
  eventTime: string
  key: string
}

export const impactedApi = dataApi.injectEndpoints({
  endpoints: (build) => ({
    poePdTable: build.query<
      ImpactedSwitch[],
      { id: Incident['id'] }
    >({
      query: (payload) => ({
        document: gql`
          query ImpactedEntities($id: String, $n: Int, $search: String) {
            incident(id: $id) {
              impactedEntities: getImpactedSwitches(n: $n, search: $search) {
                name
                serial
                mac
                ports {
                  portNumber
                  metadata
                }
              }
            }
          }
        `,
        variables: payload
      }),
      transformResponse: (response: Response) => {
        return response.incident.impactedEntities.flatMap(datum =>
          datum.ports.flatMap((result, index) => {
            const timestamp: number = JSON.parse(result.metadata).timestamp
            return {
              name: datum.name,
              mac: datum.mac,
              serial: datum.serial,
              portNumber: result.portNumber,
              eventTime: (new Date(timestamp)).toISOString(),
              key: datum.name + index
            }
          })
        )
      }
    })
  })
})
export const {
  usePoePdTableQuery
} = impactedApi
