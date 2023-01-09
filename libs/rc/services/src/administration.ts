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
  TenantPreferenceSettings
} from '@acx-ui/rc/utils'

export const baseAdministrationApi = createApi({
  baseQuery: fetchBaseQuery(),
  reducerPath: 'administrationApi',
  tagTypes: ['administration'],
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
      providesTags: [{ type: 'administration', id: 'RECOVER_PASS' }]
    }),
    updateRecoveryPassphrase: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(AdministrationUrlsInfo.updateRecoveryPassphrase, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'administration', id: 'RECOVER_PASS' }]
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
          expiryDate: response[0] && response[0].expiryDate
        }
      },
      providesTags: [{ type: 'administration', id: 'ACCESS_SUPPORT' }]
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
          expiryDate: response[0] && response[0].expiryDate
        }
      },
      providesTags: [{ type: 'administration', id: 'ACCESS_SUPPORT' }]
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
          expiryDate: (response.response as TenantDelegation).expiryDate
        }
      },
      invalidatesTags: [{ type: 'administration', id: 'ACCESS_SUPPORT' }]
    }),
    disableAccessSupport: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(AdministrationUrlsInfo.disableAccessSupport, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'administration', id: 'ACCESS_SUPPORT' }]
    }),
    getPreferences: build.query<TenantPreferenceSettings, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(AdministrationUrlsInfo.getPreferences, params)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'administration', id: 'PREFERENCES' }]
    }),
    updatePreference: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(AdministrationUrlsInfo.updatePreferences, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'administration', id: 'PREFERENCES' }]
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
  useUpdatePreferenceMutation
} = administrationApi
