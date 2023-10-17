import { FetchBaseQueryError, FetchBaseQueryMeta } from '@reduxjs/toolkit/dist/query'
import { QueryReturnValue }                        from '@rtk-query/graphql-request-base-query/dist/GraphqlBaseQueryTypes'

import { get }                                from '@acx-ui/config'
import { rbacApi as baseRbacApi, rbacApiURL } from '@acx-ui/store'

export type System = {
  deviceId: string
  deviceName: string
  onboarded: boolean
  controllerVersion: string
}

export const rbacApi = baseRbacApi.injectEndpoints({
  endpoints: (build) => ({
    systems: build.query({
      async queryFn (_params, _queryApi, _extraOptions, fetch) {
        const result = await fetch(`${rbacApiURL}/systems`)
        return result as QueryReturnValue<
          { networkNodes: System[] }, FetchBaseQueryError, FetchBaseQueryMeta>
      },
      providesTags: [{ type: 'RBAC', id: 'systems' }]
    })
  })
})

export const { useSystemsQuery } = rbacApi

export function useSystems () {
  return useSystemsQuery({}, { skip: !get('IS_MLISA_SA') })
}