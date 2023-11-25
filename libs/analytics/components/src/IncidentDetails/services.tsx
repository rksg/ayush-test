import { gql } from 'graphql-request'

import { transformIncidentQueryResult } from '@acx-ui/analytics/utils'
import type { Incident }                from '@acx-ui/analytics/utils'
import { dataApi }                      from '@acx-ui/store'

interface IncidentCodePayload {
  id: string
}

interface IncidentDetailsPayload extends IncidentCodePayload {
  impactedStart?: string
  impactedEnd?: string
}

export const api = dataApi.injectEndpoints({
  endpoints: (build) => ({
    incidentCode: build.query<Incident, IncidentCodePayload>({
      query: (variables) => ({
        variables,
        document: gql`
          query IncidentCode ($id: String) {
            incident(id: $id) {
              code
              startTime
              endTime
            }
          }
        `
      }),
      transformResponse: (response: { incident: Incident }) => response.incident,
      providesTags: [{ type: 'Monitoring', id: 'INCIDENT_CODE' }]
    }),
    incidentDetails: build.query<Incident, IncidentDetailsPayload>({
      query: (variables) => ({
        variables,
        document: gql`
          query IncidentDetails ($id: String, $impactedStart: DateTime, $impactedEnd: DateTime) {
            incident(id: $id, impactedStart: $impactedStart, impactedEnd: $impactedEnd) {
              severity
              startTime
              endTime
              code
              sliceType
              sliceValue
              id
              path { type name }
              metadata
              clientCount
              impactedClientCount
              isMuted
              mutedBy
              mutedAt
              slaThreshold
              currentSlaThreshold
              apCount
              impactedApCount
              switchCount
              vlanCount
              connectedPowerDeviceCount
            }
          }
        `
      }),
      transformResponse: (response: { incident: Incident }) =>
        transformIncidentQueryResult(response.incident),
      providesTags: [{ type: 'Monitoring', id: 'INCIDENT_DETAILS' }]
    })
  })
})

export const {
  useIncidentCodeQuery,
  useIncidentDetailsQuery
} = api
