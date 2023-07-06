import { gql } from 'graphql-request'

import { AnalyticsFilter, calculateGranularity } from '@acx-ui/analytics/utils'
import { dataApi }                               from '@acx-ui/store'

export type App = {
  name: string
  applicationTraffic: number
  clientCount: number
  timeSeries: {
    time: string[]
    applicationTraffic: number[]
  }
}

interface Response<App> {
  client: {
    topNApplicationByTraffic: App[]
  }
}

export const api = dataApi.injectEndpoints({
  endpoints: (build) => ({
    topApplications: build.query<
      App[],
      AnalyticsFilter
    >({
      query: (payload) => ({
        document: gql`
          query TopApplicationsByTrafficPerClient($mac: String, $start: DateTime,
            $end: DateTime, $n: Int!, $granularity: String!) {
              client(mac: $mac, start: $start, end: $end) {
                topNApplicationByTraffic(n: $n) {
                  applicationTraffic
                  clientCount
                  name
                  timeSeries(granularity: $granularity) {
                    applicationTraffic
                    time
                  }
                }
              }
            }
        `,
        variables: {
          n: 10,
          mac: payload.mac,
          start: payload.startDate,
          end: payload.endDate,
          granularity: calculateGranularity(payload.startDate, payload.endDate)
        }
      }),
      transformResponse: (response: Response<App>) =>
        response.client.topNApplicationByTraffic
    })
  })
})

export const { useTopApplicationsQuery } = api
