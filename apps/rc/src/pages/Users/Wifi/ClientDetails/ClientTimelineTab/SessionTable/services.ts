import { gql } from 'graphql-request'

import { AnalyticsFilter, calculateGranularity } from '@acx-ui/analytics/utils'
import { dataApi }                               from '@acx-ui/store'

export type Session = {
  apMac: string
  apSerial: string
  apName: string
  ssid: string
  radio: string
  authMethod: string
  firstConnection: string
  disconnectTime: string
  sessionDuration: string
  rxBytes: number
  txBytes: number
  traffic: number
}

interface Response<Session> {
  client: {
    sessions: Session[]
  }
}

export const api = dataApi.injectEndpoints({
  endpoints: (build) => ({
    sessionList: build.query<
      Session[],
      AnalyticsFilter
    >({
      query: (payload) => ({
        document: gql`
          query Sessions($mac: String, $start: DateTime, $end: DateTime) {
            client(mac: $mac, start: $start, end: $end) {
              sessions {
                apMac
                apSerial
                apName
                ssid
                radio
                authMethod
                firstConnection
                disconnectTime
                sessionDuration
                rxBytes
                txBytes
                traffic
              }
            }
          }
        `,
        variables: {
          mac: payload.mac,
          start: payload.startDate,
          end: payload.endDate,
          filter: payload.filter,
          granularity: calculateGranularity(payload.startDate, payload.endDate)
        }
      }),
      transformResponse: (response: Response<Session>) =>
        response.client.sessions
    })
  })
})

export const { useSessionListQuery } = api