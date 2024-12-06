import { gql } from 'graphql-request'

import { Incident, IncidentsToggleFilter, incidentsToggle  } from '@acx-ui/analytics/utils'
import { dataApi }                                           from '@acx-ui/store'
import { DateFilter, NetworkPath }                           from '@acx-ui/utils'

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
  key?: string,
  pcapFilename?: string,
  roamingType?: string,
  /**
   * Contains `Trigger` field for BTM request event type or
   * `Status` field for BTM response event type
   */
  btmInfo?: string
}

export type ConnectionQuality = {
  start: string,
  end: string,
  rss?: number | null,
  snr?: number | null,
  throughput?: number | null,
  avgTxMCS?: number | null
}

export type ClientIncidentsInfo = {
  incidents: Incident[]
}

export type ClientConnectionQualities = {
  connectionQualities: ConnectionQuality[]
}

export type ClientConnectionInfo = {
  connectionDetailsByAp: object[]
  connectionEvents: ConnectionEvent[]
  connectionQualities: ConnectionQuality[]
}

export type ClientInfoData = ClientIncidentsInfo & ClientConnectionInfo
interface Response <T> {
    client: T
}

type ClientFilter = DateFilter & { clientMac: string }

type PcapPayload = {
  filename: string
}

type PcapFile = {
  pcapFile: Blob
}

export const b64ToBlob = (b64Data: string) => {
  const sliceSize = 512
  const byteCharacters = window.atob(b64Data)
  const byteArrays = []

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize)
    const byteNumbers = new Array(slice.length)
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i)
    }
    const byteArray = new Uint8Array(byteNumbers)
    byteArrays.push(byteArray)
  }

  return new Blob(byteArrays)
}


export const api = dataApi.injectEndpoints({
  endpoints: (build) => ({
    clientInfo: build.query<
    ClientConnectionInfo,
    ClientFilter & IncidentsToggleFilter & { fetchRoamingType: boolean, fetchBtmInfo: boolean }
    >({
      query: (payload) => ({
        document: gql`
        query ClientInfo($mac: String, $start: DateTime, $end: DateTime) {
          client(mac: $mac, start: $start, end: $end) {
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
              pcapFilename
              ${payload.fetchRoamingType ? 'roamingType' : ''}
              ${payload.fetchBtmInfo ? 'btmInfo' : ''}
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
          end: payload.endDate
        }
      }),
      providesTags: [
        { type: 'Monitoring', id: 'CLIENT_INFO' }
      ],
      transformResponse: (response: Response<ClientConnectionInfo>) => {
        return response.client
      }
    }),
    clientIncidentsInfo: build.query<
    ClientIncidentsInfo,
    ClientFilter & IncidentsToggleFilter
    >({
      query: (payload) => ({
        document: gql`
        query ClientIncidentsInfo($mac: String, $start: DateTime, $end: DateTime, $code: [String]) {
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
          }
        }
        `,
        variables: {
          mac: payload.clientMac,
          start: payload.startDate,
          end: payload.endDate,
          code: incidentsToggle(payload)
        }
      }),
      providesTags: [
        { type: 'Monitoring', id: 'CLIENT_INFO' }
      ],
      transformResponse: (response: Response<ClientIncidentsInfo>) => {
        return response.client
      }
    }),
    clientConnectionQualities: build.query<ClientConnectionQualities, ClientFilter>({
      query: (payload) => ({
        document: gql`
        query ClientConnectionQualities($mac: String, $start: DateTime, $end: DateTime) {
          client(mac: $mac, start: $start, end: $end) {
            connectionQualities {
              start
              end
              rss
              snr
              throughput
              avgTxMCS
            }
          }
        }
        `,
        variables: {
          mac: payload.clientMac,
          start: payload.startDate,
          end: payload.endDate
        }
      }),
      providesTags: [
        { type: 'Monitoring', id: 'CLIENT_INFO' }
      ],
      transformResponse: (response: Response<ClientConnectionQualities>) => {
        return response.client
      }
    }),
    clientPcap: build.mutation<
      PcapFile,
      PcapPayload
    >({
      query: (payload) => ({
        document: gql`
          query ClientPcapFile($filename: String) {
            client {
              pcapFile(filename: $filename)
            }
          }
        `,
        variables: {
          filename: payload.filename
        }
      }),
      transformResponse: (response: Response<{ pcapFile: string }>) =>
        ({ pcapFile: b64ToBlob(response.client.pcapFile) })
    })
  })
})

export const {
  useClientInfoQuery,
  useClientPcapMutation,
  useClientConnectionQualitiesQuery,
  useClientIncidentsInfoQuery
} = api
