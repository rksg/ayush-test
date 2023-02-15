import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { defineMessage }             from 'react-intl'

import {
  CommonResult,
  createHttpRequest,
  RequestPayload,
  AdministrationUrlsInfo,
  AccountDetails,
  TenantDelegation,
  TenantDelegationResponse,
  RecoveryPassphrase,
  TenantPreferenceSettings,
  Administrator,
  onActivityMessageReceived,
  onSocketActivityChanged,
  Delegation,
  RolesEnum,
  VARTenantDetail,
  RegisteredUserSelectOption,
  ApiInfo,
  ClientConfig,
  RadiusClientConfigUrlsInfo,
  RadiusServerSetting,
  AdministrationDelegationStatus,
  TenantDetails
} from '@acx-ui/rc/utils'

export const baseAdministrationApi = createApi({
  baseQuery: fetchBaseQuery(),
  reducerPath: 'administrationApi',
  tagTypes: ['Administration', 'RadiusClientConfig'],
  refetchOnMountOrArgChange: true,
  endpoints: () => ({ })
})

export const administrationApi = baseAdministrationApi.injectEndpoints({
  endpoints: (build) => ({
    getTenantDetails: build.query<TenantDetails, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(AdministrationUrlsInfo.getTenantDetails, params)
        return {
          ...req
        }
      }
    }),
    getAccountDetails: build.query<AccountDetails, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(AdministrationUrlsInfo.getAccountDetails, params)
        return {
          ...req
        }
      }
    }),
    getRecoveryPassphrase: build.query<RecoveryPassphrase, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(AdministrationUrlsInfo.getRecoveryPassphrase, params)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'Administration', id: 'RECOVER_PASS' }]
    }),
    updateRecoveryPassphrase: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(AdministrationUrlsInfo.updateRecoveryPassphrase, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Administration', id: 'RECOVER_PASS' }]
    }),
    getEcTenantDelegation: build.query<TenantDelegationResponse, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(AdministrationUrlsInfo.getEcTenantDelegation, params)
        return {
          ...req
        }
      },
      transformResponse: (response: TenantDelegation[]) => {
        return {
          isAccessSupported: response.length > 0,
          expiryDate: response[0] && response[0].expiryDate,
          createdDate: response[0] && response[0].createdDate
        }
      },
      providesTags: [{ type: 'Administration', id: 'ACCESS_SUPPORT' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, [
            'DeleteSupportDelegation',
            'InviteSupport'
          ], () => {
            api.dispatch(administrationApi.util.invalidateTags([
              { type: 'Administration', id: 'ACCESS_SUPPORT' }
            ]))
          })
        })
      }
    }),
    getTenantDelegation: build.query<TenantDelegationResponse, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(AdministrationUrlsInfo.getTenantDelegation, params)
        return {
          ...req
        }
      },
      transformResponse: (response: TenantDelegation[]) => {
        return {
          isAccessSupported: response.length > 0,
          expiryDate: response[0] && response[0].expiryDate,
          createdDate: response[0] && response[0].createdDate
        }
      },
      providesTags: [{ type: 'Administration', id: 'ACCESS_SUPPORT' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, [
            'DeleteSupportDelegation',
            'InviteSupport'
          ], () => {
            api.dispatch(administrationApi.util.invalidateTags([
              { type: 'Administration', id: 'ACCESS_SUPPORT' }
            ]))
          })
        })
      }
    }),
    getDelegations: build.query<Delegation[], RequestPayload>({
      query: ({ params }) => {
        const req =
          createHttpRequest(AdministrationUrlsInfo.getDelegations, params)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'Administration', id: 'DELEGATION_LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, [
            'DeleteDelegation',
            'InviteVar'
          ], () => {
            api.dispatch(administrationApi.util.invalidateTags([
              { type: 'Administration', id: 'DELEGATION_LIST' }
            ]))
          })
        })
      }
    }),
    getMspEcDelegations: build.query<Delegation[], RequestPayload>({
      query: ({ params }) => {
        const req =
          createHttpRequest(AdministrationUrlsInfo.getMspEcDelegations, params)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'Administration', id: 'DELEGATION_LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, [
            'DeleteDelegation',
            'InviteVar'
          ], () => {
            api.dispatch(administrationApi.util.invalidateTags([
              { type: 'Administration', id: 'DELEGATION_LIST' }
            ]))
          })
        })
      }
    }),
    enableAccessSupport: build.mutation<TenantDelegationResponse, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(AdministrationUrlsInfo.enableAccessSupport, params)
        return {
          ...req,
          body: payload
        }
      },
      transformResponse: (response: CommonResult) => {
        return {
          isAccessSupported: true,
          expiryDate: (response.response as TenantDelegation).expiryDate,
          createdDate: (response.response as TenantDelegation).createdDate
        }
      },
      invalidatesTags: [{ type: 'Administration', id: 'ACCESS_SUPPORT' }]
    }),
    disableAccessSupport: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(AdministrationUrlsInfo.disableAccessSupport, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Administration', id: 'ACCESS_SUPPORT' }]
    }),
    getPreferences: build.query<TenantPreferenceSettings, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(AdministrationUrlsInfo.getPreferences, params)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'Administration', id: 'PREFERENCES' }]
    }),
    updatePreference: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(AdministrationUrlsInfo.updatePreferences, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Administration', id: 'PREFERENCES' }]
    }),
    getAdminList: build.query<Administrator[], RequestPayload>({
      query: ({ params }) => {
        const req =
          createHttpRequest(AdministrationUrlsInfo.getAdministrators, params)
        return {
          ...req
        }
      },
      transformResponse: (result: Administrator[]) => {
        return transformAdministratorList(result)
      },
      providesTags: [{ type: 'Administration', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, [
            'InviteAdmin',
            'UpdateAdmin',
            'DeleteAdmin',
            'DeleteAdmins'
          ], () => {
            api.dispatch(administrationApi.util.invalidateTags([
              { type: 'Administration', id: 'LIST' }
            ]))
          })
        })
      }
    }),
    addAdmin: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(AdministrationUrlsInfo.addAdmin, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Administration', id: 'LIST' }]
    }),
    updateAdmin: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(AdministrationUrlsInfo.updateAdmin, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Administration', id: 'LIST' }]
    }),
    deleteAdmin: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(AdministrationUrlsInfo.deleteAdmin, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Administration', id: 'LIST' }]
    }),
    deleteAdmins: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(AdministrationUrlsInfo.deleteAdmins, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Administration', id: 'LIST' }]
    }),
    revokeInvitation: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(AdministrationUrlsInfo.revokeInvitation, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Administration', id: 'DELEGATION_LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          if (msg.useCase === 'DeleteDelegation') {
            (requestArgs.callback as Function)()
          }
        })
      }
    }),
    inviteDelegation: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(AdministrationUrlsInfo.inviteVAR, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Administration', id: 'DELEGATION_LIST' }]
    }),
    getRegisteredUsersList: build.query<RegisteredUserSelectOption[], RequestPayload>({
      query: ({ params }) => {
        const req =
          createHttpRequest(AdministrationUrlsInfo.getRegisteredUsersList, params)
        return {
          ...req
        }
      },
      transformResponse: (response: unknown[]) => {
        return response.map((item: unknown) => {
          const { email, externalId } = item as { email: string, externalId: string }

          return {
            externalId: externalId,
            email: email
          }
        })
      }
    }),
    findVARDelegation: build.query<VARTenantDetail, RequestPayload>({
      query: ({ params, payload }) => {
        const { username } = payload as { username: string }
        const api:ApiInfo = { ...AdministrationUrlsInfo.findVAR }
        api.url += `?username=${username}`

        const req = createHttpRequest(api, params)
        return {
          ...req
        }
      }
    }),
    // TODO: backend is not support activity message now, and will add if function be completed.
    UpdateRadiusClientConfig: build.mutation<ClientConfig, RequestPayload>({
      query: ({ payload }) => {
        const req = createHttpRequest(RadiusClientConfigUrlsInfo.updateRadiusClient)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'RadiusClientConfig', id: 'DETAIL' }]
    }),
    getRadiusClientConfig: build.query<ClientConfig, RequestPayload>({
      query: () => {
        const req = createHttpRequest(RadiusClientConfigUrlsInfo.getRadiusClient)
        return{
          ...req
        }
      },
      providesTags: [{ type: 'RadiusClientConfig', id: 'DETAIL' }]
    }),
    getRadiusServerSetting: build.query<RadiusServerSetting, RequestPayload>({
      query: () => {
        const req = createHttpRequest(RadiusClientConfigUrlsInfo.getRadiusServerSetting)
        return{
          ...req
        }
      }
    })
  })
})

export const GetRoleIntlString = ( role: RolesEnum ) => {
  switch (role) {
    case RolesEnum.PRIME_ADMIN:
      return defineMessage({ defaultMessage: 'Prime Admin' })
    case RolesEnum.ADMINISTRATOR:
      return defineMessage({ defaultMessage: 'Administrator' })
    case RolesEnum.GUEST_MANAGER:
      return defineMessage({ defaultMessage: 'Guest Manager' })
    case RolesEnum.READ_ONLY:
      return defineMessage({ defaultMessage: 'Read Only' })
    default:
      return defineMessage({ defaultMessage: 'Known' })
  }
}


export const GetRoleStr = ( role: RolesEnum ) => {
  switch (role) {
    case RolesEnum.PRIME_ADMIN:
      return 'Prime Admin'
    case RolesEnum.ADMINISTRATOR:
      return 'Administrator'
    case RolesEnum.GUEST_MANAGER:
      return 'Guest Manager'
    case RolesEnum.READ_ONLY:
      return 'Read Only'
    default:
      return 'Unknown'
  }
}

export const getRoles = () => {
  return [
    {
      label: GetRoleIntlString(RolesEnum.PRIME_ADMIN),
      value: RolesEnum.PRIME_ADMIN
    },
    {
      label: GetRoleIntlString(RolesEnum.ADMINISTRATOR),
      value: RolesEnum.ADMINISTRATOR
    },
    {
      label: GetRoleIntlString(RolesEnum.GUEST_MANAGER),
      value: RolesEnum.GUEST_MANAGER
    },
    {
      label: GetRoleIntlString(RolesEnum.READ_ONLY),
      value: RolesEnum.READ_ONLY
    }]
}

export const getDelegetionStatusIntlString = (status: AdministrationDelegationStatus) => {
  switch (status) {
    case AdministrationDelegationStatus.INVITED :
      return defineMessage({ defaultMessage: 'Invitation sent' })
    case AdministrationDelegationStatus.ACCEPTED :
      return defineMessage({ defaultMessage: 'Access granted' })
    case AdministrationDelegationStatus.REJECTED :
      return defineMessage({ defaultMessage: 'Invitation declined' })
    case AdministrationDelegationStatus.REVOKED :
      return defineMessage({ defaultMessage: 'revoked' })
    default:
      return defineMessage({ defaultMessage: 'Unknown' })
  }
}

const transformAdministratorList = (data: Administrator[]) => {
  return data.map(item => {
    item.name = (item.name && item.name !== 'first') ? item.name : ''
    item.lastName = (item.lastName && item.lastName !== 'last') ? item.lastName : ''
    item.fullName = item.name + ' ' + item.lastName
    item.roleDsc = GetRoleStr(item.role)

    return item
  })
}

export const {
  useGetTenantDetailsQuery,
  useGetAccountDetailsQuery,
  useGetRecoveryPassphraseQuery,
  useUpdateRecoveryPassphraseMutation,
  useGetEcTenantDelegationQuery,
  useGetTenantDelegationQuery,
  useEnableAccessSupportMutation,
  useDisableAccessSupportMutation,
  useGetPreferencesQuery,
  useUpdatePreferenceMutation,
  useGetAdminListQuery,
  useAddAdminMutation,
  useUpdateAdminMutation,
  useDeleteAdminMutation,
  useDeleteAdminsMutation,
  useGetDelegationsQuery,
  useGetMspEcDelegationsQuery,
  useRevokeInvitationMutation,
  useInviteDelegationMutation,
  useGetRegisteredUsersListQuery,
  useFindVARDelegationQuery,
  useLazyFindVARDelegationQuery,
  useGetRadiusClientConfigQuery,
  useUpdateRadiusClientConfigMutation,
  useGetRadiusServerSettingQuery
} = administrationApi
