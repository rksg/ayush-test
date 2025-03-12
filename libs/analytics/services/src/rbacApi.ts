import { FetchBaseQueryError, FetchBaseQueryMeta } from '@reduxjs/toolkit/query'
import { QueryReturnValue }                        from '@rtk-query/graphql-request-base-query/dist/GraphqlBaseQueryTypes'
import { groupBy }                                 from 'lodash'

import {
  Settings,
  ManagedUser
} from '@acx-ui/analytics/utils'
import { get }                    from '@acx-ui/config'
import { rbacApi as baseRbacApi } from '@acx-ui/store'
import { noDataDisplay, getIntl } from '@acx-ui/utils'

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
type ResourceGroup = {
  id: string,
  tenantId: string,
  filter: Object
  name: string
  isDefault: false,
  description: string,
  updatedAt: string
}

export type DisplayUser = ManagedUser & {
  displayInvitationState: string
  displayInvitor: string
  displayType: string
}

export type AvailableUser = {
  swuId: string
  userName: string
}

export type UpdateUserPayload = {
  resourceGroupId: string
  role: string
  userId: string
}
export type UpdatePreferencesPayload = {
  userId: string
  preferences: {}
}
export type AddUserPayload = {
  resourceGroupId: string
  role: string
  swuId: string
}
type InviteUserPayload = {
  invitedUserId: string,
  resourceGroupId?: string,
  role?: string,
  type: string
}
export const getDefaultSettings = (): Partial<Settings> => ({
  'brand-ssid-compliance-matcher': '^[a-zA-Z0-9]{5}_GUEST$',
  'sla-p1-incidents-count': '0',
  'sla-guest-experience': '100',
  'sla-brand-ssid-compliance': '100'
})

const getDisplayType = (type: ManagedUser['type'], brand: string) => {
  const { $t } = getIntl()
  switch (type) {
    case 'tenant':
      return $t({ defaultMessage: '3rd Party' })
    case 'super-tenant':
      return brand
    default:
      return $t({ defaultMessage: 'Internal' })
  }
}

const getDisplayState = (
  state: NonNullable<ManagedUser['invitation']>['state'] | undefined
) => {
  const { $t } = getIntl()
  switch (state) {
    case 'accepted':
      return $t({ defaultMessage: 'Accepted' })
    case 'rejected':
      return $t({ defaultMessage: 'Rejected' })
    case 'pending':
      return $t({ defaultMessage: 'Pending' })
    default:
      return noDataDisplay
  }
}

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
      string,
      { resourceGroupId: string; state: string; userId: string }
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
    }),
    deleteInvitation: build.mutation<
      string,
      { resourceGroupId: string; userId: string }
    >({
      query: ({ userId, resourceGroupId }) => {
        return {
          url: '/invitations',
          method: 'delete',
          credentials: 'include',
          headers: {
            'x-mlisa-user-id': userId
          },
          body: { resourceGroupId, invitedUserId: userId },
          responseHandler: 'text'
        }
      },
      invalidatesTags: [
        { type: 'RBAC', id: 'GET_USERS' }
      ]
    }),
    getUsers: build.query<DisplayUser[], string>({
      query: () => ({
        url: '/users',
        method: 'get',
        credentials: 'include'
      }),
      providesTags: [{ type: 'RBAC', id: 'GET_USERS' }],
      transformResponse: (response: ManagedUser[] | undefined, _, brand) => {
        return response?.map(user => ({
          ...user,
          displayType: getDisplayType(user.type, brand),
          displayInvitationState: getDisplayState(user.invitation?.state),
          displayInvitor: user.invitation
            ? [
              user.invitation.inviterUser.firstName,
              '',
              user.invitation.inviterUser.lastName
            ].join(' ')
            : noDataDisplay
        })) || []
      }
    }),
    getAvailableUsers: build.query<AvailableUser[], void>({
      query: () => ({
        url: '/users/available',
        method: 'get',
        credentials: 'include'
      }),
      providesTags: [{ type: 'RBAC', id: 'GET_AVAILABLE_USERS' }]
    }),
    getResourceGroups: build.query<ResourceGroup[], void>({
      query: () => ({
        url: '/resourceGroups',
        method: 'get',
        credentials: 'include'
      }),
      providesTags: [{ type: 'RBAC', id: 'GET_RESOURCE_GROUPS' }]
    }),
    updateUser: build.mutation<string, UpdateUserPayload>({
      query: ({ userId, resourceGroupId, role }) => {
        return {
          url: `/users/${userId}`,
          method: 'put',
          credentials: 'include',
          headers: {
            'x-mlisa-user-id': userId
          },
          body: { resourceGroupId, role },
          responseHandler: 'text'
        }
      },
      invalidatesTags: [{ type: 'RBAC', id: 'GET_USERS' }]
    }),
    addUser: build.mutation<string, AddUserPayload>({
      query: ({ swuId, resourceGroupId, role }) => {
        return {
          url: '/users',
          method: 'post',
          credentials: 'include',
          body: { swuId, resourceGroupId, role },
          responseHandler: 'text'
        }
      },
      invalidatesTags: [
        { type: 'RBAC', id: 'GET_USERS' },
        { type: 'RBAC', id: 'GET_AVAILABLE_USERS' }
      ]
    }),
    findUser: build.query<{ userId: string }, { username: string }>({
      query: ({ username }) => {
        return {
          url: '/users/find',
          method: 'get',
          credentials: 'include',
          params: { username }
        }
      }
    }),
    inviteUser: build.mutation<string, InviteUserPayload>({
      query: ({ invitedUserId, resourceGroupId, role, type }) => {
        return {
          url: '/invitations',
          method: 'post',
          credentials: 'include',
          body: { invitedUserId, resourceGroupId, role, type },
          responseHandler: 'text'
        }
      },
      invalidatesTags: [
        { type: 'RBAC', id: 'GET_USERS' }
      ]
    }),
    refreshUserDetails: build.mutation<string, { userId: string }>({
      query: ({ userId }) => {
        return {
          url: `/users/refresh/${userId}`,
          method: 'put',
          credentials: 'include',
          headers: {
            'x-mlisa-user-id': userId
          },
          responseHandler: 'text'
        }
      },
      invalidatesTags: [
        { type: 'RBAC', id: 'GET_USERS' }
      ]
    }),
    deleteUserResourceGroup: build.mutation<string, { userId: string }>({
      query: ({ userId }) => {
        return {
          url: '/users',
          method: 'delete',
          credentials: 'include',
          body: [userId],
          responseHandler: 'text'
        }
      },
      invalidatesTags: [
        { type: 'RBAC', id: 'GET_USERS' }
      ]
    }),
    updatePreferences: build.mutation<string, UpdatePreferencesPayload>({
      query: ({ userId, preferences }) => {
        return {
          url: `/users/${userId}/preferences`,
          method: 'PATCH',
          credentials: 'include',
          body: { preferences }
        }
      },
      invalidatesTags: [{ type: 'RBAC', id: 'GET_USERS' }]
    }),
    updateAccount: build.mutation<string, { account: string, support: boolean }>({
      query: ({ account, support }) => {
        return {
          url: `/accounts/${account}`,
          method: 'put',
          credentials: 'include',
          body: { support },
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
  useUpdateInvitationMutation,
  useGetUsersQuery,
  useGetAvailableUsersQuery,
  useGetResourceGroupsQuery,
  useUpdateUserMutation,
  useAddUserMutation,
  useLazyFindUserQuery,
  useInviteUserMutation,
  useRefreshUserDetailsMutation,
  useDeleteUserResourceGroupMutation,
  useDeleteInvitationMutation,
  useUpdatePreferencesMutation,
  useUpdateAccountMutation
} = rbacApi

export function useSystems () {
  return useSystemsQuery({}, { skip: !get('IS_MLISA_SA') })
}
