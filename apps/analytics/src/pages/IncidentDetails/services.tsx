import { gql } from 'graphql-request'

import { dataApi }   from '@acx-ui/analytics/services'
import { Incident }  from '@acx-ui/analytics/utils'
import { useParams } from '@acx-ui/react-router-dom'

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
    incidentDetails: build.query({
      query: (payload) => ({
        document: gql`
        query IncidentDetails ($id: String) {
          incident(id: $id) {
            ${detailQueryProps.incident}
          }
        }
      `,
        variables: {
          id: payload.id
        }
      }),
      transformResponse: (response: { incident: Incident }) =>
        response.incident
    })
  })
})

export const { useIncidentDetailsQuery } = api

export function useIncident () {
  const { incidentId: id } = useParams()
  return useIncidentDetailsQuery({ id })
}
