import { gql } from 'graphql-request'

import { dataApi } from '@acx-ui/analytics/services'

export interface ImpactedAP {
  name: string
  mac: string
  model: string
  version: string
}

export interface ImpactedClient {
  mac: string
  manufacturer: string
  ssid: string
  hostname: string
  username: string
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
    impactedAPs: build.query<
      ImpactedAP[], RequestPayload
    >({
      query: (payload) => ({
        document: gql`
          query ImpactedAPs($id: String, $n: Int, $search: String) {
            incident(id: $id) {
              impactedAPs: getImpactedAPs(n: $n, search: $search) {
                name
                mac
                model
                version
              }
            }
          }
        `,
        variables: payload
      }),
      transformResponse: (response: Response<{ impactedAPs: ImpactedAP[] }>) =>
        response.incident.impactedAPs
    }),
    impactedClients: build.query<
      ImpactedClient[], RequestPayload
    >({
      query: (payload) => ({
        document: gql`
          query ImpactedClients($id: String, $n: Int, $search: String) {
            incident(id: $id) {
              impactedClients: getImpactedClients(n: $n, search: $search) {
                mac
                manufacturer
                ssid
                hostname
                username
              }
            }
          }
        `,
        variables: payload
      }),
      transformResponse: (response: Response<{ impactedClients: ImpactedClient[] }>) =>
        response.incident.impactedClients
    })
  })
})
export const {
  useImpactedAPsQuery,
  useImpactedClientsQuery
} = impactedApi
