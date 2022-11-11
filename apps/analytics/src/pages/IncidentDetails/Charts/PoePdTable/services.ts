import { gql } from 'graphql-request'

import { dataApi }  from '@acx-ui/analytics/services'
import { Incident } from '@acx-ui/analytics/utils'

export interface Response {
  incident: {
    impactedEntities: {
      name: string
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
