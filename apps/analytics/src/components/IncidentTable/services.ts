import { gql }               from 'graphql-request'
import { MessageDescriptor } from 'react-intl'

import { dataApi } from '@acx-ui/analytics/services'
import {
  IncidentFilter,
  incidentCodes,
  Incident,
  transformIncidentQueryResult,
  shortDescription,
  formattedNodeType,
  formattedPath,
  impactValues,
  calculateSeverity,
  noDataSymbol
} from '@acx-ui/analytics/utils'
import { getIntl } from '@acx-ui/utils'

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
  duration: number,
  description: string,
  category: string | MessageDescriptor,
  subCategory: string | MessageDescriptor,
  shortDescription: string | MessageDescriptor,
  longDescription: string | MessageDescriptor,
  incidentType: string | MessageDescriptor,
  scope: string,
  type: string,
  clientImpact: string | number,
  impactedClients: string | number,
  severityLabel: string
}

export type IncidentTableRow = Incident
& AdditionalIncidentTableFields 
& {
  children?: IncidentTableRow[]
}

export const transformData = (incident: Incident): IncidentTableRow => {
  const { relatedIncidents } = incident
  const intl = getIntl()
  
  const children = relatedIncidents
  && relatedIncidents.map((child) => {
    const childDuration = durationValue(child.startTime, child.endTime)
    const childIncident = transformIncidentQueryResult(child)
    const impactValueObj = impactValues(intl, 'client', childIncident)
    const childClientImpact = impactValueObj['clientImpactRatioFormatted']
    const childClientCount = impactValueObj['clientImpactCountFormatted']
    const childDescription = shortDescription(childIncident, intl)
    const childScope = formattedPath(child.path, child.sliceValue, intl)
    const childType = formattedNodeType(child.sliceType, intl)
    const childSeverityLabel = calculateSeverity(child.severity) ?? noDataSymbol

    return {
      ...childIncident,
      category: intl.$t(childIncident.category),
      subCategory: intl.$t(childIncident.subCategory),
      children: undefined,
      duration: childDuration,
      description: childDescription,
      scope: childScope,
      type: childType,
      clientImpact: childClientImpact,
      impactedClients: childClientCount,
      severityLabel: childSeverityLabel
    }
  })

  const incidentInfo = transformIncidentQueryResult(incident)
  const duration = durationValue(incident.startTime, incident.endTime)
  const impactValueObj = impactValues(intl, 'client', incidentInfo)
  const clientImpact = impactValueObj['clientImpactRatioFormatted']
  const impactedClients = impactValueObj['clientImpactCountFormatted']
  const description = shortDescription(incidentInfo, intl)
  const scope = formattedPath(incident.path, incident.sliceValue, intl)
  const type = formattedNodeType(incident.sliceType, intl)
  const severityLabel = calculateSeverity(incident.severity) ?? noDataSymbol

  return {
    ...incidentInfo,
    category: intl.$t(incidentInfo.category),
    subCategory: intl.$t(incidentInfo.subCategory),
    children: (children && children?.length > 0) ? children : undefined,
    duration,
    description,
    scope,
    type,
    clientImpact,
    impactedClients,
    severityLabel
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
