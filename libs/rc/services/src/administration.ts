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
  onSocketActivityChanged,
  NotificationRecipientUIModel,
  NotificationRecipientResponse,
  NotificationEndpointType,
  NotificationEndpoint,
  ClientConfig,
  RadiusClientConfigUrlsInfo,
  RadiusServerSetting,
  EntitlementSummary,
  Entitlement,
  NewEntitlementSummary
} from '@acx-ui/rc/utils'

export const baseAdministrationApi = createApi({
  baseQuery: fetchBaseQuery(),
  reducerPath: 'administrationApi',
  tagTypes: ['Administration', 'License', 'RadiusClientConfig'],
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
    getNotificationRecipients: build.query<NotificationRecipientUIModel[], RequestPayload>({
      query: ({ params }) => {
        const req =
          createHttpRequest(AdministrationUrlsInfo.getNotificationRecipients, params)
        return {
          ...req
        }
      },
      transformResponse: (response: NotificationRecipientResponse[]) => {
        // flat endpoint into individual fields
        return response.map((data: NotificationRecipientResponse) => {
          const result = {
            id: data.id,
            description: data.description,
            endpoints: data.endpoints
          } as NotificationRecipientUIModel

          data.endpoints.forEach((endpoint: NotificationEndpoint) => {
            switch (endpoint.type) {
              case (NotificationEndpointType.email):
                result.email = endpoint.destination
                result.emailEnabled = endpoint.active
                break
              case (NotificationEndpointType.sms):
              case (NotificationEndpointType.mobile_push):
                result.mobile = endpoint.destination
                result.mobileEnabled = endpoint.active
                break
            }
          })

          return result
        })
      },
      providesTags: [{ type: 'Administration', id: 'NOTIFICATION_LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, [
            'AddNotificationRecipient',
            'UpdateNotificationRecipient',
            'DeleteNotificationRecipient'
          ], () => {
            api.dispatch(administrationApi.util.invalidateTags([
              { type: 'Administration', id: 'NOTIFICATION_LIST' }
            ]))
          })
        })
      }
    }),
    addRecipient: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(AdministrationUrlsInfo.addRecipient, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Administration', id: 'NOTIFICATION_LIST' }]
    }),
    updateRecipient: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(AdministrationUrlsInfo.updateRecipient, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Administration', id: 'NOTIFICATION_LIST' }]
    }),
    deleteNotificationRecipients: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(AdministrationUrlsInfo.deleteNotificationRecipients, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Administration', id: 'NOTIFICATION_LIST' }]
    }),
    deleteNotificationRecipient: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(AdministrationUrlsInfo.deleteNotificationRecipient, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Administration', id: 'NOTIFICATION_LIST' }]
    }),
    getEntitlementSummary: build.query<EntitlementSummary[], RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(AdministrationUrlsInfo.getEntitlementSummary, params)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'License', id: 'LIST' }],
      transformResponse: (response) => {
        return AdministrationUrlsInfo.getEntitlementSummary.newApi ?
          (response as NewEntitlementSummary).summary : response as EntitlementSummary[]
      }
    }),
    getEntitlementsList: build.query<Entitlement[], RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(AdministrationUrlsInfo.getEntitlementsList, params)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'License', id: 'LIST' }]
    }),
    refreshEntitlements: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(AdministrationUrlsInfo.refreshLicensesData, params)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'License', id: 'LIST' }]
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
  useGetNotificationRecipientsQuery,
  useAddRecipientMutation,
  useUpdateRecipientMutation,
  useDeleteNotificationRecipientsMutation,
  useDeleteNotificationRecipientMutation,
  useGetEntitlementSummaryQuery,
  useGetEntitlementsListQuery,
  useRefreshEntitlementsMutation,
  useGetRadiusClientConfigQuery,
  useUpdateRadiusClientConfigMutation,
  useGetRadiusServerSettingQuery
} = administrationApi
