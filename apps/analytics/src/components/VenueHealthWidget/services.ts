import { gql } from 'graphql-request'


import { dataApi }         from '@acx-ui/analytics/services'
import { AnalyticsFilter } from '@acx-ui/analytics/utils'

interface ThresholdData {
  value: number | null
}

interface Response {
  timeToConnectThreshold: ThresholdData
  clientThroughputThreshold: ThresholdData
}

export const api = dataApi.injectEndpoints({
  endpoints: (build) => ({
    fetchKpiThresholds: build.query<
      Response,
      AnalyticsFilter
    >({
      query: (payload) => ({
        document: gql`
        query FetchKpiThresholds($path: [HierarchyNodeInput]) {
          timeToConnectThreshold: KPIThreshold(name: "timeToConnect", networkPath: $path) {
            value
          }
          clientThroughputThreshold: KPIThreshold(name: "clientThroughput", networkPath: $path) {
            value
          }
        }
        `,
        variables: {
          path: payload.path
        }
      })
    })
  })
})

export const { useFetchKpiThresholdsQuery } = api
