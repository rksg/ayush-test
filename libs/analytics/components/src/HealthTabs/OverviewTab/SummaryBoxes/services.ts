import { gql } from 'graphql-request'

import { getFilterPayload, incidentsToggle } from '@acx-ui/analytics/utils'
import { dataApi }                           from '@acx-ui/store'
import type { NodesFilter }                  from '@acx-ui/utils'


export interface RequestPayload {
  filter: NodesFilter
  start: string
  end: string
  wirelessOnly?: boolean
}

export interface SummaryResult {
  apIncidentCount: number
  switchIncidentCount?: number
  portCount?: number
  totalPortCount?: number
  avgPerAPClientCount: number
  apTotalTraffic: number
  switchTotalTraffic?: number
}

export interface SwitchCount {
  switchCount: number
}


const wirelessFields = `
  apIncidentCount: incidentCount(
    filter: {
      code: $code
      type: "apMac"
  })
  avgPerAPClientCount
  apTotalTraffic: totalTraffic
`

const wiredFields = `
  switchIncidentCount: incidentCount(
    filter: {
      code: $code
      type: "switchId"
  }),
  switchTotalTraffic
  totalPortCount
  portCount
`

export const api = dataApi.injectEndpoints({
  endpoints: (build) => ({
    summaryData: build.query<SummaryResult, RequestPayload>({
      query: payload => {
        const { wirelessOnly = false } = payload
        return ({
          document: gql`
          query SummaryQuery(
          $path: [HierarchyNodeInput],
          $start: DateTime,
          $end: DateTime,
          $filter: FilterInput,
          $code: [String]
          ) {
            network(start: $start, end: $end, filter: $filter) {
              hierarchyNode(path: $path) {
                ${wirelessFields}
                ${!wirelessOnly ? wiredFields : ''}
              }
            }
          }`,
          variables: {
            ...payload,
            ...getFilterPayload(payload),
            code: incidentsToggle({})
          }
        })
      },
      transformResponse: (response: {
        network: { hierarchyNode: SummaryResult } }) => response.network.hierarchyNode
    }),
    switchCount: build.query<SwitchCount, RequestPayload>({
      query: payload => ({
        document: gql`
          query SwitchCount(
          $path: [HierarchyNodeInput],
          $start: DateTime,
          $end: DateTime,
          $filter: FilterInput,

          ) {
            network(start: $start, end: $end, filter: $filter) {
              hierarchyNode(path: $path) {
                switchCount
              }
            }
          }`,
        variables: {
          ...payload,
          ...getFilterPayload(payload)
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
