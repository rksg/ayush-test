import { gql } from 'graphql-request'

import { dataApi } from '@acx-ui/analytics/services'

export interface ImpactedAP {
  name: string
  mac: string
  poeMode: {
    configured: string
    operating: string
    eventTime: number
    apGroup: string
  }
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
                poeMode {
                  configured
                  operating
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
