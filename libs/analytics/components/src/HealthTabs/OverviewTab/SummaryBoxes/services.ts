import { gql } from 'graphql-request'

import { getFilterPayload,
  getWiredWirelessIncidentCodes,
  IncidentToggle } from '@acx-ui/analytics/utils'
import { dataApi }          from '@acx-ui/store'
import type { NodesFilter } from '@acx-ui/utils'


export interface RequestPayload {
  filter: NodesFilter
  start: string
  end: string
  toggles: Record<IncidentToggle, boolean>
  wirelessOnly?: boolean
}

type SwitchCountRequestPayload = Omit<RequestPayload, 'toggles'>

export interface SummaryResult {
  apIncidentCount: number
  switchIncidentCount?: number
  portCount?: number
  totalPortCount?: number
  avgPerAPClientCount: number
  apTotalTraffic: number
  poeUnderPoweredApCount: number
  apCount: number
  poeUnderPoweredSwitchCount?: number
  poeThresholdSwitchCount?: number
  timeSeries?: {
    switchTotalTraffic: [
        number
    ]
  }
}

export interface SwitchCount {
  switchCount: number
}


const wirelessFields = `
  apIncidentCount: incidentCount(
    filter: {
      code: $wirelessIncidentCodes
  })
  avgPerAPClientCount
  apTotalTraffic: userTraffic
  poeUnderPoweredApCount
  apCount
`

const wiredFields = `
  switchIncidentCount: incidentCount(
    filter: {
      code: $wiredIncidentCodes
  }),
  timeSeries(granularity: "all") {
    switchTotalTraffic
  },
  totalPortCount
  portCount
  poeUnderPoweredSwitchCount
  poeThresholdSwitchCount
`

export const api = dataApi.injectEndpoints({
  endpoints: (build) => ({
    summaryData: build.query<SummaryResult, RequestPayload>({
      query: payload => {
        const { wirelessOnly = false, toggles, ...restPayload } = payload
        const [wiredIncidentCodes, wirelessIncidentCodes] = getWiredWirelessIncidentCodes(toggles)
        return ({
          document: gql`
          query SummaryQuery(
          $path: [HierarchyNodeInput],
          $start: DateTime,
          $end: DateTime,
          $filter: FilterInput,
          ${!wirelessOnly ? '$wiredIncidentCodes: [String]' : ''}
          $wirelessIncidentCodes: [String]
          $enableSwitchFirmwareFilter: Boolean
          ) {
            network(start: $start, end: $end, filter: $filter, 
              enableSwitchFirmwareFilter: $enableSwitchFirmwareFilter) {
                hierarchyNode(path: $path) {
                  ${wirelessFields}
                  ${!wirelessOnly ? wiredFields : ''}
                }
            }
          }`,
          variables: {
            ...restPayload,
            ...getFilterPayload(restPayload),
            wiredIncidentCodes: !wirelessOnly ? wiredIncidentCodes : undefined,
            wirelessIncidentCodes: wirelessIncidentCodes,
            enableSwitchFirmwareFilter: true
          }
        })
      },
      transformResponse: (response: {
        network: { hierarchyNode: SummaryResult } }) => response.network.hierarchyNode
    }),
    switchCount: build.query<SwitchCount, SwitchCountRequestPayload>({
      query: payload => ({
        document: gql`
          query SwitchCount(
          $path: [HierarchyNodeInput],
          $start: DateTime,
          $end: DateTime,
          $filter: FilterInput,
          $enableSwitchFirmwareFilter: Boolean
          ) {
            network(start: $start, end: $end, filter: $filter,
              enableSwitchFirmwareFilter: $enableSwitchFirmwareFilter
            ) {
              hierarchyNode(path: $path) {
                switchCount
              }
            }
          }`,
        variables: {
          ...payload,
          ...getFilterPayload(payload),
          enableSwitchFirmwareFilter: true
        }
      }),
      transformResponse: (response:
        { network: { hierarchyNode: SwitchCount } }) => response.network.hierarchyNode
    })
  })
})

export const {
  useSummaryDataQuery,
  useSwitchCountQuery
} = api
