import { gql } from 'graphql-request'

import { dataApi }      from '@acx-ui/analytics/services'
import { GlobalFilter, incidentCodes } from '@acx-ui/analytics/utils'

export type IncidentsBySeverityData = {
  p1: number
  p2: number
  p3: number
  p4: number
}

interface Response <IncidentsBySeverityData> {
  network: {
    hierarchyNode: IncidentsBySeverityData
  }
}

export const api = dataApi.injectEndpoints({
  endpoints: (build) => ({
    incidentsBySeverity: build.query<
      IncidentsBySeverityData,
      GlobalFilter
    >({
      query: (payload) => ({
        document: gql`
        query Network($path: [HierarchyNodeInput], $start: DateTime, $end: DateTime, $code: [String]) {
          network(start: $start, end: $end) {
            hierarchyNode(path: $path) {
              P1: incidentCount(filter: {severity: {gt: 0.9, lte: 1}, code: $code})
              P2: incidentCount(filter: {severity: {gt: 0.75, lte: 0.9}, code: $code})
              P3: incidentCount(filter: {severity: {gt: 0.6, lte: 0.75}, code: $code})
              P4: incidentCount(filter: {severity: {gt: 0, lte: 0.6}, code: $code})
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
      transformResponse: (response: Response<IncidentsBySeverityData>) =>
        response.network.hierarchyNode
    })
  })
})

export const { useIncidentsBySeverityQuery } = api
