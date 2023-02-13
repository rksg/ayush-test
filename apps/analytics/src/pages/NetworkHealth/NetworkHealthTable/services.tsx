import { gql } from 'graphql-request'

import { networkHealthApi } from '@acx-ui/analytics/services'
import { RequestPayload }   from '@acx-ui/rc/utils'

import type { MutationResult } from '../types'

export type ServiceGuardSpec = {
  id: string,
  name: string,
  type: 'on-demand' | 'scheduled',
  apsCount: number
  userId: string,
  clientType: 'virtual-client' | 'virtual-wireless-client',
  schedule: {
    nextExecutionTime: number
  }
  tests: ServiceGuardTest
}

export type ServiceGuardTest = {
  items: [{
    id: number,
    createdAt: string,
    summary: {
      apsTestedCount: number,
      apsSuccessCount: number,
      apsPendingCount: number
    }
  }]
}

interface Response {
  allServiceGuardSpecs: ServiceGuardSpec[]
}

type DeleteMutationResult = MutationResult<{
  deletedSpecId: string
}>

export const api = networkHealthApi.injectEndpoints({
  endpoints: (build) => ({
    networkHealth: build.query<
      ServiceGuardSpec[], RequestPayload
    >({
      query: () => ({
        document: gql`
          query ServiceGuardSpecs {
            allServiceGuardSpecs {
              id
              name
              type
              apsCount
              userId
              clientType
              schedule {
                nextExecutionTime
              }
              tests(limit: 1) {
                items {
                  id
                  createdAt
                  summary {
                    apsTestedCount
                    apsSuccessCount
                    apsPendingCount
                  }
                }
              }
            }
          }
        `
      }),
      providesTags: [
        { type: 'NetworkHealth', id: 'LIST' }
      ],
      transformResponse: (response: Response) => response.allServiceGuardSpecs
    }),
    networkHealthDelete: build.mutation<
      DeleteMutationResult, RequestPayload
    >({
      query: (payload) => ({
        document: gql`
          mutation ($id: String!) {
            deleteServiceGuardSpec (id: $id) {
              deletedSpecId
              userErrors {
                field message
              }
            }
          }
        `,
        variables: {
          id: payload.params?.id
        }
      }),
      invalidatesTags: [
        { type: 'NetworkHealth', id: 'LIST' }
      ],
      transformResponse: (response: { deleteServiceGuardSpec: DeleteMutationResult }) =>
        response.deleteServiceGuardSpec
    })
  })
})

export const { useNetworkHealthQuery, useNetworkHealthDeleteMutation } = api
