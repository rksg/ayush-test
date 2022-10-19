import { gql } from 'graphql-request'

import { dataApi }     from '@acx-ui/analytics/services'
import { kpiConfig }   from '@acx-ui/analytics/utils'
import { NetworkPath } from '@acx-ui/utils'

type ConfigCode = keyof typeof kpiConfig

type ThresholdResponse = Record<ConfigCode, {
  value: number | null,
  updateBy: string | null,
  updateAt: string | null
}>

type ThresholdPayload = {
  path: NetworkPath,
  configCode: ConfigCode[]
}

type ThresholdPermissionResponse = {
  data: {
    ThresholdMutationAllowed: boolean
  }
}

type ThresholdPermissionPayload = {
  path: NetworkPath
}

export const configApi = dataApi.injectEndpoints({
  endpoints: (build) => ({
    fetchThreshold: build.query<
    ThresholdResponse,
    ThresholdPayload
    >({
      query: (payload) => ({
        document: gql`
          query KPIThresholdQuery($path: [HierarchyNodeInput], $name: String) {
            ${payload.configCode.map((code) => `
              ${code}: KPIThreshold(name: $name, networkPath: $path) {
              value
              updatedBy
              updatedAt
              }`)
          .join('\n')
        }
        }`,
        variables: {
          path: payload.path,
          name: payload.configCode
        }
      })
    }),
    fetchThresholdPermission: build.query<
    ThresholdPermissionResponse,
    ThresholdPermissionPayload
    >({
      query: (payload) => ({
        document: gql`
        query KPIThresholdPermissionQuery($path: [HierarchyNodeInput]) {
          ThresholdMutationAllowed(networkPath: $path)
        }
        `,
        variables: {
          path: payload.path
        }
      })
    })
  })
})

export const { useFetchThresholdQuery, useFetchThresholdPermissionQuery } = configApi
