import { gql } from 'graphql-request'

import { networkHealthApi } from '@acx-ui/analytics/services'

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

type RunNetworkHealthTestResult = MutationResult<{
  selectedId: string
}>

export const api = networkHealthApi.injectEndpoints({
  endpoints: (build) => ({
    networkHealth: build.query<ServiceGuardSpec[], void>({
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
      DeleteMutationResult, { id: ServiceGuardSpec['id'] }
    >({
      query: (variables) => ({
        variables,
        document: gql`
          mutation DeleteServiceGuardSpec ($id: String!) {
            deleteServiceGuardSpec (id: $id) {
              deletedSpecId
              userErrors {
                field message
              }
            }
          }
        `
      }),
      invalidatesTags: [
        { type: 'NetworkHealth', id: 'LIST' }
      ],
      transformResponse: (response: { deleteServiceGuardSpec: DeleteMutationResult }) =>
        response.deleteServiceGuardSpec
    }),
    networkHealthRun: build.mutation<
      RunNetworkHealthTestResult, { id: ServiceGuardSpec['id'] }
    >({
      query: (variables) => ({
        variables,
        document: gql`
          mutation RunNetworkHealthTest ($id: String!) {
            runServiceGuardTest (id: $id) {
              userErrors { field message }
              spec {
                id
                name
                type
                apsCount
                userId
                clientType
                tests (limit: 1) {
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
                schedule {
                  nextExecutionTime
                }
              }
            }
          }
        `
      }),
      transformResponse: (response: { runServiceGuardTest: RunNetworkHealthTestResult }) =>
        response.runServiceGuardTest
    })
  })
})

export const {
  useNetworkHealthQuery,
  useNetworkHealthDeleteMutation,
  useNetworkHealthRunMutation
} = api
