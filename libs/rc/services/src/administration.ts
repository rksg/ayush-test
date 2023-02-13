import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

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
  onActivityMessageReceived,
  onSocketActivityChanged, ClientConfig, RadiusClientConfigUrlsInfo, RadiusServerSetting
} from '@acx-ui/rc/utils'

export const baseAdministrationApi = createApi({
  baseQuery: fetchBaseQuery({
    credentials: 'include'
  }),
  reducerPath: 'administrationApi',
  tagTypes: ['Administration', 'RadiusClientConfig'],
  refetchOnMountOrArgChange: true,
  endpoints: () => ({ })
})

export const administrationApi = baseAdministrationApi.injectEndpoints({
  endpoints: (build) => ({
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

export const {
  useGetAccountDetailsQuery,
  useGetRecoveryPassphraseQuery,
  useUpdateRecoveryPassphraseMutation,
  useGetEcTenantDelegationQuery,
  useGetTenantDelegationQuery,
  useEnableAccessSupportMutation,
  useDisableAccessSupportMutation,
  useGetPreferencesQuery,
  useUpdatePreferenceMutation,
  useGetRadiusClientConfigQuery,
  useUpdateRadiusClientConfigMutation,
  useGetRadiusServerSettingQuery
} = administrationApi
