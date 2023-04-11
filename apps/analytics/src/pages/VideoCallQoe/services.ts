import { gql } from 'graphql-request'

import { videoCallQoeApi } from '@acx-ui/store'
import { TimeStamp }       from '@acx-ui/types'

import { CreateVideoCallQoeTestResponse } from './types'

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
    createCallQoeTest: build.mutation<CreateVideoCallQoeTestResponse, { name: string }>({
      query: (variables) => ({
        variables,
        document: gql`mutation ($name: String!) {
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
      //invalidatesTags: [{ type: 'NetworkHealth', id: 'LIST' }],
      transformResponse: (response: { createCallQoeTest: CreateVideoCallQoeTestResponse }) => {
        console.log('### Response: ', response)
        return response.createCallQoeTest
      }

    }),
    deleteCallQoeTest: build.mutation<boolean, { id: number }>({
      query: (variables) => ({
        variables,
        document: gql`mutation ($id : Int!)
        {
          deleteCallQoeTest(id: $id)
        }`
      }),
      //invalidatesTags: [{ type: 'NetworkHealth', id: 'LIST' }],
      transformResponse: (response: { deleteCallQoeTest : boolean }) => {
        console.log('### Response: ', response)
        return response.deleteCallQoeTest
      }

    })
  })
})

export const {
  useVideoCallQoeTestsQuery,
  useCreateCallQoeTestMutation,
  useDeleteCallQoeTestMutation
} = api


/**

 mutation ($id : Int!)
  {
    deleteCallQoeTest(id: $id)
  }

  {
  "deleteCallQoeTest": true,
}
 */