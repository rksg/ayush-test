import { gql } from 'graphql-request'

import { dataApi }      from '@acx-ui/analytics/services'
import { GlobalFilter } from '@acx-ui/analytics/utils'

export interface HeaderDrillDownData {
  type: string,
  name: string,
  clientCount: number,
  apCount: number,
  switchCount: number
}

interface Response <HeaderDrillDownData> {
  network: {
    node: HeaderDrillDownData
  }
}

export const api = dataApi.injectEndpoints({
  endpoints: (build) => ({
    headerDrillDown: build.query<
    HeaderDrillDownData,
    GlobalFilter
    >({
      // todo: change to the schema of real api
      query: (payload) => ({
        document: gql`
        query Network($path: [HierarchyNodeInput], $startDate: DateTime, $endDate: DateTime) {
          network(start: $startDate, end: $endDate) {
             node: hierarchyNode(path: $path) {
              type
              name
              clientCount
              apCount
              switchCount
            }
          }
        }
        `,
        variables: {
          path: payload.path,
          start: payload.startDate,
          end: payload.endDate
        }
      }),
      // providesTags: [{ type: 'Monitoring', id: 'TRAFFIC_BY_VOLUME' }],
      transformResponse: (response: Response<HeaderDrillDownData>) =>
        response.network.node
    })
  })
})

export const { useHeaderDrillDownQuery } = api
