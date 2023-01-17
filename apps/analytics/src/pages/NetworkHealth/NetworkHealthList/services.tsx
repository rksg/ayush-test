import { gql } from 'graphql-request'

import { networkHealthApi }         from '@acx-ui/analytics/services'
import { RequestPayload}               from '@acx-ui/rc/utils'

export type ServiceGuardSpec = {
  id: string,
  name: string,
  type: 'on-demand' | 'scheduled',
  apsCount: string
  userId: string,
  clientType: 'virtual-client' | 'virtual-wireless-client',
  schedule: {
    nextExecutionTime: number
  }
  tests: {
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
}

interface Response {
  allServiceGuardSpecs: ServiceGuardSpec[]
}

export const api = networkHealthApi.injectEndpoints({
  endpoints: (build) => ({
    networkHealth: build.query<
      ServiceGuardSpec[], RequestPayload
    >({
      query: payload => ({
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
        `,
      providesTags: [
        { type: 'Monitoring', id: 'SERVICE_VALIDATION' }
      ],
      transformResponse: (response: Response) => {
        return response.allServiceGuardSpecs
      }
      })
    })
  })
})

export const { useNetworkHealthQuery } = api
