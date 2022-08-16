import { gql } from 'graphql-request'

import { dataApi } from '@acx-ui/analytics/services'
import { 
  AnalyticsFilter,
  incidentCodes,
  Incident
} from '@acx-ui/analytics/utils'

const listQueryProps = {
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
  `
}

export type IncidentNodeData = Incident[]

export interface Response<IncidentNodeData> {
  network: {
    hierarchyNode: {
      incidents: IncidentNodeData
    }
  }
}

export const api = dataApi.injectEndpoints({
  endpoints: (build) => ({
    incidentsList: build.query<IncidentNodeData, AnalyticsFilter>({
      query: (payload) => ({
        document: gql`
          query IncidentTableWidget(
            $path: [HierarchyNodeInput],
            $start: DateTime,
            $end: DateTime,
            $severity: [Range],
            $code: [String],
            $includeMuted: Boolean
          ) {
            network(start: $start, end: $end) {
              hierarchyNode(path: $path) {
                incidents: incidents(filter: {
                  severity: $severity,
                  code: $code,
                  includeMuted: $includeMuted
                }) {
                  ${listQueryProps.incident}
                  relatedIncidents {
                    ${listQueryProps.incident}
                  }
                }
              }
            }
          }
        `,
        variables: {
          path: payload.path,
          start: payload.startDate,
          end: payload.endDate,
          code: incidentCodes
        }
      }),
      transformResponse: (response: Response<IncidentNodeData>) => {
        return response.network.hierarchyNode.incidents.map((incident) => {
          const validRelatedIncidents = 
            typeof incident.relatedIncidents !== 'undefined' && incident.relatedIncidents.length > 0
          incident.children = validRelatedIncidents ? incident.relatedIncidents : undefined
          return incident
        })
      }
    })
  })
})


export const { useIncidentsListQuery } = api
