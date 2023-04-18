import { useCallback } from 'react'

import { gql }           from 'graphql-request'
import { ValidatorRule } from 'rc-field-form/lib/interface'
import { useIntl }       from 'react-intl'

import { videoCallQoeApi } from '@acx-ui/store'
import { TimeStamp }       from '@acx-ui/types'

import { messageMapping }                 from './contents'
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
      providesTags: [{ type: 'VideoCallQoe', id: 'LIST' }],
      transformResponse: (response: Response) => {
        return response
      }
    }),
    createCallQoeTest: build.mutation<CreateVideoCallQoeTestResponse, { name: string }>({
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
      transformResponse: (response: { createCallQoeTest: CreateVideoCallQoeTestResponse }) =>
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
  useDeleteCallQoeTestMutation
} = api

export function useDuplicateNameValidator (initialName?: string) {
  const { $t } = useIntl()
  const [submit] = useLazyVideoCallQoeTestsQuery()
  const validator: ValidatorRule['validator'] = useCallback(async (rule, value: string) => {
    if (initialName === value) return

    const videoCallQoeTests = await submit({}).unwrap()
    const testNames = videoCallQoeTests.getAllCallQoeTests.map(test => test.name)
    if (!testNames.includes(value)) return

    throw new Error($t(messageMapping.DUPLICATE_NAME_NOT_ALLOWED))
  }, [$t, submit, initialName])
  return validator
}
