import { gql } from 'graphql-request'

import { dataApi }      from '@acx-ui/analytics/services'
import { GlobalFilter } from '@acx-ui/analytics/utils'

export type IncidentDetailsData = {
  code: string[]
}

export const api = dataApi.injectEndpoints({
  endpoints: (build) => ({
    incidentDetails: build.query<
      IncidentDetailsData,
      GlobalFilter
    >({
      query: (payload) => ({
        document: gql`
          query IncidentDetails(
            $path: [HierarchyNodeInput]
            $start: DateTime
            $end: DateTime
            $granularity: String
          ) {
            incident(start: $start, end: $end) {
              hierarchyNode(path: $path) {
                timeSeries(granularity: $granularity) {
                  code
                }
              }
            }
          }
        `,
        variables: {
          path: payload.path,
          start: payload.startDate,
          end: payload.endDate,
          granularity: 'PT15M'
        }
      })
    })
  })
})

export const { useIncidentDetailsQuery } = api