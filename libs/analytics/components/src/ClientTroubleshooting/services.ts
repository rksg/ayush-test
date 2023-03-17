import { gql } from 'graphql-request'

import { incidentCodes, Incident  } from '@acx-ui/analytics/utils'
import { dataApi }                  from '@acx-ui/store'
import { DateFilter, NetworkPath }  from '@acx-ui/utils'

export type ConnectionEvent = {
  event: string,
  state: string,
  timestamp: string,
  mac: string,
  ttc: number | null,
  radio: string,
  failedMsgId: string | null,
  code: string| null,
  apName: string,
  path: NetworkPath,
  ssid?: string | null,
  messageIds?: Array<string>,
  key?: string
}

export type ConnectionQuality = {
  start: string,
  end: string,
  rss?: number | null,
  snr?: number | null,
  throughput?: number | null,
  avgTxMCS?: number | null
}

export type ClientInfoData = {
  connectionDetailsByAp: object[]
  connectionEvents: ConnectionEvent[]
  connectionQualities: ConnectionQuality[]
  incidents: Incident[]
}
interface Response <ClientInfoData> {
    client: ClientInfoData
}

type ClientFilter = DateFilter & { clientMac: string }

export const api = dataApi.injectEndpoints({
  endpoints: (build) => ({
    clientInfo: build.query<
    ClientInfoData,
    ClientFilter
    >({
      query: (payload) => ({
        document: gql`
        query ClientInfo($mac: String, $start: DateTime, $end: DateTime, $code: [String]) {
          client(mac: $mac, start: $start, end: $end) {
            incidents(code: $code) {
              id
              path {
                type
                name
              }
              severity
              startTime
              sliceType
              sliceValue
              endTime
              code
              slaThreshold
            }
            connectionQualities {
              start
              end
              rss
              snr
              throughput
              avgTxMCS
            }
            connectionEvents {
              timestamp
              event
              ttc
              mac
              apName
              path {
                type
                name
              }
              code
              state
              failedMsgId
              messageIds
              radio
              ssid
            }
            connectionDetailsByAp {
              start
              end
              apMac
              apName
              apModel
              apFirmware
              channel
              radio
              radioMode
              ssid
              spatialStream
              bandwidth
              rss
              bssid
            }
          }
        }
        `,
        variables: {
          mac: payload.clientMac,
          start: payload.startDate,
          end: payload.endDate,
          code: incidentCodes
        }
      }),
      providesTags: [
        { type: 'Monitoring', id: 'CLIENT_INFO' }
      ],
      transformResponse: (response: Response<ClientInfoData>) => {
        return response.client
      }
    })
  })
})

export const { useClientInfoQuery } = api
