import { gql } from 'graphql-request'

import { calculateGranularity } from '@acx-ui/analytics/utils'
import { dataApi }              from '@acx-ui/store'
import { NetworkPath }          from '@acx-ui/utils'

export type TrafficByRadioData = {
  time: string[]
  userTraffic_all: number[]
  userTraffic_6: number[]
  userTraffic_5: number[]
  userTraffic_24: number[]
}

interface Payload {
  path: NetworkPath
  startDate: string,
  endDate: string
}

interface Response <TimeSeriesData> {
  network: {
    hierarchyNode: {
      timeSeries: TimeSeriesData
    }
  }
}

export const api = dataApi.injectEndpoints({
  endpoints: (build) => ({
    trafficByRadio: build.query<
      TrafficByRadioData,
      Payload
    >({
      query: (payload) => ({
        document: gql`
          query TrafficByRadioWidget(
            $path: [HierarchyNodeInput]
            $start: DateTime
            $end: DateTime
            $granularity: String
            $filter: FilterInput
          ) {
            network(start: $start, end: $end, filter : $filter) {
              hierarchyNode(path: $path) {
                timeSeries(granularity: $granularity) {
                  time
                  userTraffic_all: userTraffic
                  userTraffic_24: userTraffic(band: "2.4")
                  userTraffic_5: userTraffic(band: "5")
                  userTraffic_6: userTraffic(band: "6")
                }
              }
            }
          }
        `,
        variables: {
          path: payload.path,
          start: payload.startDate,
          end: payload.endDate,
          granularity: calculateGranularity(payload.startDate, payload.endDate)
        }
      }),
      transformResponse: (response: Response<TrafficByRadioData>) =>
        response.network.hierarchyNode.timeSeries
    })
  })
})

export const { useTrafficByRadioQuery } = api
