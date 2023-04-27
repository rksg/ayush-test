import { useCallback } from 'react'

import { gql }           from 'graphql-request'
import { ValidatorRule } from 'rc-field-form/lib/interface'
import { useIntl }       from 'react-intl'

import { videoCallQoeApi } from '@acx-ui/store'
import { TimeStamp }       from '@acx-ui/types'

import { messageMapping }             from './contents'
import { Response, VideoCallQoeTest } from './types'

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
export interface WifiMetrics {
  rss: number | null
  snr: number | null
  avgTxMCS: number | null
  throughput: number| null
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
  wifiMetrics: WifiMetrics | null
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
      providesTags: [{ type: 'VideoCallQoe', id: 'LIST' }],
      transformResponse: (response: Response) => {
        return response
      }
    }),
    videoCallQoeTestDetails: build.query({
      query: (payload) => ({
        document: gql`
        query CallQoeTestDetails($testId: Int!, $status: String){
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
    }),
    createCallQoeTest: build.mutation<VideoCallQoeTest, { name: string }>({
      query: (variables) => ({
        variables,
        document: gql`mutation CreateVideoCallQoeTest ($name: String!) {
          createCallQoeTest (name: $name)
          { 
            id,
            name,
            meetings {
              zoomMeetingId,
              joinUrl
            }
          }
        }`
      }),
      invalidatesTags: [{ type: 'VideoCallQoe', id: 'LIST' }],
      transformResponse: (response: { createCallQoeTest: VideoCallQoeTest }) =>
        response.createCallQoeTest
    }),
    deleteCallQoeTest: build.mutation<boolean, { id: number }>({
      query: (variables) => ({
        variables,
        document: gql`mutation DeleteVideoCallQoeTest ($id : Int!)
        {
          deleteCallQoeTest(id: $id)
        }`
      }),
      invalidatesTags: [{ type: 'VideoCallQoe', id: 'LIST' }],
      transformResponse: (response: { deleteCallQoeTest : boolean }) => response.deleteCallQoeTest
    })
  })
})

export const {
  useVideoCallQoeTestsQuery,
  useLazyVideoCallQoeTestsQuery,
  useCreateCallQoeTestMutation,
  useDeleteCallQoeTestMutation,
  useVideoCallQoeTestDetailsQuery
} = api

export function useDuplicateNameValidator () {
  const { $t } = useIntl()
  const [submit] = useLazyVideoCallQoeTestsQuery()
  const validator: ValidatorRule['validator'] = useCallback(async (rule, value: string) => {
    const videoCallQoeTests = await submit({}).unwrap()
    const testNames = videoCallQoeTests.getAllCallQoeTests.map(test => test.name)
    if (!testNames.includes(value)) return

    throw new Error($t(messageMapping.DUPLICATE_NAME_NOT_ALLOWED))
  }, [$t, submit])
  return validator
}
