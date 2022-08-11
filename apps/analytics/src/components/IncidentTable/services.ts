import { gql } from 'graphql-request'

import { dataApi }         from '@acx-ui/analytics/services'
import { AnalyticsFilter } from '@acx-ui/analytics/utils'
import { incidentCodes }   from '@acx-ui/analytics/utils'

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

export interface IncidentPath {
  name: string
  type: string
}

export interface IncidentApModel {
  AP_MODEL: boolean | string
  CCD_REASON_DEAUTH_LEAVING?: boolean | string
  CLIENT_OS_MFG: boolean | string
  FW_VERSION: boolean | string
}

export interface IncidentMetadata {
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

export interface Response<IncidentNodeData> {
  network: {
    hierarchyNode: {
      incidents: IncidentNodeData
    }
  }
}

const api = dataApi.injectEndpoints({
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
        return response.network.hierarchyNode.incidents.map((event) => {
          // handle nested row transform
          event.children = event.relatedIncidents
          delete event.relatedIncidents
          if (event.children && event.children.length <= 0) {
            event.children = undefined
          }

          return event
        })
      }
    })
  })
})


export const { useIncidentsListQuery } = api
