import { gql } from 'graphql-request'

import { ClientStatistic } from '@acx-ui/rc/utils'
import { dataApi }         from '@acx-ui/store'
import { DateRangeFilter } from '@acx-ui/utils'

const clientStatistics = gql`
  query ClientStatisics ($clientMac: String, $startDate: DateTime, $endDate: DateTime) {
    client (mac: $clientMac, start: $startDate, end: $endDate) {
      applications: applicationCount
      apsConnected: apCount
      avgRateBPS: avgRateUserTraffic
      sessions: sessionCount
      avgSessionLengthSeconds: avgSessionDuration
      userTraffic24GBytes: userTraffic(band: "2.4")
      userTraffic5GBytes: userTraffic(band: "5")
      userTraffic6GBytes: userTraffic(band: "6")
      userTrafficBytes: userTraffic
    }
  }
`

type Response <T> = { client: T }
type Payload = DateRangeFilter & { clientMac: string }

export const { useClientStatisticsQuery } = dataApi.injectEndpoints({
  endpoints: (build) => ({
    clientStatistics: build.query<ClientStatistic, Payload>({
      query: (payload) => ({
        document: clientStatistics,
        variables: payload
      }),
      transformResponse: (response: Response<ClientStatistic>) => response.client
    })
  })
})
