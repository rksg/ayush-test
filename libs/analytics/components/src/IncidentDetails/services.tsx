import { gql } from 'graphql-request'

import { transformIncidentQueryResult } from '@acx-ui/analytics/utils'
import type { Incident }                from '@acx-ui/analytics/utils'
import { useParams }                    from '@acx-ui/react-router-dom'
import { dataApi }                      from '@acx-ui/store'

const detailQueryProps = {
  incident: `
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
  `
}

export const api = dataApi.injectEndpoints({
  endpoints: (build) => ({
    incidentDetails: build.query<Incident, { id: string }>({
      query: (variables) => ({
        variables,
        document: gql`
          query IncidentDetails ($id: String) {
            incident(id: $id) {
              ${detailQueryProps.incident}
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

export const { useIncidentDetailsQuery } = api

export function useIncident () {
  const { incidentId } = useParams<{ incidentId: string }>()
  return useIncidentDetailsQuery({ id: String(incidentId) })
}
