import { gql } from 'graphql-request'

import { dataApi }      from '@acx-ui/analytics/services'
import { GlobalFilter } from '@acx-ui/analytics/utils'

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

interface IncidentNodeInfo {
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
}

type IncidentNodeData = IncidentNodeInfo[]

interface Response<IncidentNodeData> {
  network: {
    hierarchyNode: {
      incidents: IncidentNodeData
    }
  }
}

const IncidentFailureCode = 
  ['ttc'
    ,'ttc+radius-failure'
    ,'ttc+auth-failure'
    ,'ttc+assoc-failure'
    ,'ttc+eap-failure'
    ,'ttc+dhcp-failure'
    ,'radius-failure'
    ,'high-radius-failure'
    ,'eap-failure'
    ,'high-eap-failure'
    ,'dhcp-failure'
    ,'high-dhcp-failure'
    ,'auth-failure'
    ,'high-auth-failure'
    ,'assoc-failure'
    ,'high-assoc-failure'
    ,'p-cov-clientrssi-low'
    ,'p-load-sz-cpu-load'
    ,'p-switch-memory-high'
    ,'p-channeldist-suboptimal-plan-24g'
    ,'p-channeldist-suboptimal-plan-50g-outdoor'
    ,'p-channeldist-suboptimal-plan-50g-indoor'
    ,'i-net-time-future'
    ,'i-net-time-past'
    ,'i-net-sz-net-latency'
    ,'i-apserv-high-num-reboots'
    ,'i-apserv-continuous-reboots'
    ,'i-apserv-downtime-high'
    ,'i-switch-vlan-mismatch'
    ,'i-switch-poe-pd'
    ,'i-apinfra-poe-low'
    ,'i-apinfra-wanthroughput-low']


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
          code: IncidentFailureCode
        }
      }),
      transformResponse: (response: Response<IncidentNodeData>) => 
        response.network.hierarchyNode.incidents
    })
  })
})


export const { useIncidentsListQuery } = api
