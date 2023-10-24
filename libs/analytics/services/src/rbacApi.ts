import { FetchBaseQueryError, FetchBaseQueryMeta } from '@reduxjs/toolkit/dist/query'
import { QueryReturnValue }                        from '@rtk-query/graphql-request-base-query/dist/GraphqlBaseQueryTypes'
import { groupBy }                                 from 'lodash'

import { get }                                from '@acx-ui/config'
import { rbacApi as baseRbacApi, rbacApiURL } from '@acx-ui/store'

export type System = {
  deviceId: string
  deviceName: string
  onboarded: boolean
  controllerVersion: string
}

export type SystemMap = Record<string, System[]>

export const rbacApi = baseRbacApi.injectEndpoints({
  endpoints: (build) => ({
    systems: build.query({
      async queryFn (_params, _queryApi, _extraOptions, fetch) {
        const result = await fetch(`${rbacApiURL}/systems`)
        return {
          ...result,
          data: result.data && groupBy(
            (result.data as { networkNodes: System[] }).networkNodes, 'deviceName')
        } as QueryReturnValue<SystemMap, FetchBaseQueryError, FetchBaseQueryMeta>
      },
      providesTags: [{ type: 'RBAC', id: 'systems' }]
    })
  })
})

export const { useSystemsQuery } = rbacApi

export function useSystems () {
  return useSystemsQuery({}, { skip: !get('IS_MLISA_SA') })
}