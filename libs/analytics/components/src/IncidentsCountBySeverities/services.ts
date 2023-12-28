/* eslint-disable max-len */
import { gql } from 'graphql-request'

import {
  getFilterPayload,
  IncidentFilter,
  incidentSeverities,
  incidentCodes
} from '@acx-ui/analytics/utils'
import { dataApi } from '@acx-ui/store'

type Severity = keyof typeof incidentSeverities

type QueryResponse = {
  network: {
    incidentsCount: Record<Severity | 'total', number>
    hierarchyNode: {
      impactedClientCounts: Record<Severity, Array<number | null>>
    }
  }
}

export type QueryResult = {
  total: number
  items: Array<{
    severity: Severity
    incidentsCount: number
    impactedClients: number | null
  }>
}

const severitySets = Object.entries(incidentSeverities)

const queries = gql`
  query IncidentsCountBySeveritiesWidget(
    $startDate: DateTime,
    $endDate: DateTime,
    $path: [HierarchyNodeInput],
    $incidentCodes: [String],
    $granularity: String,
    $filter: FilterInput
  ) {
    network(start: $startDate, end: $endDate, filter: $filter) {
      incidentsCount: hierarchyNode(path: $path) {
        total: incidentCount(filter: { code: $incidentCodes })
        ${severitySets.map(([severity, { gt, lte }]) => gql`
        ${severity}: incidentCount(filter: {
          severity: {gt: ${gt}, lte: ${lte}},
          code: $incidentCodes
        })`).join('\n')}
      }
      hierarchyNode(path: $path) {
        impactedClientCounts: timeSeries(granularity: $granularity) {
          ${severitySets.map(([severity, { gt, lte }]) => gql`
          ${severity}: impactedClientCountBySeverity(filter: {
            severity: [{gt: ${gt}, lte: ${lte}}],
            code: $incidentCodes
          })`).join('\n')}
        }
      }
    }
  }
`

export const api = dataApi.injectEndpoints({
  endpoints: (build) => ({
    incidentsCountBySeverities: build.query<QueryResult, IncidentFilter>({
      query: (payload) => ({
        document: queries,
        variables: {
          ...payload,
          ...getFilterPayload(payload),
          incidentCodes,
          granularity: 'all'
        }
      }),
      transformResponse: (response: QueryResponse) => {
        const data = response.network
        const keys = Object.keys(incidentSeverities) as Severity[]
        const items = keys.map((severity: Severity) => ({
          severity,
          incidentsCount: data.incidentsCount[severity],
          impactedClients: data.hierarchyNode.impactedClientCounts[severity][0]
        }))

        return { total: data.incidentsCount.total, items }
      },
      providesTags: [{ type: 'Dashboard', id: 'INCIDENTS_COUNT' }]
    })
  })
})

export const { useIncidentsCountBySeveritiesQuery } = api
