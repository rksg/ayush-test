import { gql } from 'graphql-request'

import { dataApi }                               from '@acx-ui/analytics/services'
import { AnalyticsFilter, calculateGranularity } from '@acx-ui/analytics/utils'

export type SwitchStatusTimeSeries = {
  time: string[];
  isSwitchUp: number[];
}

export type SwitchStatus = {
  timeSeries: SwitchStatusTimeSeries;
  switchTotalDowntime: number;
  switchTotalUptime: number;
}

interface Response<T> {
  network: {
    hierarchyNode: {
      switchTotalDowntime: number;
      switchTotalUptime: number;
      timeSeries: T;
    };
  };
}

export const api = dataApi.injectEndpoints({
  endpoints: (build) => ({
    switchStatus: build.query<SwitchStatus, AnalyticsFilter>({
      query: (payload) => ({
        document: gql`
          query switchStatus(
            $path: [HierarchyNodeInput]
            $start: DateTime
            $end: DateTime
            $granularity: String
            $filter: FilterInput
          ) {
            network(start: $start, end: $end, filter: $filter) {
              hierarchyNode(path: $path) {
                switchTotalDowntime
                switchTotalUptime
                timeSeries(granularity: $granularity) {
                  isSwitchUp
                  time
                }
              }
            }
          }
        `,
        variables: {
          path: payload.path,
          start: payload.startDate,
          end: payload.endDate,
          granularity: calculateGranularity(payload.startDate, payload.endDate, 'PT15M'),
          filter: payload.filter
        }
      }),
      transformResponse: (response: Response<SwitchStatusTimeSeries>) =>
        response.network.hierarchyNode
    })
  })
})

export const { useSwitchStatusQuery } = api
