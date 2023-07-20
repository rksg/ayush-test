import { useCallback } from 'react'

import { gql }           from 'graphql-request'
import { ValidatorRule } from 'rc-field-form/lib/interface'
import { useIntl }       from 'react-intl'

import { dataApiSearch, videoCallQoeApi } from '@acx-ui/store'

import { messageMapping }                                                                       from './contents'
import { Client, DetailedResponse, RequestPayload, Response, SearchResponse, VideoCallQoeTest } from './types'

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
                    apSerial
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
    }),
    updateCallQoeParticipant: build.mutation<number, { participantId: number, macAddr: string }>({
      query: (variables) => ({
        variables,
        document: gql`mutation UpdateCallQoeParticipant($participantId: Int!, $macAddr: String!) {
          updateCallQoeParticipant(id: $participantId, macAddress: $macAddr)
        }`
      }),
      transformResponse: (response: { updateCallQoeParticipant : number }) =>
        response.updateCallQoeParticipant
    })
  })
})

export const {
  useVideoCallQoeTestsQuery,
  useLazyVideoCallQoeTestsQuery,
  useCreateCallQoeTestMutation,
  useDeleteCallQoeTestMutation,
  useVideoCallQoeTestDetailsQuery,
  useUpdateCallQoeParticipantMutation
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

export const clientSearchApi = dataApiSearch.injectEndpoints({
  endpoints: (build) => ({
    seachClients: build.query<Client[], RequestPayload>({
      query: (payload) => ({
        document: gql`
        query Search(
          $start: DateTime,
          $end: DateTime,
          $query: String,
          $limit: Int
        ) {
          search(start: $start, end: $end, query: $query, limit: $limit) {
            clients {
              hostname
              username
              mac
              ipAddress
            }
          }
        }
        `,
        variables: payload
      }),
      providesTags: [{ type: 'Monitoring', id: 'SEARCH' }],
      transformResponse: (response: SearchResponse<{ clients: Client[] }>) =>
        response.search.clients
    })
  })
})
export const {
  useSeachClientsQuery
} = clientSearchApi