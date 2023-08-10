import {
  CommonResult,
  AdministrationUrlsInfo,
  AccountDetails,
  TenantDelegation,
  TenantDelegationResponse,
  RecoveryPassphrase,
  TenantPreferenceSettings,
  TenantAccountTierValue,
  Administrator,
  onActivityMessageReceived,
  onSocketActivityChanged,
  Delegation,
  VARTenantDetail,
  RegisteredUserSelectOption,
  NotificationRecipientUIModel,
  NotificationRecipientResponse,
  NotificationEndpointType,
  NotificationEndpoint,
  ClientConfig,
  RadiusClientConfigUrlsInfo,
  RadiusServerSetting,
  TenantDetails,
  EntitlementSummary,
  Entitlement,
  NewEntitlementSummary,
  TenantAuthentications
} from '@acx-ui/rc/utils'
import { baseAdministrationApi }                        from '@acx-ui/store'
import { RequestPayload }                               from '@acx-ui/types'
import { ApiInfo, createHttpRequest, ignoreErrorModal } from '@acx-ui/utils'

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
        const req = createHttpRequest(AdministrationUrlsInfo.inviteVAR, params, {
          ...ignoreErrorModal
        })
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
        const req = createHttpRequest(AdministrationUrlsInfo.addRecipient, params, {
          ...ignoreErrorModal
        })
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Administration', id: 'NOTIFICATION_LIST' }]
    }),
    updateRecipient: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(AdministrationUrlsInfo.updateRecipient, params, {
          ...ignoreErrorModal
        })
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
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, [
            'Refresh License'
          ], () => {
            api.dispatch(administrationApi.util.invalidateTags([
              { type: 'License', id: 'LIST' }
            ]))
          })
        })
      },
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
      providesTags: [{ type: 'License', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, [
            'Refresh License'
          ], () => {
            api.dispatch(administrationApi.util.invalidateTags([
              { type: 'License', id: 'LIST' }
            ]))
          })
        })
      }
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
    internalRefreshEntitlements: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(AdministrationUrlsInfo.internalRefreshLicensesData, params)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'License', id: 'LIST' }]
    }),
    convertNonVARToMSP: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(AdministrationUrlsInfo.convertNonVARToMSP, params, {
          ...ignoreErrorModal
        })
        return {
          ...req,
          body: payload
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
    }),
    getTenantAuthentications: build.query<TenantAuthentications[], RequestPayload>({
      query: ({ params }) => {
        const req =
          createHttpRequest(AdministrationUrlsInfo.getTenantAuthentications, params)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'Administration', id: 'AUTHENTICATION_LIST' }]
    }),
    deleteTenantAuthentications: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(AdministrationUrlsInfo.deleteTenantAuthentications, params)
        return {
          ...req,
          body: payload
        }
      }
    }),
    addTenantAuthentications: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(AdministrationUrlsInfo.addTenantAuthentications, params)
        return {
          ...req,
          body: payload
        }
      }
    }),
    updateTenantAuthentications: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(AdministrationUrlsInfo.updateTenantAuthentications, params)
        return {
          ...req,
          body: payload
        }
      }
    }),
    getAccountTier: build.query<TenantAccountTierValue, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(AdministrationUrlsInfo.getAccountTier, params)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'Administration', id: 'ACCOUNT_TIER' }]
    })
  })
})

const transformAdministratorList = (data: Administrator[]) => {
  return data.map(item => {
    item.name = (item.name && item.name !== 'first') ? item.name : ''
    item.lastName = (item.lastName && item.lastName !== 'last') ? item.lastName : ''
    item.fullName = item.name + ' ' + item.lastName

    return item
  })
}

export const {
  useGetTenantDetailsQuery,
  useLazyGetTenantDetailsQuery,
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
  useLazyGetDelegationsQuery,
  useGetMspEcDelegationsQuery,
  useRevokeInvitationMutation,
  useInviteDelegationMutation,
  useGetRegisteredUsersListQuery,
  useFindVARDelegationQuery,
  useLazyFindVARDelegationQuery,
  useGetNotificationRecipientsQuery,
  useAddRecipientMutation,
  useUpdateRecipientMutation,
  useDeleteNotificationRecipientsMutation,
  useDeleteNotificationRecipientMutation,
  useGetEntitlementSummaryQuery,
  useGetEntitlementsListQuery,
  useRefreshEntitlementsMutation,
  useInternalRefreshEntitlementsMutation,
  useConvertNonVARToMSPMutation,
  useGetRadiusClientConfigQuery,
  useUpdateRadiusClientConfigMutation,
  useGetRadiusServerSettingQuery,
  useGetTenantAuthenticationsQuery,
  useDeleteTenantAuthenticationsMutation,
  useAddTenantAuthenticationsMutation,
  useUpdateTenantAuthenticationsMutation,
  useGetAccountTierQuery
} = administrationApi
