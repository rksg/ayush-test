import { gql } from 'graphql-request'

import { videoCallQoeApi } from '@acx-ui/store'
import { TimeStamp }       from '@acx-ui/types'

export interface Response {
  getAllCallQoeTests : {
    id: number,
    name: string,
    meetings:
    {
      id:number,
      zoomMeetingId: number,
      status: string,
      invalidReason: string,
      joinUrl:string,
      participantCount:number,
      mos:number,
      createdTime: TimeStamp,
      startTime: TimeStamp
    } []
  } []
}

export interface DetailedResponse {
  getAllCallQoeTests : {
    id: number,
    name: string,
    meetings:
    {
      id:number,
      zoomMeetingId: number,
      status: string,
      invalidReason: string,
      joinUrl:string,
      participantCount:number,
      mos:number,
      createdTime: TimeStamp,
      startTime: TimeStamp,
      endTime: TimeStamp
      participants: Participants[]
    } []
  } []
}

export interface Participants{
  id: number
  userName: string
  hostname: string
  networkType: string
  macAddress: string
  device: string
  ipAddress: string
  joinTime: TimeStamp
  leaveTime: TimeStamp
  leaveReason: string
  apDetails: {
    system: string | null
    domains: string | null
    zone: string | null
    apGroup: string | null
    apName: string | null
    apMac: string | null
    ssid: string | null
    radio: string | null
  } | null
  wifiMetrics: {
    rss: number
    snr: number
    avgTxMCS: number
    throughput: number
  } | null
  callMetrics: {
    date_time: TimeStamp
    jitter: {
      audio: {
        rx: number | null
        tx: number | null
      }
      video: {
        tx: number | null
        rx: number | null
      }
    }
    latency: {
      audio: {
        rx: number | null
        tx: number | null
      }
      video: {
        tx: number | null
        rx: number | null
      }
    }
    packet_loss: {
      audio: {
        rx: number | null
        tx: number | null
      }
      video: {
        tx: number | null
        rx: number | null
      }
    }
    video_frame_rate: {
      rx: number | null
      tx: number | null
    }
  }[]
}

export const api = videoCallQoeApi.injectEndpoints({
  endpoints: (build) => ({
    videoCallQoeTests: build.query({
      query: () => ({
        document: gql`
        query CallQoeTests{
            getAllCallQoeTests {
              id,
              name,
              meetings {
                id,
                zoomMeetingId,
                status,
                invalidReason,
                joinUrl,
                participantCount,
                mos,
                createdTime,
                startTime
              }
            }
          }
          `
      }),
      transformResponse: (response: Response) => {
        return response
      }
    }),
    videoCallQoeTestDetail: build.query({
      query: (payload) => ({
        document: gql`
        query CallQoeTests($testId: Int!, $status: String){
            getAllCallQoeTests(id: $testId, status: $status) {
              id
              name
              meetings {
                id
                zoomMeetingId
                status
                invalidReason
                joinUrl
                participantCount
                mos
                createdTime
                startTime
                endTime
                participants {
                  id
                  userName
                  hostname
                  networkType
                  macAddress
                  device
                  ipAddress
                  joinTime
                  leaveTime
                  leaveReason
                  apDetails {
                    system
                    domains
                    zone
                    apGroup
                    apName
                    apMac
                    ssid
                    radio
                  }
                  wifiMetrics {
                    rss
                    snr
                    avgTxMCS
                    throughput
                  }
                  callMetrics {
                    date_time
                    jitter {
                      audio {
                        rx
                        tx
                      }
                      video {
                        tx
                        rx
                      }
                    }
                    latency {
                      audio {
                        rx
                        tx
                      }
                      video {
                        tx
                        rx
                      }
                    }
                    packet_loss {
                      audio {
                        rx
                        tx
                      }
                      video {
                        tx
                        rx
                      }
                    }
                    video_frame_rate {
                      rx
                      tx
                    }
                  }
                }
              }
            }
          }
          `,
        variables: {
          testId: payload.testId,
          status: payload.status
        }
      }),
      transformResponse: (response: DetailedResponse) => {
        return response
      }
    })
  })
})

export const { useVideoCallQoeTestsQuery, useVideoCallQoeTestDetailQuery } = api
