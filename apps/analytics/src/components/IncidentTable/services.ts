import { gql } from 'graphql-request'

import { dataApi }                  from '@acx-ui/analytics/services'
import { GlobalFilter, Severities } from '@acx-ui/analytics/utils'
import { incidentCodes }            from '@acx-ui/analytics/utils'

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

interface IncidentPath {
  name: string
  type: string
}

interface IncidentApModel {
  AP_MODEL: boolean | string
  CCD_REASON_DEAUTH_LEAVING?: boolean | string
  CLIENT_OS_MFG: boolean | string
  FW_VERSION: boolean | string
}

interface IncidentMetadata {
  dominant: {
    ssid: string
  }
  rootCauseChecks: {
    checks: IncidentApModel[]
    params: IncidentApModel
  }

}

export interface IncidentNodeInfo {
  severity?: number
  clientCount?: number
  code?: string
  id: string
  impactedClientCount?: number
  isMuted?: boolean
  relatedIncidents?: IncidentNodeInfo[]
  sliceType?: string
  sliceValue?: string
  startTime?: string
  endTime?: string
  mutedAt?: string | null
  mutedBy?: string | null
  path: IncidentPath[]
  metadata: IncidentMetadata
  children?: IncidentNodeInfo[]
}

export type IncidentNodeData = IncidentNodeInfo[]

interface Response<IncidentNodeData> {
  network: {
    hierarchyNode: {
      incidents: IncidentNodeData
    }
  }
}

export const getIncidentBySeverity = (value?: number | null) => {
  if (value === null || value === undefined) {
    return '-'
  }

  const severity = Object.entries(Severities).filter(((elem) => {
    return value >= elem[1].gt && value <= elem[1].lte
  }))

  return severity[0][0]
}

export const api = dataApi.injectEndpoints({
  endpoints: (build) => ({
    incidentsList: build.query<IncidentNodeData, GlobalFilter>({
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
        return response.network.hierarchyNode.incidents.map((event) => {
          event.children = event.relatedIncidents
          delete event.relatedIncidents
          return event
        })
      }
    })
  })
})


export const { useIncidentsListQuery } = api
