import { gql } from 'graphql-request'

import { dataApi }              from '@acx-ui/analytics/services'
import { IncidentDetailsProps } from '@acx-ui/analytics/utils'

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
      transformResponse: (response: { incident: IncidentDetailsProps }) =>
        response.incident
    })
  })
})

export const { useIncidentDetailsQuery } = api
