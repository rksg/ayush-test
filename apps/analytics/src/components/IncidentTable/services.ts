import { gql } from 'graphql-request'

import { dataApi } from '@acx-ui/analytics/services'
import {
  IncidentFilter,
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
  subCategory: string,
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
    children = rawChildren.map((value) => {
      const childDuration = durationValue(incident.startTime, incident.endTime)
      const childDescription = noDataSymbol
      const childCategory = noDataSymbol
      const childSubCategory = noDataSymbol
      const childScope = noDataSymbol
      const childType = noDataSymbol

      return {
        ...value,
        children: undefined,
        duration: childDuration,
        description: childDescription,
        category: childCategory,
        scope: childScope,
        type: childType,
        subCategory: childSubCategory
      }
    })
  }

  const duration = durationValue(incident.startTime, incident.endTime)
  const description = noDataSymbol
  const category = noDataSymbol
  const subCategory = noDataSymbol
  const scope = noDataSymbol
  const type = noDataSymbol

  return {
    ...incident,
    children,
    duration,
    description,
    scope,
    category,
    subCategory,
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
