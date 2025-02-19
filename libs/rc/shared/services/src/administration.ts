import {
  CommonResult,
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
  TenantAuthentications,
  AdminGroup,
  AdminGroupLastLogins,
  CustomRole,
  PrivilegeGroup,
  EntitlementPendingActivations,
  AdminRbacUrlsInfo,
  NotificationSmsUsage,
  NotificationSmsConfig,
  TwiliosIncommingPhoneNumbers,
  TwiliosMessagingServices,
  TwiliosWhatsappServices,
  Webhook,
  TableResult,
  ScopeFeature,
  NotificationRecipientType,
  PrivacyFeatures,
  PrivacySettings
} from '@acx-ui/rc/utils'
import { baseAdministrationApi }                        from '@acx-ui/store'
import { RequestPayload }                               from '@acx-ui/types'
import { ApiInfo, createHttpRequest, ignoreErrorModal } from '@acx-ui/utils'

const getAdminUrls = (enableRbac?: boolean | unknown) => {
  return enableRbac ? AdminRbacUrlsInfo : AdministrationUrlsInfo
}

export const administrationApi = baseAdministrationApi.injectEndpoints({
  endpoints: (build) => ({
    getTenantDetails: build.query<TenantDetails, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(AdministrationUrlsInfo.getTenantDetails, params)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'Administration', id: 'DETAIL' }]
    }),
    updateTenantSelf: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(AdministrationUrlsInfo.updateTenantSelf, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Administration', id: 'DETAIL' }]
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
      query: ({ params, payload, enableRbac }) => {
        const adminUrls = getAdminUrls(enableRbac)
        const req = createHttpRequest(adminUrls.enableAccessSupport, params)
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
      query: ({ params, payload, enableRbac }) => {
        const adminUrls = getAdminUrls(enableRbac)
        const req = createHttpRequest(adminUrls.disableAccessSupport, params)
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
            emailPreferences: data.emailPreferences,
            smsPreferences: data.smsPreferences,
            privilegeGroup: data.privilegeGroupId,
            recipientType: data.privilegeGroupId
              ? NotificationRecipientType.PRIVILEGEGROUP : NotificationRecipientType.GLOBAL,
            endpoints: data.endpoints
          } as NotificationRecipientUIModel

          data.endpoints?.forEach((endpoint: NotificationEndpoint) => {
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
      },
      transformResponse: (result: Entitlement[]) => {
        result.forEach(item => {
          item.effectiveDate = new Date(item.effectiveDate).toISOString()
          item.expirationDate = new Date(item.expirationDate).toISOString()
        })
        return result
      }
    }),
    getEntitlementActivations: build.query<EntitlementPendingActivations, RequestPayload>({
      query: ({ params, payload }) => {
        const req =
          createHttpRequest(AdministrationUrlsInfo.getEntitlementsActivations, params)
        return {
          ...req,
          body: payload
        }
      },
      providesTags: [{ type: 'License', id: 'ACTIVATIONS' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, [
            'Activate Entitlement'
          ], () => {
            api.dispatch(administrationApi.util.invalidateTags([
              { type: 'License', id: 'ACTIVATIONS' }
            ]))
          })
        })
      }
    }),
    patchEntitlementsActivations: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(AdministrationUrlsInfo.patchEntitlementsActivations, params)
        return {
          ...req,
          body: payload
        }
      }
    }),
    refreshEntitlements: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const adminUrls = getAdminUrls(enableRbac)
        const req = createHttpRequest(adminUrls.refreshLicensesData, params)
        return {
          ...req,
          body: enableRbac ? payload : undefined
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
    patchTenantAuthentications: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(AdministrationUrlsInfo.patchTenantAuthentications, params)
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
    getAdminGroups: build.query<AdminGroup[], RequestPayload>({
      query: ({ params }) => {
        const req =
          createHttpRequest(AdministrationUrlsInfo.getAdminGroups, params)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'Administration', id: 'ADMINGROUP_LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, [
            'addGroup',
            'patchGroup',
            'deleteGroups'
          ], () => {
            api.dispatch(administrationApi.util.invalidateTags([
              { type: 'Administration', id: 'ADMINGROUP_LIST' }
            ]))
          })
        })
      }

    }),
    deleteAdminGroups: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(AdministrationUrlsInfo.deleteAdminGroups, params)
        return {
          ...req,
          body: payload
        }
      }
    }),
    addAdminGroups: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(AdministrationUrlsInfo.addAdminGroups, params)
        return {
          ...req,
          body: payload
        }
      }
    }),
    updateAdminGroups: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(AdministrationUrlsInfo.updateAdminGroups, params)
        return {
          ...req,
          body: payload
        }
      }
    }),
    getAdminGroupLastLogins: build.query<AdminGroupLastLogins, RequestPayload>({
      query: ({ params }) => {
        const req =
          createHttpRequest(AdministrationUrlsInfo.getAdminGroupLastLogins, params)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'Administration', id: 'ADMINGROUP_LIST' }]
    }),
    getCustomRoles: build.query<CustomRole[], RequestPayload>({
      query: ({ params }) => {
        const req =
          createHttpRequest(AdministrationUrlsInfo.getCustomRoles, params)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'Administration', id: 'CUSTOMROLE_LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, [
            'addCustomRole',
            'updateCustomRole',
            'deleteCustomRole'
          ], () => {
            api.dispatch(administrationApi.util.invalidateTags([
              { type: 'Administration', id: 'CUSTOMROLE_LIST' }
            ]))
          })
        })
      }
    }),
    addCustomRole: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(AdministrationUrlsInfo.addCustomRole, params)
        return {
          ...req,
          body: payload
        }
      }
    }),
    updateCustomRole: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(AdministrationUrlsInfo.updateCustomRole, params)
        return {
          ...req,
          body: payload
        }
      }
    }),
    deleteCustomRole: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(AdministrationUrlsInfo.deleteCustomRole, params)
        return {
          ...req,
          body: payload
        }
      }
    }),
    getCustomRoleFeatures: build.query<ScopeFeature[], RequestPayload>({
      query: ({ params }) => {
        const req =
          createHttpRequest(AdministrationUrlsInfo.getCustomRoleFeatures, params)
        return {
          ...req
        }
      }
    }),
    getMspEcPrivilegeGroups: build.query<PrivilegeGroup[], RequestPayload>({
      query: ({ params }) => {
        const CUSTOM_HEADER = {
          'x-rks-tenantid': params?.mspEcTenantId
        }
        const req = createHttpRequest(
          AdministrationUrlsInfo.getPrivilegeGroups, params, CUSTOM_HEADER, true)
        return{
          ...req
        }
      },
      providesTags: [{ type: 'Administration', id: 'PRIVILEGEGROUP_LIST' }]
    }),
    getOnePrivilegeGroup: build.query<PrivilegeGroup, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(AdministrationUrlsInfo.getOnePrivilegeGroup, params)
        return{
          ...req
        }
      },
      providesTags: [{ type: 'Administration', id: 'PRIVILEGEGROUP_LIST' }]
    }),
    getPrivilegeGroups: build.query<PrivilegeGroup[], RequestPayload>({
      query: ({ params }) => {
        const req =
          createHttpRequest(AdministrationUrlsInfo.getPrivilegeGroups, params)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'Administration', id: 'PRIVILEGEGROUP_LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, [
            'addPrivilegeGroup',
            'updatePrivilegeGroup',
            'deletePrivilegeGroup'
          ], () => {
            api.dispatch(administrationApi.util.invalidateTags([
              { type: 'Administration', id: 'PRIVILEGEGROUP_LIST' }
            ]))
          })
        })
      }
    }),
    getPrivilegeGroupsWithAdmins: build.query<PrivilegeGroup[], RequestPayload>({
      query: ({ params }) => {
        const req =
          createHttpRequest(AdministrationUrlsInfo.getPrivilegeGroupsWithAdmins, params)
        return {
          ...req
        }
      }
    }),
    addPrivilegeGroup: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(AdministrationUrlsInfo.addPrivilegeGroup, params)
        return {
          ...req,
          body: payload
        }
      }
    }),
    updatePrivilegeGroup: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(AdministrationUrlsInfo.updatePrivilegeGroup, params)
        return {
          ...req,
          body: payload
        }
      }
    }),
    deletePrivilegeGroup: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(AdministrationUrlsInfo.deletePrivilegeGroup, params)
        return {
          ...req,
          body: payload
        }
      }
    }),
    getMspEcDelegatePrivilegeGroups: build.query<PrivilegeGroup[], RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(
          AdminRbacUrlsInfo.getMspEcDelegatePrivilegeGroups, params)
        return{
          ...req
        }
      },
      transformResponse: (result: PrivilegeGroup[]) => {
        return result.map(item => {
          item.id = item.parentPrivilegeGroupId as string
          return item
        })
      }
    }),
    getNotificationSms: build.query<NotificationSmsUsage, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(AdministrationUrlsInfo.getNotificationSms, params)
        return{
          ...req
        }
      },
      providesTags: [{ type: 'Administration', id: 'SMS_PROVIDER' }]
    }),
    updateNotificationSms: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(AdministrationUrlsInfo.updateNotificationSms, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Administration', id: 'SMS_PROVIDER' }]
    }),
    getNotificationSmsProvider: build.query<NotificationSmsConfig, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(AdministrationUrlsInfo.getNotificationSmsProvider, params)
        return{
          ...req
        }
      }
    }),
    updateNotificationSmsProvider: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(AdministrationUrlsInfo.updateNotificationSmsProvider, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Administration', id: 'SMS_PROVIDER' }]
    }),
    deleteNotificationSmsProvider: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(AdministrationUrlsInfo.deleteNotificationSmsProvider, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Administration', id: 'SMS_PROVIDER' }]
    }),
    getTwiliosIncomingPhoneNumbers: build.query<TwiliosIncommingPhoneNumbers, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(AdministrationUrlsInfo.getTwiliosIncomingPhoneNumbers,
          params, { ...ignoreErrorModal })
        return {
          ...req,
          body: payload
        }
      }
    }),
    getTwiliosMessagingServices: build.query<TwiliosMessagingServices, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(AdministrationUrlsInfo.getTwiliosMessagingServices,
          params, { ...ignoreErrorModal })
        return {
          ...req,
          body: payload
        }
      }
    }),
    getTwiliosWhatsappServices: build.query<TwiliosWhatsappServices, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(AdministrationUrlsInfo.getTwiliosWhatsappServices,
          params, { ...ignoreErrorModal })
        return {
          ...req,
          body: payload
        }
      }
    }),
    getWebhooks: build.query<TableResult<Webhook>, RequestPayload>({
      query: ({ params }) => {
        const req =
          createHttpRequest(AdministrationUrlsInfo.getWebhooks, params)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'Administration', id: 'WEBHOOK_LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, [
            'WEBHOOK'
          ], () => {
            api.dispatch(administrationApi.util.invalidateTags([
              { type: 'Administration', id: 'WEBHOOK_LIST' }
            ]))
          })
        })
      }
    }),
    getWebhookEntry: build.query<Webhook, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(AdministrationUrlsInfo.getWebhookEntry, params)
        return{
          ...req
        }
      }
    }),
    addWebhook: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(AdministrationUrlsInfo.addWebhook, params)
        return {
          ...req,
          body: payload
        }
      }
    }),
    updateWebhook: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(AdministrationUrlsInfo.updateWebhook, params)
        return {
          ...req,
          body: payload
        }
      }
    }),
    deleteWebhook: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(AdministrationUrlsInfo.deleteWebhook, params)
        return {
          ...req,
          body: payload
        }
      }
    }),
    webhookSendSampleEvent: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(AdministrationUrlsInfo.webhookSendSampleEvent, params)
        return {
          ...req,
          body: payload
        }
      }
    }),
    getPrivacySettings: build.query<PrivacySettings[], RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(AdministrationUrlsInfo.getPrivacySettings, params)
        return {
          ...req
        }
      },
      transformResponse: (response: PrivacyFeatures) => {
        return response.privacyFeatures
      },
      providesTags: [{ type: 'Privacy', id: 'DETAIL' }]
    }),
    updatePrivacySettings: build.mutation<PrivacySettings[], RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(AdministrationUrlsInfo.updatePrivacySettings, params)
        return {
          ...req,
          body: payload
        }
      },
      transformResponse: (response: PrivacyFeatures) => {
        return response.privacyFeatures
      },
      invalidatesTags: [{ type: 'Privacy', id: 'DETAIL' }]
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
  useUpdateTenantSelfMutation,
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
  useGetEntitlementActivationsQuery,
  usePatchEntitlementsActivationsMutation,
  useRefreshEntitlementsMutation,
  useInternalRefreshEntitlementsMutation,
  useConvertNonVARToMSPMutation,
  useGetRadiusClientConfigQuery,
  useUpdateRadiusClientConfigMutation,
  useGetRadiusServerSettingQuery,
  useGetTenantAuthenticationsQuery,
  useDeleteTenantAuthenticationsMutation,
  useAddTenantAuthenticationsMutation,
  usePatchTenantAuthenticationsMutation,
  useUpdateTenantAuthenticationsMutation,
  useGetAdminGroupsQuery,
  useDeleteAdminGroupsMutation,
  useAddAdminGroupsMutation,
  useUpdateAdminGroupsMutation,
  useGetAdminGroupLastLoginsQuery,
  useGetCustomRolesQuery,
  useAddCustomRoleMutation,
  useUpdateCustomRoleMutation,
  useDeleteCustomRoleMutation,
  useGetCustomRoleFeaturesQuery,
  useGetMspEcPrivilegeGroupsQuery,
  useGetOnePrivilegeGroupQuery,
  useGetPrivilegeGroupsQuery,
  useGetPrivilegeGroupsWithAdminsQuery,
  useAddPrivilegeGroupMutation,
  useUpdatePrivilegeGroupMutation,
  useDeletePrivilegeGroupMutation,
  useGetMspEcDelegatePrivilegeGroupsQuery,
  useGetNotificationSmsQuery,
  useUpdateNotificationSmsMutation,
  useGetNotificationSmsProviderQuery,
  useUpdateNotificationSmsProviderMutation,
  useDeleteNotificationSmsProviderMutation,
  useGetTwiliosIncomingPhoneNumbersQuery,
  useLazyGetTwiliosIncomingPhoneNumbersQuery,
  useGetTwiliosMessagingServicesQuery,
  useLazyGetTwiliosMessagingServicesQuery,
  useGetTwiliosWhatsappServicesQuery,
  useLazyGetTwiliosWhatsappServicesQuery,
  useGetWebhooksQuery,
  useGetWebhookEntryQuery,
  useAddWebhookMutation,
  useUpdateWebhookMutation,
  useDeleteWebhookMutation,
  useWebhookSendSampleEventMutation,
  useGetPrivacySettingsQuery,
  useUpdatePrivacySettingsMutation
} = administrationApi
