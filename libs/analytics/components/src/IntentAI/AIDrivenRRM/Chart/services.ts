import { gql } from 'graphql-request'

import { intentAIApi } from '@acx-ui/store'

type ApChannelDistributionResponse = {
  channel: number
  apCount: number
}

type ApPowerDistributionResponse = {
  txPower: string
  apCount: number
}

export const api = intentAIApi.injectEndpoints({
  endpoints: (build) => ({
    apChannelDistribution: build.query<ApChannelDistributionResponse[], {
      root: string, sliceId: string, code: string }>({
        query: ({ root, sliceId, code }) => ({
          document: gql`
            query ApChannelDistribution($root: String!, $sliceId: String!, $code: String!) {
              intent(root: $root, sliceId: $sliceId, code: $code) {
                apChannelDistribution {
                  channel
                  apCount
                }
              }
            }
          `,
          variables: { root, sliceId, code }
        }),
        transformResponse: (response: { intent: {
          apChannelDistribution: ApChannelDistributionResponse[] } }
        ) => response.intent.apChannelDistribution
      }),
    apPowerDistribution: build.query<ApPowerDistributionResponse[], {
      root: string, sliceId: string, code: string }>({
        query: ({ root, sliceId, code }) => ({
          document: gql`
            query ApPowerDistribution($root: String!, $sliceId: String!, $code: String!) {
              intent(root: $root, sliceId: $sliceId, code: $code) {
                apPowerDistribution {
                  txPower
                  apCount
                }
              }
            }
          `,
          variables: { root, sliceId, code }
        }),
        transformResponse: (response: { intent: {
          apPowerDistribution: ApPowerDistributionResponse[] } }
        ) => response.intent.apPowerDistribution
      })
  })
})

export const { useApChannelDistributionQuery, useApPowerDistributionQuery } = api
