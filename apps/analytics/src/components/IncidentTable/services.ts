import { gql }               from 'graphql-request'
import { MessageDescriptor } from 'react-intl'

import { dataApi }    from '@acx-ui/analytics/services'
import {
  IncidentFilter,
  incidentCodes,
  Incident,
  transformIncidentQueryResult,
  shortDescription,
  formattedNodeType,
  impactValues,
  impactedArea,
  calculateSeverity
} from '@acx-ui/analytics/utils'
import type { RecordWithChildren } from '@acx-ui/components'
import { getIntl }                 from '@acx-ui/utils'

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

type AdditionalIncidentTableFields = {
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

export type IncidentTableRow = RecordWithChildren<Incident & AdditionalIncidentTableFields>

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
    const childScope = impactedArea(child.path, child.sliceValue, intl)!
    const childType = formattedNodeType(child.sliceType, intl)
    const childSeverityLabel = calculateSeverity(child.severity)

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
  const scope = impactedArea(incident.path, incident.sliceValue, intl)!
  const type = formattedNodeType(incident.sliceType, intl)
  const severityLabel = calculateSeverity(incident.severity)

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

export interface MutationPayload {
  id: string,
  mute: boolean,
  code: string,
  priority: string,
}

export interface MutationResponse {
  data: {
    toogleMute: {
      success: boolean,
      errorMsg: string,
      errorCode: string
    }
  }
}

export const api = dataApi.injectEndpoints({
  endpoints: (build) => ({
    incidentsList: build.query<IncidentNodeData, IncidentFilter & {
      includeMuted?: boolean
    }>({
      query: (payload) => ({
        document: gql`
          query IncidentTableWidget(
            $path: [HierarchyNodeInput],
            $start: DateTime,
            $end: DateTime,
            $code: [String],
            $includeMuted: Boolean,
            $severity: [Range],
            $filter: FilterInput
          ) {
            network(start: $start, end: $end, filter : $filter) {
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
          includeMuted: payload.includeMuted ?? true,
          severity: [{ gt: 0, lte: 1 }],
          filter: payload?.filter
        }
      }),
      transformResponse: (response: Response<IncidentNodeData>) => {
        const { incidents } = response.network.hierarchyNode
        if (typeof incidents === 'undefined') return []
        return incidents.map((incident) => transformData(incident))
      },
      providesTags: [{ type: 'Monitoring', id: 'INCIDENTS_LIST' }]
    }),
    muteIncidents: build.mutation<MutationResponse, MutationPayload>({
      query: (payload) => ({
        document: gql`
          mutation MutateIncident(
            $id: String!,
            $mute: Boolean!,
            $code: String!,
            $priority: String!
          ){
            toggleMute (mute: $mute, code: $code, priority: $priority, id: $id) {
              success
              errorMsg
              errorCode
            }
          }
        `,
        variables: {
          id: payload.id,
          mute: payload.mute,
          code: payload.code,
          priority: payload.priority
        }
      }),
      transformResponse: (response: MutationResponse) => response,
      invalidatesTags: [{ type: 'Monitoring', id: 'INCIDENTS_LIST' }]
    })
  })
})


export const { useIncidentsListQuery, useMuteIncidentsMutation } = api
