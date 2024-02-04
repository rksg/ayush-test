import { gql } from 'graphql-request'

import {
  getFilterPayload,
  IncidentFilter,
  incidentSeverities,
  IncidentsToggleFilter,
  incidentsToggle
} from '@acx-ui/analytics/utils'
import { dataApi } from '@acx-ui/store'

export type IncidentsBySeverityData = {
  P1: number
  P2: number
  P3: number
  P4: number
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
      IncidentFilter & IncidentsToggleFilter
    >({
      query: (payload) => ({
        document: gql`
        query IncidentsBySeverityWidget(
          $path: [HierarchyNodeInput],
          $start: DateTime,
          $end: DateTime,
          $code: [String],
          $filter: FilterInput
        ) {
          network(start: $start, end: $end, filter : $filter) {
            hierarchyNode(path: $path) {
              ${Object.entries(incidentSeverities)
          .map(
            ([name, { gt, lte }]) => `
              ${name}: incidentCount(filter: {severity: {gt: ${gt}, lte: ${lte}}, code: $code})
            `
          )
          .join('')}
            }
          }
        }
        `,
        variables: {
          start: payload.startDate,
          end: payload.endDate,
          code: incidentsToggle(payload),
          ...getFilterPayload(payload)
        }
      }),
      transformResponse: (response: Response<IncidentsBySeverityData>) =>
        response.network.hierarchyNode,
      providesTags: [{ type: 'Monitoring', id: 'INCIDENTS_LIST' }]
    }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    incidentsListBySeverity: build.query<IncidentsBySeverityData[], any>({
      query: (payload) => ({
        document: gql`
        query IncidentsBySeverityWidget(
          ${Object.keys(payload.paths).map((key) => `
          $${key}: [HierarchyNodeInput],`).join('')}
          $start: DateTime,
          $end: DateTime,
          $code: [String]
        ) {
          network(start: $start, end: $end) {
            ${Object.keys(payload.paths).map((key, i) => `
              incidentCount${i}: hierarchyNode(path: $${key}) {
                ...fields
              }
            `).join('')}
          }
        }

        fragment fields on HierarchyNode {
          ${Object.entries(incidentSeverities)
          .map(
            ([name, { gt, lte }]) => `
              ${name}: incidentCount(filter: {severity: {gt: ${gt}, lte: ${lte}}, code: $code})
            `
          )
          .join('')}
          }
        `,
        variables: {
          ...payload.variables,
          code: incidentsToggle(payload)
        }
      }),
      transformResponse: (response: Response<IncidentsBySeverityData>) => {
        return Object.values(response.network)
      },
      providesTags: [{ type: 'Monitoring', id: 'INCIDENTS_LIST' }]
    })
  })
})

export const {
  useIncidentsBySeverityQuery,
  useIncidentsListBySeverityQuery,
  useLazyIncidentsListBySeverityQuery } = api
