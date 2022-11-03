import { gql } from 'graphql-request'

import { dataApi } from '@acx-ui/analytics/services'

interface ImpactedApPorts {
  interface: string
  capability: string
  link: string
  eventTime: number
  apGroup: string
}

export interface ImpactedAP {
  name: string
  mac: string
  ports: ImpactedApPorts[]
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
      ImpactedAP[], RequestPayload
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
      transformResponse: (response: Response<{ impactedEntities: ImpactedAP[] }>) =>
        response.incident.impactedEntities
    })
  })
})
export const {
  useImpactedEntitiesQuery
} = impactedApi
