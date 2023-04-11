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
      startTime: TimeStamp,
      endTime: TimeStamp
    } []
  } []
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
                startTime,
                endTime
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
                startTime,
                endTime
              }
            }
          }
          `,
        variables: {
          testId: payload.testId,
          status: payload.status
        }
      }),
      transformResponse: (response: Response) => {
        return response
      }
    })
  })
})

export const { useVideoCallQoeTestsQuery, useVideoCallQoeTestDetailQuery } = api
