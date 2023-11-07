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

export type SystemMap = Record<string, System[]>

export const rbacApi = baseRbacApi.injectEndpoints({
  endpoints: (build) => ({
    systems: build.query({
      async queryFn (_params, _queryApi, _extraOptions, fetch) {
        const result = await fetch(`${rbacApiURL}/systems`)
        return result as QueryReturnValue<
          { networkNodes: System[] }, FetchBaseQueryError, FetchBaseQueryMeta>
      },
      providesTags: [{ type: 'RBAC', id: 'systems' }]
    }),
    updateInvitation: build.mutation<
       string, { resourceGroupId: string, state: string, userId: string }
    >({
      query: ({ userId, resourceGroupId, state }) => {
        return {
          url: `${rbacApiURL}/invitations`,
          method: 'put',
          credentials: 'include',
          headers: {
            'x-mlisa-user-id': userId
          },
          body: { resourceGroupId, state },
          responseHandler: 'text'
        }
      }
    })
  })
})

export const { useSystemsQuery, useUpdateInvitationMutation } = rbacApi

export function useSystems () {
  return useSystemsQuery({}, { skip: !get('IS_MLISA_SA') })
}