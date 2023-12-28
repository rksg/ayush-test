import { gql } from 'graphql-request'

import { calculateGranularity } from '@acx-ui/analytics/utils'
import { dataApi }              from '@acx-ui/store'
import type { AnalyticsFilter } from '@acx-ui/utils'

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
  sessionDurationInt: number
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
          granularity: calculateGranularity(payload.startDate, payload.endDate)
        }
      }),
      transformResponse: (response: Response<Session>) => {
        return response.client.sessions.map(session => {
          session.sessionDurationInt = parseInt(session.sessionDuration, 10)
          return session
        })
      }
    })
  })
})

export const { useSessionListQuery } = api
