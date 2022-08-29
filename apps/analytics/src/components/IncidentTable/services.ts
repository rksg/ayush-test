import { gql }               from 'graphql-request'
import { MessageDescriptor } from 'react-intl'

import { dataApi }               from '@acx-ui/analytics/services'
import {
  IncidentFilter,
  incidentCodes,
  Incident,
  noDataSymbol,
  transformIncidentQueryResult
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
  description: string | MessageDescriptor,
  category: string | MessageDescriptor,
  subCategory: string | MessageDescriptor,
  shortDescription: string | MessageDescriptor,
  longDescription: string | MessageDescriptor,
  incidentType: string | MessageDescriptor,
  scope: string,
  type: string,
}

export type IncidentTableRow = Incident & AdditionalIncidentTableFields

export const transformData = (incident: Incident): IncidentTableRow => {
  
  const validRelatedIncidents =
    typeof incident.relatedIncidents !== 'undefined' && incident.relatedIncidents.length > 0
  const rawChildren = validRelatedIncidents ? incident.relatedIncidents : undefined
  let children = undefined
  if (typeof rawChildren !== 'undefined') {
    children = rawChildren.map((child) => {
      const childDuration = durationValue(child.startTime, child.endTime)
      const childDescription = noDataSymbol
      const childScope = noDataSymbol
      const childType = noDataSymbol
      const childIncident = transformIncidentQueryResult(child)

      return {
        ...childIncident,
        children: undefined,
        duration: childDuration,
        description: childDescription,
        scope: childScope,
        type: childType
      }
    })
  }
  const incidentInfo = transformIncidentQueryResult(incident)
  const duration = durationValue(incident.startTime, incident.endTime)
  const description = noDataSymbol
  const scope = noDataSymbol
  const type = noDataSymbol

  return {
    ...incidentInfo,
    children,
    duration,
    description,
    scope,
    type
  }
}

export type IncidentNodeData = IncidentTableRow[]

export interface Response<IncidentNodeData> {
  network: {
    hierarchyNode: {
      incidents: IncidentNodeData
    }
  }
}

export const api = dataApi.injectEndpoints({
  endpoints: (build) => ({
    incidentsList: build.query<IncidentNodeData, IncidentFilter>({
      query: (payload) => ({
        document: gql`
          query IncidentTableWidget(
            $path: [HierarchyNodeInput],
            $start: DateTime,
            $end: DateTime,
            $code: [String],
            $includeMuted: Boolean,
            $severity: [Range]
          ) {
            network(start: $start, end: $end) {
              hierarchyNode(path: $path) {
                incidents: incidents(
                  filter: {
                    severity: $severity,
                    code: $code,
                    includeMuted: $includeMuted,
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
          code: payload.code ?? incidentCodes,
          includeMuted: true,
          severity: [{ gt: 0, lte: 1 }]
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
