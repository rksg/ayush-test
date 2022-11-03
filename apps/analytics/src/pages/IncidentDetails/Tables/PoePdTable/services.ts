import { gql } from 'graphql-request'

import { dataApi } from '@acx-ui/analytics/services'

interface ImpactedSwitchPorts {
  portNumber: string
  metadata: string
}

export interface ImpactedSwitch {
  name: string
  mac: string
  ports: ImpactedSwitchPorts[]
}

export interface RequestPayload {
  id: string
  search: string
  n: number
}

interface Response <T> {
  incident: T
}

export const impactedApi = dataApi.injectEndpoints({
  endpoints: (build) => ({
    impactedEntities: build.query<
      ImpactedSwitch[], RequestPayload
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
      transformResponse: (response: Response<{ impactedEntities: ImpactedSwitch[] }>) =>
        response.incident.impactedEntities
    })
  })
})
export const {
  useImpactedEntitiesQuery
} = impactedApi
