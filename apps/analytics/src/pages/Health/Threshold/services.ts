import { gql } from 'graphql-request'

import { dataApi }     from '@acx-ui/analytics/services'
import { kpiConfig }   from '@acx-ui/analytics/utils'
import { NetworkPath } from '@acx-ui/utils'

export type ConfigCode = keyof typeof kpiConfig

export type ThresholdResponse = Partial<{
  [k in ConfigCode]: {
      value: number | null,
      updateBy: string | null,
      updateAt: string | null
  }
}>

export type ThresholdPayload = {
  path: NetworkPath,
  configCode: ConfigCode[]
}

export type ThresholdPermissionResponse = {
  mutationAllowed: boolean
}

export type ThresholdPermissionPayload = {
  path: NetworkPath
}

export type ThresholdMutationPayload = {
  path: NetworkPath,
  name: ConfigCode,
  value: number
}

export type ThresholdMutationResponse = {
  data?: Partial<{
    [k in ConfigCode]: {
      success: boolean
    }
  }>
}

export const configApi = dataApi.injectEndpoints({
  endpoints: (build) => ({
    fetchThresholdPermission: build.query<
    ThresholdPermissionResponse,
    ThresholdPermissionPayload
    >({
      query: (payload) => ({
        document: gql`
        query KPI($path: [HierarchyNodeInput]) {
          mutationAllowed: ThresholdMutationAllowed(networkPath: $path)
        }
        `,
        variables: {
          path: payload.path
        }
      })
    }),
    saveThreshold: build.mutation<
    ThresholdMutationResponse,
    ThresholdMutationPayload
    >({
      query: (payload) => ({
        document: gql`
        mutation SaveThreshold(
            $name: String!
            $value: Float!
            $networkPath: [HierarchyNodeInput]
          ) {
            saveThreshold: KPIThreshold(name: $name, value: $value, networkPath: $networkPath) {
              success
            }
          }
        `,
        variables: {
          networkPath: payload.path,
          name: payload.name,
          value: payload.value
        }
      }),
      invalidatesTags: [{ type: 'Monitoring', id: 'KPI_THRESHOLD_CONFIG' }]
    })
  })
})

export const {
  useFetchThresholdPermissionQuery,
  useSaveThresholdMutation
} = configApi
