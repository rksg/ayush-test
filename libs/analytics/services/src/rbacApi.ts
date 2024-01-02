import { FetchBaseQueryError, FetchBaseQueryMeta } from '@reduxjs/toolkit/dist/query'
import { QueryReturnValue }                        from '@rtk-query/graphql-request-base-query/dist/GraphqlBaseQueryTypes'
import { groupBy }                                 from 'lodash'

import { Settings }               from '@acx-ui/analytics/utils'
import { get }                    from '@acx-ui/config'
import { rbacApi as baseRbacApi } from '@acx-ui/store'

export type System = {
  deviceId: string
  deviceName: string
  onboarded: boolean
  controllerVersion: string
}
export type SystemMap = Record<string, System[]>
type SettingRow = {
  key: string
  value: string
}

export const getDefaultSettings = (): Partial<Settings> => ({
  'brand-ssid-compliance-matcher': '^[a-zA-Z0-9]{5}_GUEST$',
  'sla-p1-incidents-count': '0',
  'sla-guest-experience': '100',
  'sla-brand-ssid-compliance': '100'
})

export const rbacApi = baseRbacApi.injectEndpoints({
  endpoints: (build) => ({
    systems: build.query({
      async queryFn (_params, _queryApi, _extraOptions, fetch) {
        const result = await fetch('/systems')
        return {
          ...result,
          data: result.data && groupBy(
            (result.data as { networkNodes: System[] }).networkNodes, 'deviceName')
        } as QueryReturnValue<SystemMap, FetchBaseQueryError, FetchBaseQueryMeta>
      },
      providesTags: [{ type: 'RBAC', id: 'systems' }]
    }),
    getTenantSettings: build.query<Partial<Settings>, void>({
      query: () => ({
        url: '/tenantSettings',
        method: 'get',
        credentials: 'include'
      }),
      providesTags: [{ type: 'RBAC', id: 'GET_TENANT_SETTINGS' }],
      transformResponse: (response: SettingRow[]) => response.reduce((settings, { key, value }) => {
        settings[key as keyof Settings] = value
        return settings
      }, getDefaultSettings())
    }),
    updateTenantSettings: build.mutation<string, Partial<Settings>>({
      query: body => {
        return {
          url: '/tenantSettings',
          method: 'post',
          credentials: 'include',
          body,
          responseHandler: 'text'
        }
      },
      invalidatesTags: [{ type: 'RBAC', id: 'GET_TENANT_SETTINGS' }]
    }),
    updateInvitation: build.mutation<
       string, { resourceGroupId: string, state: string, userId: string }
    >({
      query: ({ userId, resourceGroupId, state }) => {
        return {
          url: '/invitations',
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

export const {
  useSystemsQuery,
  useGetTenantSettingsQuery,
  useUpdateTenantSettingsMutation,
  useUpdateInvitationMutation
} = rbacApi

export function useSystems () {
  return useSystemsQuery({}, { skip: !get('IS_MLISA_SA') })
}