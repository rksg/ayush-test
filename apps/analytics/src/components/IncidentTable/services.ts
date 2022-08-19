import { gql } from 'graphql-request'

import { dataApi } from '@acx-ui/analytics/services'
import { 
  AnalyticsFilter,
  incidentCodes,
  Incident,
  noDataSymbol
} from '@acx-ui/analytics/utils'

import { durationValue } from './utils'

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

export type AdditionalIncidentTableFields = {
  children?: Incident[],
  duration: number,
  description: string,
  category: string,
  scope: string,
  type: string,
}

export type IncidentTableRows = Incident & AdditionalIncidentTableFields

export const transformData = (incident: Incident): IncidentTableRows => {
  const validRelatedIncidents = 
    typeof incident.relatedIncidents !== 'undefined' && incident.relatedIncidents.length > 0
  const children = validRelatedIncidents ? incident.relatedIncidents : undefined
  const duration = durationValue(incident.startTime, incident.endTime)
  const description = noDataSymbol
  const category = noDataSymbol
  const scope = noDataSymbol
  const type = noDataSymbol

  return {
    ...incident,
    children,
    duration,
    description,
    scope,
    category,
    type
  }
}

export type IncidentNodeData = IncidentTableRows[]

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
        const { incidents } = response.network.hierarchyNode
        if (typeof incidents === 'undefined') return []
        return incidents.map((incident) => transformData(incident))
      }
    })
  })
})


export const { useIncidentsListQuery } = api
