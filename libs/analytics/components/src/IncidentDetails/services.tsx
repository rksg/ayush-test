import { gql } from 'graphql-request'
import _       from 'lodash'
import moment  from 'moment-timezone'

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

const incidentImpactedRange: { [key: string]: { [key: string]: number } } = {
  'p-airtime-b-24g-high': { hours: 24 },
  'p-airtime-b-5g-high': { hours: 24 },
  'p-airtime-b-6(5)g-high': { hours: 24 },
  'p-airtime-rx-24g-high': { hours: 24 },
  'p-airtime-rx-5g-high': { hours: 24 },
  'p-airtime-rx-6(5)g-high': { hours: 24 },
  'p-airtime-tx-24g-high': { hours: 24 },
  'p-airtime-tx-5g-high': { hours: 24 },
  'p-airtime-tx-6(5)g-high': { hours: 24 }
}

function assignImpactedStartEnd (incident: Incident | null): Incident | null {
  if (!incident) return incident

  const code = incident.code
  const impactedRange = incidentImpactedRange[code!]
  let impactedStartEnd = null
  if (impactedRange) {
    const impactedEnd = incident.endTime
    const impactedStart = moment(impactedEnd).subtract(impactedRange).format()
    impactedStartEnd = { impactedStart, impactedEnd }
  }
  return { ...incident, ...impactedStartEnd }
}

export const api = dataApi.injectEndpoints({
  endpoints: (build) => ({
    incidentCode: build.query<Incident | null, IncidentCodePayload>({
      query: (variables) => ({
        variables,
        document: gql`
          query IncidentCode ($id: String) { incident(id: $id) { id code startTime endTime } }
        `
      }),
      transformResponse: ({ incident }: { incident: Incident | null }) =>
        assignImpactedStartEnd(incident),
      providesTags: [{ type: 'Monitoring', id: 'INCIDENT_CODE' }]
    }),
    incidentDetails: build.query<Incident, IncidentDetailsPayload>({
      query: (variables) => ({
        variables: _.pick(variables, ['id', 'impactedStart', 'impactedEnd']),
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
        _.flow([transformIncidentQueryResult, assignImpactedStartEnd])(response.incident),
      providesTags: [{ type: 'Monitoring', id: 'INCIDENT_DETAILS' }]
    })
  })
})

export const {
  useIncidentCodeQuery,
  useIncidentDetailsQuery
} = api
