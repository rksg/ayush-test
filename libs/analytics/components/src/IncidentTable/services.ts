import { gql }               from 'graphql-request'
import moment                from 'moment-timezone'
import { MessageDescriptor } from 'react-intl'

import {
  getFilterPayload,
  IncidentFilter,
  IncidentsToggleFilter,
  incidentsToggle,
  Incident,
  transformIncidentQueryResult,
  shortDescription,
  nodeTypes,
  impactValues,
  impactedArea,
  calculateSeverity
} from '@acx-ui/analytics/utils'
import type { RecordWithChildren } from '@acx-ui/components'
import { dataApi }                 from '@acx-ui/store'
import { getIntl }                 from '@acx-ui/utils'

const durationValue = (start: string, end: string) => moment(end).diff(moment(start))

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
  impactedClientCount: number | null,
  severityLabel: string
}

export type IncidentTableRow = RecordWithChildren<Incident & AdditionalIncidentTableFields>

export const transformData = (incident: Incident): IncidentTableRow => {
  const { $t } = getIntl()
  const incidentInfo = transformIncidentQueryResult(incident)
  const impactValueObj = impactValues('client', incidentInfo)
  return {
    ...incidentInfo,
    impactedClientCount: incident.impactedClientCount,
    category: $t(incidentInfo.category),
    subCategory: $t(incidentInfo.subCategory),
    duration: durationValue(incident.startTime, incident.endTime),
    description: shortDescription(incidentInfo),
    scope: impactedArea(incident.path, incident.sliceValue)!,
    type: nodeTypes(incident.sliceType),
    clientImpact: impactValueObj['clientImpactRatioFormatted'],
    impactedClients: impactValueObj['clientImpactCountFormatted'],
    severityLabel: calculateSeverity(incident.severity)
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
    [key: string]: {
      success: boolean,
      errorMsg: string,
      errorCode: string
    }
  }
}

const getIncidentPayloadName = (index: number) => ({
  id: `incident${index}_id`,
  mute: `incident${index}_mute`,
  code: `incident${index}_code`,
  priority: `incident${index}_priority`
})

export function createToggleMuteMutation (payload: MutationPayload[]) {
  let variableDefinitions = ''
  let mutationBody = ''

  payload.forEach((_, index) => {
    const { id, mute, code, priority } = getIncidentPayloadName(index)
    variableDefinitions += `
      $${id}: String!,
      $${mute}: Boolean!,
      $${code}: String!,
      $${priority}: String!
    `
    mutationBody += `
      incident${index}: toggleMute(
        id: $${id},
        mute: $${mute},
        code: $${code},
        priority: $${priority}
      ) {
        success
        errorMsg
        errorCode
      }
    `
  })

  const mutationString = `
    mutation MutateIncident(
      ${variableDefinitions}
    ) {
      ${mutationBody}
    }
  `

  const variables = payload.reduce((acc: Record<string, string | boolean>, payload, index) => {
    const { id, mute, code, priority } = getIncidentPayloadName(index)
    acc[`${id}`] = payload.id
    acc[`${mute}`] = payload.mute
    acc[`${code}`] = payload.code
    acc[`${priority}`] = payload.priority
    return acc
  }, {})

  return {
    document: gql`${mutationString}`,
    variables: variables
  }
}

export const api = dataApi.injectEndpoints({
  endpoints: (build) => ({
    incidentsList: build.query<IncidentNodeData, IncidentFilter & IncidentsToggleFilter & {
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
          start: payload.startDate,
          end: payload.endDate,
          code: incidentsToggle(payload),
          includeMuted: payload.includeMuted ?? true,
          severity: [{ gt: 0, lte: 1 }],
          ...getFilterPayload(payload)
        }
      }),
      transformResponse: (response: Response<IncidentNodeData>) => {
        const { incidents } = response.network.hierarchyNode
        if (typeof incidents === 'undefined') return []
        return incidents.map(incident => {
          const { relatedIncidents } = incident
          const row = transformData(incident)
          if (relatedIncidents?.length) {
            row.children = relatedIncidents.map(transformData)
          }
          return row
        })
      },
      providesTags: [{ type: 'Monitoring', id: 'INCIDENTS_LIST' }]
    }),
    muteIncidents: build.mutation<MutationResponse[], MutationPayload[]>({
      query: createToggleMuteMutation,
      invalidatesTags: [
        { type: 'Monitoring', id: 'INCIDENTS_LIST' },
        { type: 'Monitoring', id: 'INCIDENT_DETAILS' }
      ]
    })
  })
})


export const { useIncidentsListQuery, useMuteIncidentsMutation } = api
