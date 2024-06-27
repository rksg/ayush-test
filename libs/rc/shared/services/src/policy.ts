/* eslint-disable max-len */
import { FetchBaseQueryError } from '@reduxjs/toolkit/query/react'
import { difference, zip }     from 'lodash'

import {
  MacRegistration, MacRegistrationPool, MacRegListUrlsInfo,
  RogueApUrls, RogueAPDetectionContextType, RogueAPDetectionTempType,
  SyslogUrls, SyslogPolicyDetailType, SyslogPolicyListType,
  VenueSyslogPolicyType, VenueSyslogSettingType, VenueRoguePolicyType,
  VLANPoolPolicyType, VLANPoolViewModelType, VlanPoolUrls, VLANPoolVenues,
  TableResult, onSocketActivityChanged, onActivityMessageReceived, CommonResult,
  devicePolicyInfoType, DevicePolicy, NewTableResult,
  transferToTableResult, AAAPolicyType, AaaUrls, AAAViewModalType,
  l3AclPolicyInfoType, l2AclPolicyInfoType, L2AclPolicy, L3AclPolicy, AvcCategory, AvcApp,
  appPolicyInfoType, ApplicationPolicy, AccessControlInfoType,
  VlanPool, WifiUrlsInfo, AccessControlUrls, ClientIsolationSaveData, ClientIsolationUrls,
  createNewTableHttpRequest, TableChangePayload, ClientIsolationListUsageByVenue,
  VenueUsageByClientIsolation,
  IdentityProvider,
  WifiOperatorUrls,
  WifiOperator,
  WifiOperatorViewModel,
  IdentityProviderUrls,
  IdentityProviderViewModel,
  LbsServerProfile,
  LbsServerProfileViewModel,
  LbsServerProfileUrls,
  ClientIsolationViewModel,
  ApSnmpUrls, ApSnmpPolicy, VenueApSnmpSettings,
  ApSnmpSettings, ApSnmpApUsage, ApSnmpViewModelData,
  EnhancedAccessControlInfoType,
  RadiusAttributeGroupUrlsInfo,
  RadiusAttributeGroup,
  RadiusAttribute,
  RadiusAttributeVendor,
  EnhancedRoguePolicyType,
  RulesManagementUrlsInfo,
  AdaptivePolicySet,
  AdaptivePolicy,
  RuleTemplate,
  RuleAttribute,
  AccessCondition,
  PrioritizedPolicy,
  Assignment,
  NewAPITableResult, transferNewResToTableResult,
  transferToNewTablePaginationParams,
  CertificateUrls,
  CertificateTemplate,
  CertificateAuthority,
  Certificate,
  downloadFile,
  CertificateTemplateMutationResult,
  downloadCertExtension,
  CertificateAcceptType,
  VlanPoolRbacUrls,
  VLANPoolViewModelRbacType,
  CommonUrlsInfo,
  Venue,
  VenueApGroupRbacType,
  VLANPoolNetworkType,
  VenueAPGroup,
  RbacApSnmpPolicy,
  ApSnmpRbacUrls,
  RbacApSnmpViewModelData,
  GetApiVersionHeader,
  ApiVersionEnum,
  convertRbacSnmpAgentToOldFormat,
  convertOldPolicyToRbacFormat,
  asyncConvertRbacSnmpPolicyToOldFormat,
  convertToCountAndNumber,
  RoguePolicyRequest,
  AAARbacViewModalType,
  TxStatus
} from '@acx-ui/rc/utils'
import { basePolicyApi }               from '@acx-ui/store'
import { RequestPayload }              from '@acx-ui/types'
import { batchApi, createHttpRequest } from '@acx-ui/utils'

import { commonQueryFn, convertRbacDataToAAAViewModelPolicyList, addRoguePolicyFn, updateRoguePolicyFn } from './servicePolicy.utils'

const RKS_NEW_UI = {
  'x-rks-new-ui': true
}

const clientIsolationMutationUseCases = [
  'AddClientIsolationAllowlist',
  'UpdateClientIsolationAllowlist',
  'DeleteClientIsolationAllowlists'
]

const WifiOperatorMutationUseCases = [
  'AddHotspot20Operator',
  'UpdateHotspot20Operator',
  'DeleteHotspot20Operator'
]

const IdentityProviderMutationUseCases = [
  'AddHotspot20IdentityProvider',
  'UpdateHotspot20IdentityProvider',
  'DeleteHotspot20IdentityProvider'
]

const LbsServerProfileMutationUseCases = [
  'AddLbsServerProfile',
  'UpdateLbsServerProfile',
  'DeleteLbsServerProfile'
]

const L2AclUseCases = [
  'AddL2AclPolicy',
  'UpdateL2AclPolicy',
  'DeleteL2AclPolicy',
  'DeleteBulkL2AclPolicies'
]

const L3AclUseCases = [
  'AddL3AclPolicy',
  'UpdateL3AclPolicy',
  'DeleteL3AclPolicy',
  'DeleteBulkL3AclPolicies'
]

const DeviceUseCases = [
  'AddDevicePolicy',
  'UpdateDevicePolicy',
  'DeleteDevicePolicy',
  'DeleteBulkDevicePolicies'
]

const ApplicationUseCases = [
  'AddApplicationPolicy',
  'UpdateApplicationPolicy',
  'DeleteApplicationPolicy',
  'DeleteBulkApplicationPolicies'
]

const AccessControlUseCases = [
  'AddAccessControlProfile',
  'UpdateAccessControlProfile',
  'DeleteAccessControlProfile',
  'DeleteBulkAccessControlProfiles'
]

const defaultMacListVersioningHeaders = {
  'Content-Type': 'application/vnd.ruckus.v1+json',
  'Accept': 'application/vnd.ruckus.v1+json'
}

const defaultCertTempVersioningHeaders = {
  'Content-Type': 'application/vnd.ruckus.v1+json',
  'Accept': 'application/vnd.ruckus.v1+json'
}

export const policyApi = basePolicyApi.injectEndpoints({
  endpoints: (build) => ({
    addRoguePolicy: build.mutation<CommonResult, RequestPayload<RoguePolicyRequest>>({
      queryFn: addRoguePolicyFn(),
      invalidatesTags: [{ type: 'RogueAp', id: 'LIST' }]
    }),
    delRoguePolicy: build.mutation<CommonResult, RequestPayload>({
      query: commonQueryFn(RogueApUrls.deleteRoguePolicy, RogueApUrls.deleteRoguePolicyRbac),
      invalidatesTags: [{ type: 'RogueAp', id: 'LIST' }]
    }),
    addL2AclPolicy: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(AccessControlUrls.addL2AclPolicy, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'AccessControl', id: 'LIST' }]
    }),
    getL2AclPolicy: build.query<l2AclPolicyInfoType, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(AccessControlUrls.getL2AclPolicy, params)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'AccessControl', id: 'DETAIL' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, [
            'UpdateL2AclPolicy'
          ], () => {
            api.dispatch(policyApi.util.invalidateTags([
              { type: 'AccessControl', id: 'DETAIL' }
            ]))
          })
        })
      }
    }),
    updateL2AclPolicy: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(AccessControlUrls.updateL2AclPolicy, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'AccessControl', id: 'LIST' }]
    }),
    delL2AclPolicy: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(AccessControlUrls.delL2AclPolicy, params)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'AccessControl', id: 'LIST' }]
    }),
    delL2AclPolicies: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(AccessControlUrls.delL2AclPolicies, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'AccessControl', id: 'LIST' }]
    }),
    addL3AclPolicy: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(AccessControlUrls.addL3AclPolicy, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'AccessControl', id: 'LIST' }]
    }),
    delL3AclPolicy: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(AccessControlUrls.delL3AclPolicy, params)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'AccessControl', id: 'LIST' }]
    }),
    delL3AclPolicies: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(AccessControlUrls.delL3AclPolicies, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'AccessControl', id: 'LIST' }]
    }),
    updateL3AclPolicy: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(AccessControlUrls.updateL3AclPolicy, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'AccessControl', id: 'LIST' }]
    }),
    addAccessControlProfile: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(AccessControlUrls.addAccessControlProfile, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'AccessControl', id: 'LIST' }]
    }),
    updateAccessControlProfile: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        // eslint-disable-next-line max-len
        const req = createHttpRequest(AccessControlUrls.updateAccessControlProfile, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'AccessControl', id: 'LIST' }]
    }),
    deleteAccessControlProfile: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        // eslint-disable-next-line max-len
        const req = createHttpRequest(AccessControlUrls.deleteAccessControlProfile, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'AccessControl', id: 'LIST' }]
    }),
    deleteAccessControlProfiles: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        // eslint-disable-next-line max-len
        const req = createHttpRequest(AccessControlUrls.deleteAccessControlProfiles, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'AccessControl', id: 'LIST' }]
    }),
    getAccessControlProfile: build.query<AccessControlInfoType, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(AccessControlUrls.getAccessControlProfile, params)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'AccessControl', id: 'DETAIL' }]
    }),
    getL3AclPolicy: build.query<l3AclPolicyInfoType, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(AccessControlUrls.getL3AclPolicy, params)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'AccessControl', id: 'DETAIL' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, [
            'UpdateL3AclPolicy'
          ], () => {
            api.dispatch(policyApi.util.invalidateTags([
              { type: 'AccessControl', id: 'DETAIL' }
            ]))
          })
        })
      }
    }),
    addDevicePolicy: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(AccessControlUrls.addDevicePolicy, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'AccessControl', id: 'LIST' }]
    }),
    getDevicePolicy: build.query<devicePolicyInfoType, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(AccessControlUrls.getDevicePolicy, params)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'AccessControl', id: 'DETAIL' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, [
            'UpdateDevicePolicy'
          ], () => {
            api.dispatch(policyApi.util.invalidateTags([
              { type: 'AccessControl', id: 'DETAIL' }
            ]))
          })
        })
      }
    }),
    delDevicePolicy: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(AccessControlUrls.delDevicePolicy, params)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'AccessControl', id: 'LIST' }]
    }),
    delDevicePolicies: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(AccessControlUrls.delDevicePolicies, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'AccessControl', id: 'LIST' }]
    }),
    updateDevicePolicy: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(AccessControlUrls.updateDevicePolicy, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'AccessControl', id: 'LIST' }]
    }),
    addAppPolicy: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(AccessControlUrls.addAppPolicy, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'AccessControl', id: 'LIST' }]
    }),
    getAppPolicy: build.query<appPolicyInfoType, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(AccessControlUrls.getAppPolicy, params)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'AccessControl', id: 'DETAIL' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, [
            'UpdateApplicationPolicy'
          ], () => {
            api.dispatch(policyApi.util.invalidateTags([
              { type: 'AccessControl', id: 'DETAIL' }
            ]))
          })
        })
      }
    }),
    delAppPolicy: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(AccessControlUrls.delAppAclPolicy, params)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'AccessControl', id: 'LIST' }]
    }),
    delAppPolicies: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(AccessControlUrls.delAppAclPolicies, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'AccessControl', id: 'LIST' }]
    }),
    updateAppPolicy: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(AccessControlUrls.updateAppAclPolicy, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'AccessControl', id: 'LIST' }]
    }),
    devicePolicyList: build.query<DevicePolicy[], RequestPayload>({
      query: ({ params }) => {
        const devicePolicyListReq = createHttpRequest(
          AccessControlUrls.getDevicePolicyList,
          params
        )
        return {
          ...devicePolicyListReq
        }
      },
      providesTags: [{ type: 'AccessControl', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const params = requestArgs.params as { requestId: string }
          onActivityMessageReceived(msg, DeviceUseCases, () => {
            api.dispatch(policyApi.util.invalidateTags([
              { type: 'AccessControl', id: 'LIST' }
            ]))
          }, params.requestId as string)
        })
      }
    }),
    getRoguePolicyList: build.query<RogueAPDetectionTempType[], RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(RogueApUrls.getRoguePolicyList, params)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'RogueAp', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, [
            'AddRogueApPolicyProfile',
            'UpdateRogueApPolicyProfile',
            'DeleteRogueApPolicyProfile',
            'UpdateVenueRogueAp',
            'UpdateDenialOfServiceProtection',
            'DeleteRoguePolicy',
            'AddRoguePolicy',
            'UpdateRoguePolicy'
          ], () => {
            api.dispatch(policyApi.util.invalidateTags([{ type: 'RogueAp', id: 'LIST' }]))
          })
        })
      }
    }),
    getAccessControlProfileList: build.query<AccessControlInfoType[], RequestPayload>({
      query: ({ params }) => {
        // eslint-disable-next-line max-len
        const req = createHttpRequest(AccessControlUrls.getAccessControlProfileList, params)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'AccessControl', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, [
            ...AccessControlUseCases,
            ...L2AclUseCases,
            ...L3AclUseCases,
            ...DeviceUseCases,
            ...ApplicationUseCases
          ], () => {
            api.dispatch(policyApi.util.invalidateTags([
              { type: 'AccessControl', id: 'LIST' }
            ]))
          })
        })
      },
      extraOptions: { maxRetries: 5 }
    }),
    // eslint-disable-next-line max-len
    getEnhancedAccessControlProfileList: build.query<TableResult<EnhancedAccessControlInfoType>, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(AccessControlUrls.getEnhancedAccessControlProfiles, params)
        return {
          ...req,
          body: payload
        }
      },
      providesTags: [{ type: 'AccessControl', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, [
            ...AccessControlUseCases,
            ...L2AclUseCases,
            ...L3AclUseCases,
            ...DeviceUseCases,
            ...ApplicationUseCases
          ], () => {
            api.dispatch(policyApi.util.invalidateTags([
              { type: 'AccessControl', id: 'LIST' }
            ]))
          })
        })
      },
      extraOptions: { maxRetries: 5 }
    }),
    getEnhancedL2AclProfileList: build.query<TableResult<L2AclPolicy>, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(AccessControlUrls.getEnhancedL2AclPolicies, params)
        return {
          ...req,
          body: payload
        }
      },
      providesTags: [{ type: 'AccessControl', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, L2AclUseCases, () => {
            api.dispatch(policyApi.util.invalidateTags([
              { type: 'AccessControl', id: 'LIST' }
            ]))
          })
        })
      },
      extraOptions: { maxRetries: 5 }
    }),
    getEnhancedL3AclProfileList: build.query<TableResult<L3AclPolicy>, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(AccessControlUrls.getEnhancedL3AclPolicies, params)
        return {
          ...req,
          body: payload
        }
      },
      providesTags: [{ type: 'AccessControl', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, L3AclUseCases, () => {
            api.dispatch(policyApi.util.invalidateTags([
              { type: 'AccessControl', id: 'LIST' }
            ]))
          })
        })
      },
      extraOptions: { maxRetries: 5 }
    }),
    getEnhancedDeviceProfileList: build.query<TableResult<DevicePolicy>, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(AccessControlUrls.getEnhancedDevicePolicies, params)
        return {
          ...req,
          body: payload
        }
      },
      providesTags: [{ type: 'AccessControl', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, DeviceUseCases, () => {
            api.dispatch(policyApi.util.invalidateTags([
              { type: 'AccessControl', id: 'LIST' }
            ]))
          })
        })
      },
      extraOptions: { maxRetries: 5 }
    }),
    getEnhancedApplicationProfileList: build.query<TableResult<ApplicationPolicy>, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(AccessControlUrls.getEnhancedApplicationPolicies, params)
        return {
          ...req,
          body: payload
        }
      },
      providesTags: [{ type: 'AccessControl', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, ApplicationUseCases, () => {
            api.dispatch(policyApi.util.invalidateTags([
              { type: 'AccessControl', id: 'LIST' }
            ]))
          })
        })
      },
      extraOptions: { maxRetries: 5 }
    }),
    delRoguePolicies: build.mutation<CommonResult, RequestPayload>({
      queryFn: async ({ params, payload, enableRbac }, _queryApi, _extraOptions, fetchWithBQ) => {
        if (enableRbac) {
          const policyIds = payload as string[]
          const requests = policyIds.map(policyId => ({ params: { policyId }, payload: {} }))
          // eslint-disable-next-line max-len
          return batchApi(RogueApUrls.deleteRoguePolicyRbac, requests, fetchWithBQ, GetApiVersionHeader(ApiVersionEnum.v1))
        } else {
          const req = createHttpRequest(RogueApUrls.deleteRogueApPolicies, params)
          return fetchWithBQ({
            ...req,
            body: payload
          })
        }
      },
      invalidatesTags: [{ type: 'RogueAp', id: 'LIST' }]
    }),
    roguePolicy: build.query<RogueAPDetectionContextType, RequestPayload>({
      query: commonQueryFn(RogueApUrls.getRoguePolicy, RogueApUrls.getRoguePolicyRbac),
      providesTags: [{ type: 'RogueAp', id: 'DETAIL' }]
    }),
    // eslint-disable-next-line max-len
    updateRoguePolicy: build.mutation<RogueAPDetectionTempType, RequestPayload<RoguePolicyRequest>>({
      queryFn: updateRoguePolicyFn(),
      invalidatesTags: [{ type: 'RogueAp', id: 'LIST' }]
    }),
    venueRoguePolicy: build.query<TableResult<VenueRoguePolicyType>, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(RogueApUrls.getVenueRoguePolicy, params)
        return {
          ...req,
          body: payload
        }
      },
      providesTags: [{ type: 'Policy', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'UpdateVenueRogueAp',
            'UpdateDenialOfServiceProtection'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(policyApi.util.invalidateTags([{ type: 'Policy', id: 'LIST' }]))
          })
        })
      },
      extraOptions: { maxRetries: 5 }
    }),
    enhancedRoguePolicies: build.query<TableResult<EnhancedRoguePolicyType>, RequestPayload>({
      query: commonQueryFn(RogueApUrls.getEnhancedRoguePolicyList, RogueApUrls.getRoguePolicyListRbac),
      providesTags: [{ type: 'RogueAp', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, [
            'AddRogueApPolicyProfile',
            'UpdateRogueApPolicyProfile',
            'DeleteRogueApPolicyProfile',
            'DeleteRogueApPolicyProfiles',
            'UpdateVenueRogueAp',
            'UpdateDenialOfServiceProtection',
            'DeleteVenue',
            'DeleteVenues'
          ], () => {
            api.dispatch(policyApi.util.invalidateTags([
              { type: 'RogueAp', id: 'LIST' }
            ]))
          })
        })
      },
      extraOptions: { maxRetries: 5 }
    }),
    addAAAPolicy: build.mutation<CommonResult, RequestPayload>({
      query: commonQueryFn(AaaUrls.addAAAPolicy),
      invalidatesTags: [{ type: 'AAA', id: 'LIST' }]
    }),
    deleteAAAPolicyList: build.mutation<CommonResult, RequestPayload<string[]>>({
      async queryFn (args, _queryApi, _extraOptions, baseQuery) {
        const { params, payload, enableRbac = false } = args

        if (enableRbac) {
          const requests = args.payload!.map(policyId => ({ params: { policyId } }))
          return batchApi(
            AaaUrls.deleteAAAPolicy, requests, baseQuery, GetApiVersionHeader(ApiVersionEnum.v1_1)
          )
        } else {
          return baseQuery({
            ...createHttpRequest(AaaUrls.deleteAAAPolicyList, params),
            body: payload
          })
        }
      },
      invalidatesTags: [{ type: 'AAA', id: 'LIST' }]
    }),
    getAAAPolicyViewModelList: build.query<TableResult<AAAViewModalType>, RequestPayload>({
      async queryFn (queryArgs, _queryApi, _extraOptions, baseQuery) {
        const query = commonQueryFn(AaaUrls.getAAAPolicyViewModelList, AaaUrls.queryAAAPolicyList)
        const result = await baseQuery(query(queryArgs))

        if (result.error) return { error: result.error as FetchBaseQueryError }

        return {
          data: queryArgs.enableRbac
            // eslint-disable-next-line max-len
            ? convertRbacDataToAAAViewModelPolicyList(result.data as TableResult<AAARbacViewModalType>)
            : result.data as TableResult<AAAViewModalType>
        }
      },
      providesTags: [{ type: 'AAA', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, [
            'AddRadius',
            'UpdateRadius',
            'DeleteRadiuses'
          ], () => {
            api.dispatch(policyApi.util.invalidateTags([{ type: 'AAA', id: 'LIST' }]))
          })
        })
      },
      extraOptions: { maxRetries: 5 }
    }),
    aaaPolicy: build.query<AAAPolicyType, RequestPayload>({
      query: ({ params, enableRbac }) => {
        return {
          ...createHttpRequest(
            AaaUrls.getAAAPolicy,
            params,
            GetApiVersionHeader(enableRbac ? ApiVersionEnum.v1_1 : undefined)
          )
        }
      },
      providesTags: [{ type: 'AAA', id: 'DETAIL' }]
    }),
    updateAAAPolicy: build.mutation<CommonResult, RequestPayload>({
      query: commonQueryFn(AaaUrls.updateAAAPolicy),
      invalidatesTags: [{ type: 'AAA', id: 'LIST' }]
    }),
    l2AclPolicyList: build.query<L2AclPolicy[], RequestPayload>({
      query: ({ params }) => {
        const l2AclPolicyListReq = createHttpRequest(
          AccessControlUrls.getL2AclPolicyList,
          params
        )
        return {
          ...l2AclPolicyListReq
        }
      },
      providesTags: [{ type: 'AccessControl', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const params = requestArgs.params as { requestId: string }
          if (params.requestId) {
            onActivityMessageReceived(msg, [
              'AddL2AclPolicy'
            ],() => {
              api.dispatch(policyApi.util.invalidateTags([{ type: 'AccessControl', id: 'LIST' }]))
            }, params.requestId as string)
          }
        })
      }
    }),
    l3AclPolicyList: build.query<L3AclPolicy[], RequestPayload>({
      query: ({ params }) => {
        const l3AclPolicyListReq = createHttpRequest(
          AccessControlUrls.getL3AclPolicyList,
          params
        )
        return {
          ...l3AclPolicyListReq
        }
      },
      providesTags: [{ type: 'AccessControl', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const params = requestArgs.params as { requestId: string }
          if (params.requestId) {
            onActivityMessageReceived(msg, [
              'AddL3AclPolicy'
            ],() => {
              api.dispatch(policyApi.util.invalidateTags([{ type: 'AccessControl', id: 'LIST' }]))
            }, params.requestId as string)
          }
        })
      }
    }),
    appPolicyList: build.query<ApplicationPolicy[], RequestPayload>({
      query: ({ params }) => {
        const appPolicyListReq = createHttpRequest(
          AccessControlUrls.getAppPolicyList,
          params
        )
        return {
          ...appPolicyListReq
        }
      },
      providesTags: [{ type: 'AccessControl', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const params = requestArgs.params as { requestId: string }
          if (params.requestId) {
            onActivityMessageReceived(msg, [
              'Add Application Policy Profile'
            ],() => {
              api.dispatch(policyApi.util.invalidateTags([{ type: 'AccessControl', id: 'LIST' }]))
            }, params.requestId as string)
          }
        })
      }
    }),
    macRegLists: build.query<TableResult<MacRegistrationPool>, RequestPayload>({
      query: ({ params, payload }) => {
        const poolsReq = createNewTableHttpRequest({
          apiInfo: MacRegListUrlsInfo.getMacRegistrationPools,
          params,
          payload: payload as TableChangePayload,
          headers: defaultMacListVersioningHeaders
        })
        return {
          ...poolsReq
        }
      },
      transformResponse (result: NewTableResult<MacRegistrationPool>) {
        return transferToTableResult<MacRegistrationPool>(result)
      },
      providesTags: [{ type: 'MacRegistrationPool', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, [
            'CREATE_POOL',
            'UPDATE_POOL',
            'DELETE_POOL'
          ], () => {
            api.dispatch(policyApi.util.invalidateTags([
              { type: 'MacRegistration', id: 'LIST' }
            ]))
          })
        })
      }
    }),
    searchMacRegLists: build.query<TableResult<MacRegistrationPool>, RequestPayload>({
      query: ({ params, payload }) => {
        const poolsReq = createNewTableHttpRequest({
          apiInfo: MacRegListUrlsInfo.searchMacRegistrationPools,
          params,
          payload: payload as TableChangePayload,
          headers: defaultMacListVersioningHeaders
        })
        return {
          ...poolsReq,
          body: JSON.stringify(payload)
        }
      },
      transformResponse (result: NewTableResult<MacRegistrationPool>) {
        return transferToTableResult<MacRegistrationPool>(result)
      },
      providesTags: [{ type: 'MacRegistrationPool', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, [
            'CREATE_POOL',
            'UPDATE_POOL',
            'DELETE_POOL'
          ], () => {
            api.dispatch(policyApi.util.invalidateTags([
              { type: 'MacRegistration', id: 'LIST' }
            ]))
          })
        })
      },
      extraOptions: { maxRetries: 5 }
    }),
    macRegistrations: build.query<TableResult<MacRegistration>, RequestPayload>({
      query: ({ params, payload }) => {
        const poolsReq = createNewTableHttpRequest({
          apiInfo: MacRegListUrlsInfo.getMacRegistrations,
          params,
          payload: payload as TableChangePayload,
          headers: defaultMacListVersioningHeaders
        })
        return {
          ...poolsReq
        }
      },
      transformResponse (result: NewTableResult<MacRegistration>) {
        return transferToTableResult<MacRegistration>(result)
      },
      providesTags: [{ type: 'MacRegistration', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, [
            'CREATE_REGISTRATION',
            'UPDATE_REGISTRATION',
            'DELETE_REGISTRATION'
          ], () => {
            api.dispatch(policyApi.util.invalidateTags([
              { type: 'MacRegistration', id: 'LIST' }
            ]))
          })
        })
      },
      extraOptions: { maxRetries: 5 }
    }),
    searchMacRegistrations: build.query<TableResult<MacRegistration>, RequestPayload>({
      query: ({ params, payload }) => {
        const poolsReq = createNewTableHttpRequest({
          apiInfo: MacRegListUrlsInfo.searchMacRegistrations,
          params,
          payload: payload as TableChangePayload,
          headers: defaultMacListVersioningHeaders
        })
        return {
          ...poolsReq,
          body: JSON.stringify(payload)
        }
      },
      transformResponse (result: NewTableResult<MacRegistration>) {
        return transferToTableResult<MacRegistration>(result)
      },
      providesTags: [{ type: 'MacRegistration', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, [
            'CREATE_REGISTRATION',
            'UPDATE_REGISTRATION',
            'DELETE_REGISTRATION'
          ], () => {
            api.dispatch(policyApi.util.invalidateTags([
              { type: 'MacRegistration', id: 'LIST' }
            ]))
          })
        })
      },
      extraOptions: { maxRetries: 5 }
    }),
    addMacRegList: build.mutation<MacRegistrationPool, RequestPayload>({
      query: ({ params, payload, customHeaders }) => {
        const headers = { ...defaultMacListVersioningHeaders, ...customHeaders }
        // eslint-disable-next-line max-len
        const req = createHttpRequest(MacRegListUrlsInfo.createMacRegistrationPool, params, headers)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'MacRegistrationPool', id: 'LIST' }]
    }),
    updateMacRegList: build.mutation<MacRegistrationPool, RequestPayload>({
      query: ({ params, payload, customHeaders }) => {
        const headers = { ...defaultMacListVersioningHeaders, ...customHeaders }
        // eslint-disable-next-line max-len
        const req = createHttpRequest(MacRegListUrlsInfo.updateMacRegistrationPool, params, headers)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'MacRegistrationPool', id: 'LIST' }]
    }),
    deleteMacRegList: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, customHeaders }) => {
        const headers = { ...defaultMacListVersioningHeaders, ...customHeaders }
        // eslint-disable-next-line max-len
        const req = createHttpRequest(MacRegListUrlsInfo.deleteMacRegistrationPool, params, headers)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'MacRegistrationPool', id: 'LIST' }]
    }),
    deleteMacRegistration: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, customHeaders }) => {
        const headers = { ...defaultMacListVersioningHeaders, ...customHeaders }
        // eslint-disable-next-line max-len
        const req = createHttpRequest(MacRegListUrlsInfo.deleteMacRegistration, params, headers)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'MacRegistration', id: 'LIST' }]
    }),
    deleteMacRegistrations: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload, customHeaders }) => {
        const headers = { ...defaultMacListVersioningHeaders, ...customHeaders }
        // eslint-disable-next-line max-len
        const req = createHttpRequest(MacRegListUrlsInfo.deleteMacRegistrations, params, headers)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'MacRegistration', id: 'LIST' }]
    }),
    getMacRegList: build.query<MacRegistrationPool, RequestPayload>({
      query: ({ params }) => {
        // eslint-disable-next-line max-len
        const req = createHttpRequest(MacRegListUrlsInfo.getMacRegistrationPool, params, defaultMacListVersioningHeaders )
        return{
          ...req
        }
      },
      providesTags: [{ type: 'MacRegistrationPool', id: 'DETAIL' }]
    }),
    addMacRegistration: build.mutation<MacRegistration, RequestPayload>({
      query: ({ params, payload, customHeaders }) => {
        const headers = { ...defaultMacListVersioningHeaders, ...customHeaders }
        const req = createHttpRequest(MacRegListUrlsInfo.addMacRegistration, params, headers)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'MacRegistration', id: 'LIST' }]
    }),
    updateMacRegistration: build.mutation<MacRegistration, RequestPayload>({
      query: ({ params, payload, customHeaders }) => {
        const headers = { ...defaultMacListVersioningHeaders, ...customHeaders }
        // eslint-disable-next-line max-len
        const req = createHttpRequest(MacRegListUrlsInfo.updateMacRegistration, params, headers)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'MacRegistration', id: 'LIST' }]
    }),
    updateAdaptivePolicySetToMacList: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, customHeaders }) => {
        const headers = { ...defaultMacListVersioningHeaders, ...customHeaders }
        // eslint-disable-next-line max-len
        const req = createHttpRequest(MacRegListUrlsInfo.updateAdaptivePolicySet, params, headers)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'MacRegistration', id: 'LIST' }]
    }),
    deleteAdaptivePolicySetFromMacList: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, customHeaders }) => {
        const headers = { ...defaultMacListVersioningHeaders, ...customHeaders }
        // eslint-disable-next-line max-len
        const req = createHttpRequest(MacRegListUrlsInfo.deleteAdaptivePolicySet, params, headers)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'MacRegistration', id: 'LIST' }]
    }),
    addClientIsolation: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(ClientIsolationUrls.addClientIsolation, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Policy', id: 'LIST' }, { type: 'ClientIsolation', id: 'LIST' }]
    }),
    deleteClientIsolationList: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(ClientIsolationUrls.deleteClientIsolationList, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Policy', id: 'LIST' }, { type: 'ClientIsolation', id: 'LIST' }]
    }),
    vlanPoolList: build.query<VlanPool[], RequestPayload>({
      query: ({ params }) => {
        const vlanPoolListReq = createHttpRequest(
          WifiUrlsInfo.getVlanPools,
          params
        )
        return {
          ...vlanPoolListReq
        }
      },
      providesTags: [{ type: 'VLANPool', id: 'LIST' }]
    }),
    getClientIsolationList: build.query<ClientIsolationSaveData[], RequestPayload>({
      query: ({ params }) => {
        // eslint-disable-next-line max-len
        const req = createHttpRequest(ClientIsolationUrls.getClientIsolationList, params)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'Policy', id: 'DETAIL' }, { type: 'ClientIsolation', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, clientIsolationMutationUseCases, () => {
            api.dispatch(policyApi.util.invalidateTags([
              { type: 'Policy', id: 'LIST' },
              { type: 'ClientIsolation', id: 'LIST' }
            ]))
          })
        })
      }
    }),
    // eslint-disable-next-line max-len
    getEnhancedClientIsolationList: build.query<TableResult<ClientIsolationViewModel>, RequestPayload>({
      query: ({ params, payload }) => {
        // eslint-disable-next-line max-len
        const req = createHttpRequest(ClientIsolationUrls.getEnhancedClientIsolationList, params)
        return {
          ...req,
          body: payload
        }
      },
      providesTags: [{ type: 'ClientIsolation', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, clientIsolationMutationUseCases, () => {
            api.dispatch(policyApi.util.invalidateTags([
              { type: 'Policy', id: 'LIST' },
              { type: 'ClientIsolation', id: 'LIST' }
            ]))
          })
        })
      },
      extraOptions: { maxRetries: 5 }
    }),
    getClientIsolation: build.query<ClientIsolationSaveData, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(ClientIsolationUrls.getClientIsolation, params)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'Policy', id: 'DETAIL' }, { type: 'ClientIsolation', id: 'LIST' }]
    }),
    addWifiOperator: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const customHeaders = GetApiVersionHeader(ApiVersionEnum.v1)
        const req = createHttpRequest(WifiOperatorUrls.addWifiOperator, params, customHeaders)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'Policy', id: 'LIST' }, { type: 'WifiOperator', id: 'LIST' }],
      async onCacheEntryAdded (args, api) {
        await onSocketActivityChanged(args, api, async (msg) => {
          try {
            const response = await api.cacheDataLoaded
            if (args.callback && response && msg.useCase === 'AddHotspot20Operator' &&
              msg.status === TxStatus.SUCCESS) {
              (args.callback as Function)(response.data)
            }
          } catch {
          }
        })
      }
    }),
    updateWifiOperator: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const customHeaders = GetApiVersionHeader(ApiVersionEnum.v1)
        const req = createHttpRequest(WifiOperatorUrls.updateWifiOperator, params, customHeaders)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'Policy', id: 'LIST' }, { type: 'WifiOperator', id: 'LIST' }]
    }),
    deleteWifiOperator: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const customHeaders = GetApiVersionHeader(ApiVersionEnum.v1)
        const req = createHttpRequest(WifiOperatorUrls.deleteWifiOperator, params, customHeaders)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'Policy', id: 'LIST' }, { type: 'WifiOperator', id: 'LIST' }]
    }),
    getWifiOperator: build.query<WifiOperator, RequestPayload>({
      query: ({ params }) => {
        const customHeaders = GetApiVersionHeader(ApiVersionEnum.v1)
        const req = createHttpRequest(WifiOperatorUrls.getWifiOperator, params, customHeaders)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'Policy', id: 'DETAIL' }, { type: 'WifiOperator', id: 'LIST' }]
    }),
    getWifiOperatorList: build.query<TableResult<WifiOperatorViewModel>, RequestPayload>({
      query: ({ params, payload }) => {
        const customHeaders = GetApiVersionHeader(ApiVersionEnum.v1)
        const req = createHttpRequest(WifiOperatorUrls.getWifiOperatorList, params, customHeaders)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      providesTags: [{ type: 'WifiOperator', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, WifiOperatorMutationUseCases, () => {
            api.dispatch(policyApi.util.invalidateTags([
              { type: 'Policy', id: 'LIST' },
              { type: 'WifiOperator', id: 'LIST' }
            ]))
          })
        })
      },
      extraOptions: { maxRetries: 5 }
    }),
    activateWifiOperatorOnWifiNetwork: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const customHeaders = GetApiVersionHeader(ApiVersionEnum.v1)
        const req = createHttpRequest(
          WifiOperatorUrls.activateWifiOperatorOnWifiNetwork, params, customHeaders)
        return {
          ...req
        }
      }
    }),
    deactivateWifiOperatorOnWifiNetwork: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const customHeaders = GetApiVersionHeader(ApiVersionEnum.v1)
        const req = createHttpRequest(
          WifiOperatorUrls.deactivateWifiOperatorOnWifiNetwork, params, customHeaders)
        return {
          ...req
        }
      }
    }),
    getIdentityProviderList: build.query<TableResult<IdentityProviderViewModel>, RequestPayload>({
      query: ({ params, payload }) => {
        const customHeaders = GetApiVersionHeader(ApiVersionEnum.v1)
        const req = createHttpRequest(IdentityProviderUrls.getIdentityProviderList, params, customHeaders)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      providesTags: [{ type: 'IdentityProvider', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, IdentityProviderMutationUseCases, () => {
            api.dispatch(policyApi.util.invalidateTags([
              { type: 'Policy', id: 'LIST' },
              { type: 'IdentityProvider', id: 'LIST' }
            ]))
          })
        })
      },
      extraOptions: { maxRetries: 5 }
    }),
    getIdentityProvider: build.query<IdentityProvider, RequestPayload>({
      async queryFn (arg, _queryApi, _extraOptions, fetchWithBQ) {
        const { params } = arg
        const customHeaders = GetApiVersionHeader(ApiVersionEnum.v1)

        const identityProviderReq = {
          ...createHttpRequest(IdentityProviderUrls.getIdentityProvider, params, customHeaders)
        }
        const identityProviderQuery = await fetchWithBQ(identityProviderReq)
        const identityProviderData = identityProviderQuery.data as IdentityProvider
        const { accountingRadiusEnabled } = identityProviderData


        // Get authRadiusId and accountingRadiusId from ViewModel data
        const viewmodelPayload = {
          fields: ['id', 'authRadiusId', 'accountingRadiusId'],
          searchString: '',
          filters: { id: [params!.policyId] }
        }
        const identityProviderListReq = {
          ...createHttpRequest(IdentityProviderUrls.getIdentityProviderList, params, customHeaders),
          body: JSON.stringify(viewmodelPayload)
        }
        const identityProviderListQuery = await fetchWithBQ(identityProviderListReq)
        const identityProviderListData = identityProviderListQuery.data as TableResult<IdentityProviderViewModel>
        const { authRadiusId, accountingRadiusId } = identityProviderListData.data[0]

        const combineData = {
          ...identityProviderData,
          authRadiusId,
          ...((accountingRadiusEnabled && accountingRadiusId) &&
            { accountingRadiusId: accountingRadiusId } )
        }

        return identityProviderQuery.data
          ? { data: combineData }
          : { error: identityProviderQuery.error as FetchBaseQueryError }

      },
      providesTags: [{ type: 'Policy', id: 'DETAIL' }, { type: 'IdentityProvider', id: 'LIST' }]
    }),
    addIdentityProvider: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const customHeaders = GetApiVersionHeader(ApiVersionEnum.v1)
        const req = createHttpRequest(IdentityProviderUrls.addIdentityProvider, params, customHeaders)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'Policy', id: 'LIST' }, { type: 'IdentityProvider', id: 'LIST' }],
      async onCacheEntryAdded (args, api) {
        await onSocketActivityChanged(args, api, async (msg) => {
          try {
            const response = await api.cacheDataLoaded
            if (args.callback && response && msg.useCase === 'AddHotspot20IdentityProvider' &&
              msg.status === TxStatus.SUCCESS) {
              (args.callback as Function)(response.data)
            }
          } catch {}
        })
      }
    }),
    updateIdentityProvider: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const customHeaders = GetApiVersionHeader(ApiVersionEnum.v1)
        const req = createHttpRequest(IdentityProviderUrls.updateIdentityProvider, params, customHeaders)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'Policy', id: 'LIST' }, { type: 'IdentityProvider', id: 'LIST' }]
    }),
    deleteIdentityProvider: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const customHeaders = GetApiVersionHeader(ApiVersionEnum.v1)
        const req = createHttpRequest(IdentityProviderUrls.deleteIdentityProvider, params, customHeaders)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'Policy', id: 'LIST' }, { type: 'IdentityProvider', id: 'LIST' }]
    }),
    activateIdentityProviderRadius: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const customHeaders = GetApiVersionHeader(ApiVersionEnum.v1)
        const req = createHttpRequest(IdentityProviderUrls.activateIdentityProviderRadius, params, customHeaders)
        return {
          ...req
        }
      }
    }),
    deactivateIdentityProviderRadius: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const customHeaders = GetApiVersionHeader(ApiVersionEnum.v1)
        const req = createHttpRequest(IdentityProviderUrls.deactivateIdentityProviderRadius, params, customHeaders)
        return {
          ...req
        }
      }
    }),
    activateIdentityProviderOnWifiNetwork: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const customHeaders = GetApiVersionHeader(ApiVersionEnum.v1)
        const req = createHttpRequest(
          IdentityProviderUrls.activateIdentityProviderOnWifiNetwork, params, customHeaders)
        return {
          ...req
        }
      }
    }),
    deactivateIdentityProviderOnWifiNetwork: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const customHeaders = GetApiVersionHeader(ApiVersionEnum.v1)
        const req = createHttpRequest(
          IdentityProviderUrls.deactivateIdentityProviderOnWifiNetwork, params, customHeaders)
        return {
          ...req
        }
      }
    }),
    addLbsServerProfile: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const customHeaders = GetApiVersionHeader(ApiVersionEnum.v1)
        const req = createHttpRequest(LbsServerProfileUrls.addLbsServerProfile, params, customHeaders)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'Policy', id: 'LIST' }, { type: 'LbsServerProfile', id: 'LIST' }],
      async onCacheEntryAdded (args, api) {
        await onSocketActivityChanged(args, api, async (msg) => {
          try {
            const response = await api.cacheDataLoaded
            if (args.callback && response && msg.useCase === 'AddLbsProfile' &&
              msg.status === TxStatus.SUCCESS) {
              (args.callback as Function)(response.data)
            }
          } catch {
          }
        })
      }
    }),
    updateLbsServerProfile: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const customHeaders = GetApiVersionHeader(ApiVersionEnum.v1)
        const req = createHttpRequest(LbsServerProfileUrls.updateLbsServerProfile, params, customHeaders)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'Policy', id: 'LIST' }, { type: 'LbsServerProfile', id: 'LIST' }]
    }),
    deleteLbsServerProfile: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const customHeaders = GetApiVersionHeader(ApiVersionEnum.v1)
        const req = createHttpRequest(LbsServerProfileUrls.deleteLbsServerProfile, params, customHeaders)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'Policy', id: 'LIST' }, { type: 'LbsServerProfile', id: 'LIST' }]
    }),
    getLbsServerProfile: build.query<LbsServerProfile, RequestPayload>({
      query: ({ params }) => {
        const customHeaders = GetApiVersionHeader(ApiVersionEnum.v1)
        const req = createHttpRequest(LbsServerProfileUrls.getLbsServerProfile, params, customHeaders)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'Policy', id: 'DETAIL' }, { type: 'LbsServerProfile', id: 'LIST' }]
    }),
    getLbsServerProfileList: build.query<TableResult<LbsServerProfileViewModel>, RequestPayload>({
      query: ({ params, payload }) => {
        const customHeaders = GetApiVersionHeader(ApiVersionEnum.v1)
        const req = createHttpRequest(LbsServerProfileUrls.getLbsServerProfileList, params, customHeaders)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      providesTags: [{ type: 'LbsServerProfile', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, LbsServerProfileMutationUseCases, () => {
            api.dispatch(policyApi.util.invalidateTags([
              { type: 'Policy', id: 'LIST' },
              { type: 'LbsServerProfile', id: 'LIST' }
            ]))
          })
        })
      },
      extraOptions: { maxRetries: 5 }
    }),
    activateLbsServerProfileOnVenue: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const customHeaders = GetApiVersionHeader(ApiVersionEnum.v1)
        const req = createHttpRequest(
          LbsServerProfileUrls.activateLbsServerProfileOnVenue, params, customHeaders)
        return {
          ...req
        }
      }
    }),
    deactivateLbsServerProfileOnVenue: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const customHeaders = GetApiVersionHeader(ApiVersionEnum.v1)
        const req = createHttpRequest(
          LbsServerProfileUrls.deactivateLbsServerProfileOnVenue, params, customHeaders)
        return {
          ...req
        }
      }
    }),
    // eslint-disable-next-line max-len
    getVLANPoolPolicyViewModelList: build.query<TableResult<VLANPoolViewModelType>, RequestPayload>({
      // eslint-disable-next-line max-len
      queryFn: async ( { params, payload, enableRbac = false }, _queryApi, _extraOptions, fetchWithBQ) => {
        const url = enableRbac ? VlanPoolRbacUrls.getVLANPoolPolicyList:
          WifiUrlsInfo.getVlanPoolViewModelList
        const headers = GetApiVersionHeader(enableRbac ? ApiVersionEnum.v1 : undefined)
        const req = createHttpRequest(url , params, headers)
        const res = await fetchWithBQ({ ...req, body: JSON.stringify(payload) })

        if (res.error) {
          return { error: res.error as FetchBaseQueryError }
        }
        if (!enableRbac) {
          return { data: res.data as TableResult<VLANPoolViewModelType> }
        } else {
          const data = res.data as TableResult<VLANPoolViewModelRbacType>
          const networkIds: string[] = [...new Set(data.data.map(v => v.wifiNetworkIds ?? []).flat())]
          const networkMap = new Map<string, VenueApGroupRbacType[]>()
          if (networkIds.length > 0) {
            const networkQuery = await fetchWithBQ({
              ...createHttpRequest(CommonUrlsInfo.getWifiNetworksList, params, headers),
              body: JSON.stringify({
                filters: { id: networkIds },
                fields: ['id', 'name', 'venueApGroups'],
                pageSize: 10000
              })
            })

            if (networkQuery.error) {
              return { error: networkQuery.error as FetchBaseQueryError }
            }

            const networkData = networkQuery.data as TableResult<VLANPoolNetworkType>
            networkData.data?.forEach(v => {
              const network = v as VLANPoolNetworkType
              networkMap.set(network.id, network.venueApGroups)
            })
          }

          const aggregated: VLANPoolViewModelType[] = data.data.map( v => {
            let val = v as VLANPoolViewModelRbacType
            const venueApGroups: VenueAPGroup[] = []
            const venueIds: string[] = []
            val.wifiNetworkIds?.forEach(networkId => {
              networkMap.get(networkId)?.forEach(group => {
                if (group.isAllApGroups) {
                  venueApGroups.push({
                    id: group.venueId,
                    apGroups: [{
                      id: '',
                      allApGroups: true,
                      default: true
                    }]
                  })
                  venueIds.push(group.venueId)
                }
              })
            })
            val.wifiNetworkVenueApGroups?.forEach(group => {
              venueIds.push(group.venueId)
              if (!group.isAllApGroups) {
                venueApGroups.push({
                  id: group.venueId,
                  apGroups: group.apGroupIds.map(id => {
                    return {
                      id: id,
                      default: false,
                      allApGroups: false
                    }
                  })
                })
              }
            })

            return {
              id: val.id,
              name: val.name,
              vlanMembers: val.vlanMembers,
              networkIds: val.wifiNetworkIds,
              venueApGroups: venueApGroups,
              venueIds: venueIds
            } as VLANPoolViewModelType
          })

          const ret: TableResult<VLANPoolViewModelType> = {
            totalCount: data.totalCount,
            data: aggregated,
            page: data.page
          }
          return { data: ret }
        }
      },
      providesTags: [{ type: 'VLANPool', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, [
            'AddVlanPool',
            'UpdateVlanPool',
            'DeleteVlanPool',
            'PatchVlanPool',
            'DeleteVlanPools',
            'AddVlanPoolProfile',
            'UpdateVlanPoolProfile',
            'DeleteVlanPoolProfile'
          ], () => {
            api.dispatch(policyApi.util.invalidateTags([{ type: 'VLANPool', id: 'LIST' }]))
          })
        })
      },
      extraOptions: { maxRetries: 5 }
    }),
    getVLANPoolPolicyDetail: build.query<VLANPoolPolicyType, RequestPayload>({
      query: ({ params, enableRbac = false }) => {
        const url = enableRbac ? VlanPoolRbacUrls.getVLANPoolPolicy : VlanPoolUrls.getVLANPoolPolicy
        const headers = GetApiVersionHeader(enableRbac ? ApiVersionEnum.v1 : undefined)
        const req = createHttpRequest(url, params, headers)
        return {
          ...req
        }
      },
      transformResponse (data: VLANPoolPolicyType) {
        data.vlanMembers = (data.vlanMembers as string[]).join(',')
        return data
      },
      providesTags: [{ type: 'VLANPool', id: 'DETAIL' }]
    }),
    addVLANPoolPolicy: build.mutation<{ response: { [key:string]:string } }, RequestPayload>({
      query: ({ params, payload, enableRbac = false }) => {
        const url = enableRbac ? VlanPoolRbacUrls.addVLANPoolPolicy : VlanPoolUrls.addVLANPoolPolicy
        const headers = GetApiVersionHeader(enableRbac ? ApiVersionEnum.v1 : undefined)
        const req = createHttpRequest(url, params, headers)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'VLANPool', id: 'LIST' }]
    }),
    updateVLANPoolPolicy: build.mutation<VLANPoolPolicyType, RequestPayload>({
      query: ({ params, payload, enableRbac = false }) => {
        const url = enableRbac ? VlanPoolRbacUrls.updateVLANPoolPolicy
          : VlanPoolUrls.updateVLANPoolPolicy
        const headers = GetApiVersionHeader(enableRbac ? ApiVersionEnum.v1 : undefined)
        const req = createHttpRequest(url, params, headers)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'VLANPool', id: 'LIST' }]
    }),
    delVLANPoolPolicy: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, enableRbac = false }) => {
        const url = enableRbac ? VlanPoolRbacUrls.deleteVLANPoolPolicy
          : VlanPoolUrls.deleteVLANPoolPolicy
        const headers = GetApiVersionHeader(enableRbac ? ApiVersionEnum.v1 : undefined)
        const req = createHttpRequest(url, params, headers)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'VLANPool', id: 'LIST' }]
    }),
    getVLANPoolVenues: build.query<TableResult<VLANPoolVenues>, RequestPayload>({
      // eslint-disable-next-line max-len
      queryFn: async ({ params, payload ,enableRbac = false }, _queryApi, _extraOptions, fetchWithBQ) => {
        try {
          const url = enableRbac ? VlanPoolRbacUrls.getVLANPoolPolicyList :
            VlanPoolUrls.getVLANPoolVenues
          const headers = GetApiVersionHeader(enableRbac ? ApiVersionEnum.v1 : undefined)
          const req = createHttpRequest(url, params, headers)
          const res = await fetchWithBQ({ ...req, body: JSON.stringify(payload) })
          if (res.error) {
            return { error: res.error as FetchBaseQueryError }
          }
          if (!enableRbac) {
            return { data: res.data as TableResult<VLANPoolVenues> }
          } else {
            const result = res.data as TableResult<VLANPoolViewModelRbacType>
            if (result.totalCount > 0) {
              const allApGroupVenueSet = new Set<string> ()
              if((result.data[0].wifiNetworkIds?.length ?? 0) > 0) {
                const networkQuery = await fetchWithBQ({
                  ...createHttpRequest(CommonUrlsInfo.getWifiNetworksList, params, headers),
                  body: JSON.stringify({
                    filters: { id: result.data[0].wifiNetworkIds },
                    fields: ['id', 'name', 'venueApGroups'],
                    pageSize: 10000
                  })
                })

                if (networkQuery.error) {
                  return { error: networkQuery.error as FetchBaseQueryError }
                }
                const networkData = networkQuery.data as TableResult<VLANPoolNetworkType>
                networkData.data?.forEach(v => {
                  const val = v as VLANPoolNetworkType
                  val.venueApGroups.filter(group => group.isAllApGroups)
                    .forEach(group => allApGroupVenueSet.add(group.venueId))
                })
              }

              const venueApGroupMap = new Map<string, VenueApGroupRbacType>()
              result.data[0].wifiNetworkVenueApGroups
                .forEach(group => {venueApGroupMap.set(group.venueId, group)})
              const venueIds = [...venueApGroupMap.keys(), ...allApGroupVenueSet.keys()]
              if (venueIds.length === 0) {
                return { data: {} as TableResult<VLANPoolVenues> }
              }

              const venueReq = createHttpRequest(CommonUrlsInfo.getVenuesList, params, headers)
              const venueRes = await fetchWithBQ({ ...venueReq,
                body: JSON.stringify({
                  filters: { id: venueIds },
                  fields: ['id', 'name', 'aggregatedApStatus'],
                  pageSize: 10000
                }) })
              if ( venueRes.error) {
                return { error: venueRes.error as FetchBaseQueryError }
              }

              const venues = venueRes.data as TableResult<Venue>
              return { data: {
                totalCount: venues.totalCount,
                page: 1,
                data: venues.data.map(venue => {
                  const venueApGroup = venueApGroupMap.get(venue.id)
                  return {
                    venueId: venue.id,
                    venueName: venue.name,
                    venueApCount: venue.aggregatedApStatus ?
                      Object.values(venue.aggregatedApStatus).reduce((a, b) => a + b, 0):
                      0,
                    apGroupData: allApGroupVenueSet.has(venue.id) ? [
                      { apGroupName: 'ALL_APS' }
                    ] : venueApGroup?.apGroupIds.map(id => { return { apGroupId: id }})
                  } as VLANPoolVenues
                })
              } as TableResult<VLANPoolVenues> }
            } else {
              return { data: {} as TableResult<VLANPoolVenues> }
            }
          }
        } catch (error) {
          return { error: error as FetchBaseQueryError }
        }
      },
      providesTags: [{ type: 'VLANPool', id: 'LIST' }],
      extraOptions: { maxRetries: 5 }
    }),
    updateClientIsolation: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(ClientIsolationUrls.updateClientIsolation, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Policy', id: 'LIST' }, { type: 'ClientIsolation', id: 'LIST' }]
    }),
    // eslint-disable-next-line max-len
    getClientIsolationUsageByVenue: build.query<TableResult<ClientIsolationListUsageByVenue>, RequestPayload>({
      query: ({ params, payload }) => {
        // eslint-disable-next-line max-len
        const req = createHttpRequest(ClientIsolationUrls.getClientIsolationListUsageByVenue, params)
        return {
          ...req,
          body: payload
        }
      },
      extraOptions: { maxRetries: 5 }
    }),
    // eslint-disable-next-line max-len
    getVenueUsageByClientIsolation: build.query<TableResult<VenueUsageByClientIsolation>, RequestPayload>({
      query: ({ params, payload }) => {
        // eslint-disable-next-line max-len
        const req = createHttpRequest(ClientIsolationUrls.getVenueUsageByClientIsolation, params)
        return {
          ...req,
          body: payload
        }
      },
      extraOptions: { maxRetries: 5 }
    }),
    uploadMacRegistration: build.mutation<{}, RequestPayload>({
      query: ({ params, payload, customHeaders }) => {
        // eslint-disable-next-line max-len
        const req = createHttpRequest(MacRegListUrlsInfo.uploadMacRegistration, params, customHeaders)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'MacRegistration', id: 'LIST' }]
    }),
    avcCategoryList: build.query<AvcCategory[], RequestPayload>({
      query: ({ params, payload }) => {
        const avcCatListReq = createHttpRequest(AccessControlUrls.getAvcCategory, params)
        return {
          ...avcCatListReq,
          body: payload
        }
      },
      providesTags: [{ type: 'Policy', id: 'LIST' }]
    }),
    avcAppList: build.query<AvcApp[], RequestPayload>({
      query: ({ params, payload }) => {
        const avcAppListReq = createHttpRequest(AccessControlUrls.getAvcApp, params)
        return {
          ...avcAppListReq,
          body: payload
        }
      },
      providesTags: [{ type: 'Policy', id: 'LIST' }]
    }),
    addSyslogPolicy: build.mutation<CommonResult, RequestPayload<SyslogPolicyDetailType>>({
      queryFn: async ({ params, payload, enableRbac }, _queryApi, _extraOptions, fetchWithBQ) => {
        const headers = GetApiVersionHeader(enableRbac ? ApiVersionEnum.v1_1 : undefined)
        const { venues, ...rest } = payload!
        const res = await fetchWithBQ({
          ...createHttpRequest(SyslogUrls.addSyslogPolicy, params, headers),
          body: JSON.stringify(enableRbac ? { ...rest } : payload)
        })
        if (res.error) {
          return { error: res.error as FetchBaseQueryError }
        }
        if (enableRbac) {
          const { response } = res.data as CommonResult
          const requests = venues?.map(venue => ({
            params: { policyId: response?.id, venueId: venue.id }
          }))
          await batchApi(SyslogUrls.bindVenueSyslog, requests ?? [], fetchWithBQ, GetApiVersionHeader(ApiVersionEnum.v1))
        }

        return { data: res.data as CommonResult }
      },
      invalidatesTags: [{ type: 'Syslog', id: 'LIST' }]
    }),
    delSyslogPolicy: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, enableRbac }) => {
        const headers = GetApiVersionHeader(enableRbac ? ApiVersionEnum.v1_1 : undefined)
        const req = createHttpRequest(SyslogUrls.deleteSyslogPolicy, params, headers)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'Syslog', id: 'LIST' }]
    }),
    delSyslogPolicies: build.mutation<CommonResult, RequestPayload>({
      queryFn: async ({ params, payload, enableRbac }, _queryApi, _extraOptions, fetchWithBQ) => {
        if (enableRbac) {
          const requests = (payload as string[]).map(policyId => ({ params: { policyId } }))
          await batchApi(SyslogUrls.deleteSyslogPolicy, requests, fetchWithBQ, GetApiVersionHeader(ApiVersionEnum.v1_1))
          return { data: {} as CommonResult }
        } else {
          const req = createHttpRequest(SyslogUrls.deleteSyslogPolicies, params)
          const res = await fetchWithBQ({ ...req, body: payload })
          return { data: res.data as CommonResult }
        }
      },
      invalidatesTags: [{ type: 'Syslog', id: 'LIST' }]
    }),
    updateSyslogPolicy: build.mutation<CommonResult, RequestPayload<SyslogPolicyDetailType>>({
      queryFn: async ({ params, payload, enableRbac }, _queryApi, _extraOptions, fetchWithBQ) => {
        const { id, venues, oldVenues, ...rest } = payload!
        const headers = GetApiVersionHeader(enableRbac ? ApiVersionEnum.v1_1 : undefined)
        const res = await fetchWithBQ({
          ...createHttpRequest(SyslogUrls.updateSyslogPolicy, params, headers),
          body: JSON.stringify(enableRbac ? { id, ...rest } : payload)
        })

        if(res.error) {
          return { error: res.error as FetchBaseQueryError }
        }

        if (enableRbac) {
          const unbindReqs = difference(oldVenues, venues || []).map(venue => ({
            params: { policyId: id, venueId: venue.id }
          }))
          const bindReqs = difference(venues, oldVenues || []).map(venue => ({
            params: { policyId: id, venueId: venue.id }
          }))
          await Promise.all([
            batchApi(SyslogUrls.unbindVenueSyslog, unbindReqs, fetchWithBQ, GetApiVersionHeader(ApiVersionEnum.v1)),
            batchApi(SyslogUrls.bindVenueSyslog, bindReqs, fetchWithBQ, GetApiVersionHeader(ApiVersionEnum.v1))
          ])
        }
        return { data: res.data as CommonResult }
      },
      invalidatesTags: [{ type: 'Syslog', id: 'LIST' }]
    }),
    venueSyslogPolicy: build.query<TableResult<VenueSyslogPolicyType>, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(SyslogUrls.getVenueSyslogList, params)
        return {
          ...req,
          body: payload
        }
      },
      providesTags: [{ type: 'Syslog', id: 'VENUE' }],
      extraOptions: { maxRetries: 5 }
    }),
    getSyslogPolicy: build.query<SyslogPolicyDetailType, RequestPayload>({
      queryFn: async ({ params, enableRbac }, _queryApi, _extraOptions, fetchWithBQ) => {
        if (enableRbac) {
          const req = createHttpRequest(SyslogUrls.getSyslogPolicy, params, GetApiVersionHeader(ApiVersionEnum.v1_1))
          const viewmodelReq = createHttpRequest(SyslogUrls.querySyslog, params, GetApiVersionHeader(ApiVersionEnum.v1))
          const [res, viewmodelRes] = await Promise.all([
            fetchWithBQ(req),
            fetchWithBQ({
              ...viewmodelReq,
              body: JSON.stringify({ filters: { id: [params!.policyId] } })
            })
          ])
          if (res.error || viewmodelRes.error) {
            return { error: res.error ?? viewmodelRes.error as FetchBaseQueryError }
          }

          const venueIds =
            (viewmodelRes.data as TableResult<SyslogPolicyListType>).data?.[0]?.venueIds
          const mergeData = {
            ...res.data as SyslogPolicyDetailType,
            // eslint-disable-next-line max-len
            ...(venueIds && venueIds?.length > 0) ? { venues: venueIds.map(id => ({ id, name: '' })) } : {}
          }
          return { data: mergeData as SyslogPolicyDetailType }
        } else {
          const req = createHttpRequest(SyslogUrls.getSyslogPolicy, params)
          const res = await fetchWithBQ(req)
          return { data: res.data as SyslogPolicyDetailType }
        }
      },
      providesTags: [{ type: 'Syslog', id: 'LIST' }]
    }),
    getVenueSyslogAp: build.query<VenueSyslogSettingType, RequestPayload>({
      query: ({ params, enableRbac }) => {
        const url = enableRbac ? SyslogUrls.querySyslog : SyslogUrls.getVenueSyslogAp
        const headers = GetApiVersionHeader(enableRbac ? ApiVersionEnum.v1 : undefined)
        const req = createHttpRequest(url, params, headers)
        return{
          ...req,
          ...enableRbac ? {
            body: JSON.stringify({ filters: { venueIds: [params!.venueId] } }) } : {}
        }
      },
      transformResponse: (response: VenueSyslogSettingType | TableResult<SyslogPolicyListType>, _meta, arg: RequestPayload) => {
        if (arg.enableRbac) {
          const res = response as TableResult<SyslogPolicyListType>
          return res.data.length > 0
            ? { serviceProfileId: res.data[0].id, enabled: true } as VenueSyslogSettingType
            : { enabled: false } as VenueSyslogSettingType
        }
        return response as VenueSyslogSettingType
      },
      providesTags: [{ type: 'Syslog', id: 'VENUE' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, [
            'DeactivateSyslogServerProfileOnVenue',
            'ActivateSyslogServerProfileOnVenue'
          ], () => {
            api.dispatch(policyApi.util.invalidateTags([{ type: 'Syslog', id: 'VENUE' }]))
          })
        })
      }
    }),
    updateVenueSyslogAp: build.mutation<VenueSyslogSettingType, RequestPayload<VenueSyslogSettingType>>({
      query: ({ params, payload, enableRbac }) => {
        const url = enableRbac ?
          (payload!.enabled ? SyslogUrls.bindVenueSyslog : SyslogUrls.unbindVenueSyslog)
          : SyslogUrls.updateVenueSyslogAp
        const headers = GetApiVersionHeader(enableRbac ? ApiVersionEnum.v1 : undefined)
        const param = enableRbac ? { ...params, policyId: payload!.serviceProfileId } : params
        const req = createHttpRequest(url, param, headers)
        return {
          ...req,
          ...(enableRbac ? {} : { body: payload })
        }
      },
      invalidatesTags: [{ type: 'Syslog', id: 'VENUE' }]
    }),
    getSyslogPolicyList: build.query<SyslogPolicyDetailType[], RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(SyslogUrls.getSyslogPolicyList, params)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'Syslog', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, [
            'AddSyslogServerProfile',
            'AddSyslogServerProfileV1_1',
            'UpdateSyslogServerProfile',
            'UpdateSyslogServerProfileV1_1',
            'DeleteSyslogServerProfile',
            'DeleteSyslogServerProfiles',
            'DeleteSyslogServerProfileV1_1'
          ], () => {
            api.dispatch(policyApi.util.invalidateTags([{ type: 'Syslog', id: 'LIST' }]))
          })
        })
      }
    }),
    getVenueSyslogList: build.query<TableResult<VenueSyslogPolicyType>, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(SyslogUrls.getVenueSyslogList, params)
        return {
          ...req,
          body: payload
        }
      },
      providesTags: [{ type: 'Syslog', id: 'VENUE' }]
    }),
    syslogPolicyList: build.query<TableResult<SyslogPolicyListType>, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const url = enableRbac ? SyslogUrls.querySyslog : SyslogUrls.syslogPolicyList
        const headers = GetApiVersionHeader(enableRbac ? ApiVersionEnum.v1 : undefined)
        const req = createHttpRequest(url, params, headers)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      providesTags: [{ type: 'Syslog', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, [
            'AddSyslogServerProfile',
            'AddSyslogServerProfileV1_1',
            'UpdateSyslogServerProfile',
            'UpdateSyslogServerProfileV1_1',
            'DeleteSyslogServerProfile',
            'DeleteSyslogServerProfiles',
            'DeleteSyslogServerProfileV1_1'
          ], () => {
            api.dispatch(policyApi.util.invalidateTags([{ type: 'Syslog', id: 'LIST' }]))
          })
        })
      },
      extraOptions: { maxRetries: 5 }
    }),
    // TODO: Change RBAC API (API Done, Testing pending)
    getApSnmpPolicyList: build.query<ApSnmpPolicy[], RequestPayload>({
      async queryFn ({ params, enableRbac }, _api, _extraOptions, fetchWithBQ) {
        if (enableRbac) {
          const apiCustomHeader = GetApiVersionHeader(ApiVersionEnum.v1)
          // eslint-disable-next-line max-len
          const snmpListReq = { ...createHttpRequest(ApSnmpRbacUrls.getApSnmpFromViewModel, params, apiCustomHeader),
            body: enableRbac? JSON.stringify({}) : {}
          }
          const res = await fetchWithBQ(snmpListReq)
          const tableResult = res.data as TableResult<RbacApSnmpViewModelData>
          const rbacApSnmpViewModel = tableResult.data

          const policies: Promise<RbacApSnmpPolicy>[] = rbacApSnmpViewModel.map(async (profile) => {
            // eslint-disable-next-line max-len
            const req = createHttpRequest(ApSnmpRbacUrls.getApSnmpPolicy, { profileId: profile.id }, apiCustomHeader)
            const res = await fetchWithBQ(req)
            return res.data as RbacApSnmpPolicy
          })
          return {
            data: await asyncConvertRbacSnmpPolicyToOldFormat(policies, rbacApSnmpViewModel)
          }
        } else {
          let result: ApSnmpPolicy[] = []
          const req = createHttpRequest(ApSnmpUrls.getApSnmpPolicyList, params, RKS_NEW_UI)
          const res = await fetchWithBQ(req)
          result = res.data as ApSnmpPolicy[]
          return { data: result }
        }

      },
      providesTags: [{ type: 'SnmpAgent', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, [
            'AddApSnmpAgentProfile',
            'UpdateApSnmpAgentProfile',
            'DeleteApSnmpAgentProfile',
            'DeactivateSnmpAgentProfileOnAP',
            'ActivateSnmpAgentProfileOnAp'
          ], () => {
            api.dispatch(policyApi.util.invalidateTags([{ type: 'SnmpAgent', id: 'LIST' }]))
          })
        })
      }
    }),
    // TODO: Change RBAC API (API Done, Testing pending)
    getApSnmpPolicy: build.query<ApSnmpPolicy, RequestPayload>({
      async queryFn ({ params, enableRbac }, _api, _extraOptions, fetchWithBQ) {
        const urlsInfo = enableRbac? ApSnmpRbacUrls : ApSnmpUrls
        const customParams = {
          ...params,
          profileId: params?.policyId
        }
        const rbacApiVersion = enableRbac? ApiVersionEnum.v1 : undefined
        const apiCustomHeader = GetApiVersionHeader(rbacApiVersion)
        const req = createHttpRequest(urlsInfo.getApSnmpPolicy, customParams, apiCustomHeader)
        const res = await fetchWithBQ(req)
        if (enableRbac) {
          const policy = res.data as RbacApSnmpPolicy
          const [v2Agents, v3Agents] = convertRbacSnmpAgentToOldFormat(policy)
          const formattedData = {
            id: policy.id,
            policyName: policy.name,
            snmpV2Agents: v2Agents,
            snmpV3Agents: v3Agents
          } as ApSnmpPolicy
          return { data: formattedData }
        } else {
          const result = res.data as ApSnmpPolicy
          return { data: result }
        }
      },
      providesTags: [{ type: 'SnmpAgent', id: 'LIST' }]
    }),
    // TODO: Change RBAC API (API Done, Testing pending)
    addApSnmpPolicy: build.mutation<{ response: { [key:string]:string } }, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const urlsInfo = enableRbac? ApSnmpRbacUrls : ApSnmpUrls
        const customParams = {
          ...params,
          profileId: params?.policyId
        }
        const rbacApiVersion = enableRbac? ApiVersionEnum.v1 : undefined
        const apiCustomHeader = GetApiVersionHeader(rbacApiVersion)
        const req = createHttpRequest(urlsInfo.addApSnmpPolicy, customParams , apiCustomHeader)
        return {
          ...req,
          // eslint-disable-next-line max-len
          body: enableRbac ? JSON.stringify(convertOldPolicyToRbacFormat(payload as ApSnmpPolicy)) : payload
        }
      },
      invalidatesTags: [{ type: 'SnmpAgent', id: 'LIST' }]
    }),
    // TODO: Change RBAC API (API Done, Testing pending)
    updateApSnmpPolicy: build.mutation<ApSnmpPolicy, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const urlsInfo = enableRbac? ApSnmpRbacUrls : ApSnmpUrls
        const customParams = {
          ...params,
          profileId: params?.policyId
        }
        const rbacApiVersion = enableRbac? ApiVersionEnum.v1 : undefined
        const apiCustomHeader = GetApiVersionHeader(rbacApiVersion)

        const req = createHttpRequest(urlsInfo.updateApSnmpPolicy, customParams, apiCustomHeader)
        return {
          ...req,
          // eslint-disable-next-line max-len
          body: enableRbac ? JSON.stringify(convertOldPolicyToRbacFormat(payload as ApSnmpPolicy)) : payload
        }
      },
      invalidatesTags: [{ type: 'SnmpAgent', id: 'LIST' }]
    }),
    // TODO: Change RBAC API (API Done, Testing pending)
    deleteApSnmpPolicy: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, enableRbac }) => {
        const urlsInfo = enableRbac? ApSnmpRbacUrls : ApSnmpUrls
        const customParams = {
          ...params,
          profileId: params?.policyId
        }
        const rbacApiVersion = enableRbac? ApiVersionEnum.v1 : undefined
        const apiCustomHeader = GetApiVersionHeader(rbacApiVersion)

        const req = createHttpRequest(urlsInfo.deleteApSnmpPolicy, customParams, apiCustomHeader)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'SnmpAgent', id: 'LIST' }]
    }),
    // TODO: Change RBAC API (API Done, Testing pending)
    getApUsageByApSnmp: build.query<TableResult<ApSnmpApUsage>, RequestPayload>({
      async queryFn ({ params, payload, enableRbac }, _api, _extraOptions, fetchWithBQ) {
        if (enableRbac) {
          const apiCustomHeader = GetApiVersionHeader(ApiVersionEnum.v1)
          const req = {
            ...createHttpRequest(ApSnmpRbacUrls.getApSnmpFromViewModel, params, apiCustomHeader),
            body: JSON.stringify( { filters: { id: [params?.policyId] } })
          }
          const response = await fetchWithBQ(req)
          const rbacApSnmpViewModel = response.data as TableResult<RbacApSnmpViewModelData>
          const apsnmpProfile = rbacApSnmpViewModel.data[0]
          const unformattedData = zip(apsnmpProfile.apNames,
            apsnmpProfile.apSerialNumbers,
            apsnmpProfile.venueIds,
            apsnmpProfile.venueNames)

          const formattedData: ApSnmpApUsage[] = unformattedData.map((data) => {
            const [apName, apId, venueId, venueName] = data as [string, string, string, string]
            return { apName, apId, venueId, venueName }
          })

          let result : TableResult<ApSnmpApUsage> = {
            ...rbacApSnmpViewModel,
            data: formattedData
          }
          return { data: result }

        } else {
          const req = {
            ...createHttpRequest(ApSnmpUrls.getApUsageByApSnmpPolicy, params, RKS_NEW_UI),
            body: payload
          }
          const res = await fetchWithBQ(req)
          const result = res.data as TableResult<ApSnmpApUsage>
          return { data: result }
        }
      },
      providesTags: [{ type: 'SnmpAgent', id: 'LIST' }]
    }),
    // TODO: Change RBAC API
    /* eslint-disable max-len */
    getApSnmpViewModel: build.query<TableResult<ApSnmpViewModelData>, RequestPayload>({
      async queryFn ({ params, payload, enableRbac }, _api, _extraOptions, fetchWithBQ) {
        if (enableRbac) {
          const apiCustomHeader = GetApiVersionHeader(ApiVersionEnum.v1)
          const req = {
            ...createHttpRequest(ApSnmpRbacUrls.getApSnmpFromViewModel, params, apiCustomHeader),
            body: JSON.stringify({})
          }
          const res = await fetchWithBQ(req)
          const tableResult = res.data as TableResult<RbacApSnmpViewModelData>
          const rbacApSnmpViewModels = tableResult.data
          const rbacPolicies: Promise<RbacApSnmpPolicy>[] = rbacApSnmpViewModels.map(async (profile) => {
            // eslint-disable-next-line max-len
            const req = createHttpRequest(ApSnmpRbacUrls.getApSnmpPolicy, { profileId: profile.id }, apiCustomHeader)
            const res = await fetchWithBQ(req)
            return res.data as RbacApSnmpPolicy
          })
          const policies = await asyncConvertRbacSnmpPolicyToOldFormat(rbacPolicies, rbacApSnmpViewModels)
          const apSnmpViewModelData = policies.map((oldPolicy) => {
            const rbacApSnmpViewModel = rbacApSnmpViewModels.find((model) => model.id === oldPolicy.id)
            return {
              id: oldPolicy.id,
              name: oldPolicy.policyName,
              v2Agents: convertToCountAndNumber(oldPolicy.snmpV2Agents),
              v3Agents: convertToCountAndNumber(oldPolicy.snmpV3Agents),
              venues: convertToCountAndNumber(rbacApSnmpViewModel?.venueNames),
              aps: convertToCountAndNumber(rbacApSnmpViewModel?.apNames)
            } as ApSnmpViewModelData
          })
          const result = { ...tableResult, data: apSnmpViewModelData } as TableResult<ApSnmpViewModelData>
          return { data: result }
        } else {
          const req = { ...createHttpRequest(ApSnmpUrls.getApSnmpFromViewModel, params, RKS_NEW_UI),
            body: payload
          }
          const res = await fetchWithBQ(req)
          const result = res.data as TableResult<ApSnmpViewModelData>
          return { data: result }
        }
      },
      keepUnusedDataFor: 0,
      providesTags: [{ type: 'SnmpAgent', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, [
            'AddApSnmpAgentProfile',
            'UpdateApSnmpAgentProfile',
            'DeleteApSnmpAgentProfile',
            'UpdateVenueApSnmpAgent',
            'UpdateApSnmpAgent',
            'ResetApSnmpAgent'
          ], () => {
            api.dispatch(policyApi.util.invalidateTags([{ type: 'SnmpAgent', id: 'LIST' }]))
          })
        })
      },
      extraOptions: { maxRetries: 5 }
    }),
    /* eslint-enable max-len */
    // TODO: Change RBAC API (API Done, Testing pending)
    getVenueApSnmpSettings: build.query<VenueApSnmpSettings, RequestPayload>({
      async queryFn ({ params, enableRbac }, _api, _extraOptions, fetchWithBQ) {
        if (enableRbac) {
          const apiCustomHeader = GetApiVersionHeader(ApiVersionEnum.v1)
          let result = { apSnmpAgentProfileId: '', enableApSnmp: false } as VenueApSnmpSettings
          const payload = { filters: { venueIds: [ params?.venueId ] } }
          const req = {
            ...createHttpRequest(ApSnmpRbacUrls.getApSnmpFromViewModel, params, apiCustomHeader),
            body: enableRbac? JSON.stringify(payload) : payload
          }
          const res = await fetchWithBQ(req)
          const rbacApSnmpViewModel = res.data as TableResult<RbacApSnmpViewModelData>
          if (rbacApSnmpViewModel.data.length === 0) {
            return { data: result }
          } else {
            const apsnmpProfile = rbacApSnmpViewModel.data[0]
            // eslint-disable-next-line max-len
            result = { apSnmpAgentProfileId: apsnmpProfile.id, enableApSnmp: true } as VenueApSnmpSettings
            return { data: result }
          }
        } else {
          const req = createHttpRequest(ApSnmpUrls.getVenueApSnmpSettings, params, RKS_NEW_UI)
          const res = await fetchWithBQ(req)
          const result = res.data as VenueApSnmpSettings
          return { data: result }
        }
      },
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, [
            'DeactivateSnmpAgentProfileOnVenue',
            'ActivateSnmpAgentProfileOnVenue'
          ], () => {
            api.dispatch(policyApi.util.invalidateTags([{ type: 'SnmpAgent', id: 'VENUE' }]))
          })
        })
      },
      providesTags: [{ type: 'SnmpAgent', id: 'VENUE' }]
    }),
    // TODO: Change RBAC API
    updateVenueApSnmpSettings: build.mutation<VenueApSnmpSettings, RequestPayload>({
      query: ({ params, enableRbac, payload }) => {
        if(enableRbac) {
          const castedPayload = payload as ApSnmpSettings
          const rbacApiVersion = enableRbac? ApiVersionEnum.v1 : undefined
          const apiCustomHeader = GetApiVersionHeader(rbacApiVersion)
          // eslint-disable-next-line max-len
          const url = (castedPayload?.enableApSnmp) ? ApSnmpRbacUrls.updateVenueApSnmpSettings: ApSnmpRbacUrls.resetVenueApSnmpSettings
          return createHttpRequest(url, params, apiCustomHeader)
        } else {
          const req = createHttpRequest(ApSnmpUrls.updateVenueApSnmpSettings, params, RKS_NEW_UI)
          return {
            ...req,
            body: payload
          }
        }
      },
      invalidatesTags: [{ type: 'SnmpAgent', id: 'VENUE' }]
    }),
    // TODO: Change RBAC API (API Done, Testing pending)
    getApSnmpSettings: build.query<ApSnmpSettings, RequestPayload>({
      async queryFn ({ params, enableRbac }, _api, _extraOptions, fetchWithBQ) {
        if (enableRbac) {
          const apiCustomHeader = GetApiVersionHeader(ApiVersionEnum.v1)
          // eslint-disable-next-line max-len
          const settingRequest = createHttpRequest(ApSnmpRbacUrls.getApSnmpSettings, params, apiCustomHeader)
          const settingResponse = await fetchWithBQ(settingRequest)
          const setting = settingResponse.data as { useVenueSettings: boolean }
          const payload = { filters: { apSerialNumbers: [ params?.serialNumber ] } }
          const viewModelRequest = {
            ...createHttpRequest(ApSnmpRbacUrls.getApSnmpFromViewModel, params, apiCustomHeader),
            body: enableRbac? JSON.stringify(payload) : payload
          }

          const viewModelResponse = await fetchWithBQ(viewModelRequest)
          const viewModel = viewModelResponse.data as TableResult<RbacApSnmpViewModelData>
          const enableApSnmp = viewModel.data.length === 1

          const result = {
            enableApSnmp,
            useVenueSettings: setting.useVenueSettings,
            ...(enableApSnmp ? { apSnmpAgentProfileId: viewModel.data[0]?.id }: {})
          } as ApSnmpSettings
          return { data: result }

        } else {
          const req = createHttpRequest(ApSnmpUrls.getApSnmpSettings, params, RKS_NEW_UI)
          const res = await fetchWithBQ(req)
          const result = res.data as ApSnmpSettings
          return { data: result }
        }
      },
      providesTags: [{ type: 'SnmpAgent', id: 'AP' }]
    }),
    // TODO: Change RBAC API (API Done, Testing pending)
    updateApSnmpSettings: build.mutation<ApSnmpSettings, RequestPayload>({
      query: ({ params, enableRbac, payload }) => {
        if(enableRbac) {
          const castedPayload = payload as ApSnmpSettings
          const rbacApiVersion = enableRbac? ApiVersionEnum.v1 : undefined
          const apiCustomHeader = GetApiVersionHeader(rbacApiVersion)
          // eslint-disable-next-line max-len
          const url = (castedPayload?.enableApSnmp) ? ApSnmpRbacUrls.updateApSnmpSettings: ApSnmpRbacUrls.disableApSnmp
          return createHttpRequest(url, params, apiCustomHeader)
        } else {
          const req = createHttpRequest(ApSnmpUrls.updateApSnmpSettings, params, RKS_NEW_UI)
          return {
            ...req,
            body: payload
          }
        }
      },
      invalidatesTags: [{ type: 'SnmpAgent', id: 'AP' }]
    }),
    // TODO: Change RBAC API (API Done, Testing pending)
    resetApSnmpSettings: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, enableRbac }) => {
        const urlsInfo = enableRbac? ApSnmpRbacUrls : ApSnmpUrls
        const rbacApiVersion = enableRbac? ApiVersionEnum.v1 : undefined
        const apiCustomHeader = GetApiVersionHeader(rbacApiVersion)
        const payload = JSON.stringify({ useVenueSettings: true })
        const req = createHttpRequest(urlsInfo.resetApSnmpSettings, params, apiCustomHeader)
        return {
          ...req,
          // eslint-disable-next-line max-len
          ...(enableRbac ? { body: payload } : {})
        }
      },
      invalidatesTags: [{ type: 'SnmpAgent', id: 'AP' }]
    }),
    // eslint-disable-next-line max-len
    radiusAttributeGroupListByQuery: build.query<TableResult<RadiusAttributeGroup>, RequestPayload>({
      query: ({ params, payload }) => {
        // eslint-disable-next-line max-len
        const req = createHttpRequest(RadiusAttributeGroupUrlsInfo.getAttributeGroupsWithQuery, params)
        return {
          ...req,
          body: {
            ...(payload as TableChangePayload),
            ...transferToNewTablePaginationParams(payload as TableChangePayload)
          }
        }
      },
      providesTags: [{ type: 'RadiusAttributeGroup', id: 'LIST' }],
      extraOptions: { maxRetries: 5 }
    }),
    radiusAttributeVendorList: build.query<RadiusAttributeVendor, RequestPayload>({
      query: ({ params }) => {
        // eslint-disable-next-line max-len
        const req = createHttpRequest(
          RadiusAttributeGroupUrlsInfo.getAttributeVendors, params
        )
        return {
          ...req
        }
      }
    }),
    radiusAttributeListWithQuery: build.query<TableResult<RadiusAttribute>, RequestPayload>({
      query: ({ params, payload }) => {
        // eslint-disable-next-line max-len
        const groupReq = createHttpRequest(RadiusAttributeGroupUrlsInfo.getAttributesWithQuery, params)
        return {
          ...groupReq,
          body: payload
        }
      },
      providesTags: [{ type: 'RadiusAttribute', id: 'LIST' }]
    }),
    radiusAttribute: build.query<RadiusAttribute, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(
          RadiusAttributeGroupUrlsInfo.getAttribute, params
        )
        return {
          ...req
        }
      }
    }),
    deleteRadiusAttributeGroup: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(RadiusAttributeGroupUrlsInfo.deleteAttributeGroup, params)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'RadiusAttributeGroup', id: 'LIST' }]
    }),
    addRadiusAttributeGroup: build.mutation<RadiusAttributeGroup, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(RadiusAttributeGroupUrlsInfo.createAttributeGroup, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'RadiusAttributeGroup', id: 'LIST' }]
    }),
    updateRadiusAttributeGroup: build.mutation<RadiusAttributeGroup, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(RadiusAttributeGroupUrlsInfo.updateAttributeGroup, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'RadiusAttributeGroup', id: 'LIST' }]
    }),
    getRadiusAttributeGroup: build.query<RadiusAttributeGroup, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(RadiusAttributeGroupUrlsInfo.getAttributeGroup, params)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'RadiusAttributeGroup', id: 'DETAIL' }]
    }),
    createAssignment: build.mutation<Assignment, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(RadiusAttributeGroupUrlsInfo.createAssignment, params)
        return {
          ...req,
          body: payload
        }
      }
    }),
    getAssignment: build.mutation<Assignment, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(RadiusAttributeGroupUrlsInfo.getAssignment, params)
        return{
          ...req
        }
      }
    }),
    getAssignments: build.query<TableResult<Assignment>, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createNewTableHttpRequest({
          apiInfo: RadiusAttributeGroupUrlsInfo.getAssignments,
          params,
          payload: payload as TableChangePayload
        })
        return {
          ...req
        }
      },
      transformResponse (result: NewTableResult<Assignment>) {
        return transferToTableResult<Assignment>(result)
      }
    }),
    adaptivePolicyListByQuery: build.query<TableResult<AdaptivePolicy>, RequestPayload>({
      query: ({ params, payload }) => {
        // eslint-disable-next-line max-len
        const req = createHttpRequest(RulesManagementUrlsInfo.getPoliciesByQuery, { excludeContent: 'false', ...params } )
        return {
          ...req,
          body: {
            ...(payload as TableChangePayload),
            ...transferToNewTablePaginationParams(payload as TableChangePayload)
          }
        }
      },
      transformResponse (result: NewAPITableResult<AdaptivePolicy>) {
        return transferNewResToTableResult<AdaptivePolicy>(result, { pageStartZero: true })
      },
      providesTags: [{ type: 'AdaptivePolicy', id: 'LIST' }],
      extraOptions: { maxRetries: 5 }
    }),
    getAdaptivePolicy: build.query<AdaptivePolicy, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(RulesManagementUrlsInfo.getPolicyByTemplate, params)
        return{
          ...req
        }
      },
      providesTags: [{ type: 'AdaptivePolicy', id: 'DETAIL' }]
    }),
    deleteAdaptivePolicy: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(RulesManagementUrlsInfo.deletePolicy, params)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'AdaptivePolicy', id: 'LIST' }]
    }),
    policyTemplateListByQuery: build.query<TableResult<RuleTemplate>, RequestPayload>({
      query: ({ params, payload }) => {
        // eslint-disable-next-line max-len
        const req = createHttpRequest(RulesManagementUrlsInfo.getPolicyTemplateListByQuery, { excludeContent: 'false', ...params } )
        return {
          ...req,
          body: {
            ...(payload as TableChangePayload),
            ...transferToNewTablePaginationParams(payload as TableChangePayload)
          }
        }
      },
      transformResponse (result: NewAPITableResult<RuleTemplate>) {
        return transferNewResToTableResult<RuleTemplate>(result, { pageStartZero: true })
      },
      extraOptions: { maxRetries: 5 }
    }),
    getPolicyTemplateAttributesList: build.query<TableResult<RuleAttribute>, RequestPayload>({
      query: ({ params, payload }) => {
        // eslint-disable-next-line max-len
        const req = createNewTableHttpRequest({
          apiInfo: RulesManagementUrlsInfo.getPolicyTemplateAttributes,
          params,
          payload: payload as TableChangePayload
        })
        return {
          ...req
        }
      },
      transformResponse (result: NewTableResult<RuleAttribute>) {
        return transferToTableResult<RuleAttribute>(result)
      }
    }),
    addAdaptivePolicy: build.mutation<AdaptivePolicy, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(
          RulesManagementUrlsInfo.createPolicy,
          params,
          { 'Content-Type': 'application/ruckus.one.v1-synchronous+json' })
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'AdaptivePolicy', id: 'LIST' }]
    }),
    addPolicyConditions: build.mutation<AccessCondition, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(RulesManagementUrlsInfo.addConditions, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'AdaptivePolicyCondition', id: 'LIST' }]
    }),
    updatePolicyConditions: build.mutation<AccessCondition, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(RulesManagementUrlsInfo.updateConditions, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'AdaptivePolicyCondition', id: 'LIST' }]
    }),
    deletePolicyConditions: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(RulesManagementUrlsInfo.deleteConditions, params)
        return {
          ...req
        }
      }
    }),
    getConditionsInPolicy: build.query<TableResult<AccessCondition>, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createNewTableHttpRequest({
          apiInfo: RulesManagementUrlsInfo.getConditionsInPolicy,
          params,
          payload: payload as TableChangePayload
        })
        return {
          ...req
        }
      },
      transformResponse (result: NewAPITableResult<AccessCondition>) {
        return transferNewResToTableResult<AccessCondition>(result, { pageStartZero: true })
      },
      providesTags: [{ type: 'AdaptivePolicyCondition', id: 'LIST' }]
    }),
    updateAdaptivePolicy: build.mutation<AdaptivePolicy, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(RulesManagementUrlsInfo.updatePolicy, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'AdaptivePolicy', id: 'LIST' }]
    }),
    adaptivePolicySetList: build.query<TableResult<AdaptivePolicySet>, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createNewTableHttpRequest({
          apiInfo: RulesManagementUrlsInfo.getPolicySets,
          params,
          payload: payload as TableChangePayload
        })
        return {
          ...req
        }
      },
      transformResponse (result: NewAPITableResult<AdaptivePolicySet>) {
        return transferNewResToTableResult<AdaptivePolicySet>(result, { pageStartZero: true })
      },
      providesTags: [{ type: 'AdaptivePolicySet', id: 'LIST' }],
      extraOptions: { maxRetries: 5 }
    }),
    deleteAdaptivePolicySet: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(RulesManagementUrlsInfo.deletePolicySet, params)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'AdaptivePolicySet', id: 'LIST' }]
    }),
    adaptivePolicySetListByQuery: build.query<TableResult<AdaptivePolicySet>, RequestPayload>({
      query: ({ params, payload }) => {
        // eslint-disable-next-line max-len
        const req = createHttpRequest(RulesManagementUrlsInfo.getPolicySetsByQuery, { excludeContent: 'false', ...params } )
        return {
          ...req,
          body: {
            ...(payload as TableChangePayload),
            ...transferToNewTablePaginationParams(payload as TableChangePayload)
          }
        }
      },
      transformResponse (result: NewAPITableResult<AdaptivePolicySet>) {
        return transferNewResToTableResult<AdaptivePolicySet>(result, { pageStartZero: true })
      },
      providesTags: [{ type: 'AdaptivePolicySet', id: 'LIST' }],
      extraOptions: { maxRetries: 5 }
    }),
    getAdaptivePolicySet: build.query<AdaptivePolicySet, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(RulesManagementUrlsInfo.getPolicySet, params)
        return{
          ...req
        }
      },
      providesTags: [{ type: 'AdaptivePolicySet', id: 'DETAIL' }]
    }),
    addAdaptivePolicySet: build.mutation<AdaptivePolicySet, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(RulesManagementUrlsInfo.createPolicySet, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'AdaptivePolicySet', id: 'LIST' }]
    }),
    updateAdaptivePolicySet: build.mutation<AdaptivePolicySet, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(RulesManagementUrlsInfo.updatePolicySet, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'AdaptivePolicySet', id: 'LIST' }]
    }),
    addPrioritizedPolicy: build.mutation<PrioritizedPolicy, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(RulesManagementUrlsInfo.assignPolicyPriority, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'AdaptivePrioritizedPolicy', id: 'LIST' }]
    }),
    deletePrioritizedPolicy: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(RulesManagementUrlsInfo.removePrioritizedAssignment, params)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'AdaptivePrioritizedPolicy', id: 'LIST' }]
    }),
    getPrioritizedPolicies: build.query<TableResult<PrioritizedPolicy>, RequestPayload>({
      query: ({ params }) => {
        const req = createNewTableHttpRequest({
          apiInfo: RulesManagementUrlsInfo.getPrioritizedPolicies,
          params
        })
        return {
          ...req
        }
      },
      transformResponse (result: NewAPITableResult<PrioritizedPolicy>) {
        return transferNewResToTableResult<PrioritizedPolicy>(result, { pageStartZero: true })
      },
      providesTags: [{ type: 'AdaptivePrioritizedPolicy', id: 'LIST' }]
    }),
    getCertificateTemplates: build.query<TableResult<CertificateTemplate>, RequestPayload>({
      query: ({ params, payload }) => {
        // eslint-disable-next-line max-len
        const req = createHttpRequest(CertificateUrls.getCertificateTemplates, params, defaultCertTempVersioningHeaders)
        return {
          ...req,
          body: JSON.stringify({
            ...(payload as TableChangePayload),
            // eslint-disable-next-line max-len
            ...transferToNewTablePaginationParams({ ...payload as TableChangePayload, pageStartZero: false })
          })
        }
      },
      providesTags: [{ type: 'CertificateTemplate', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, [
            'DELETE_TEMPLATE',
            'ADD_TEMPLATE',
            'UPDATE_TEMPLATE',
            'DELETE_CA'
          ], () => {
            api.dispatch(policyApi.util.invalidateTags([
              { type: 'CertificateTemplate', id: 'LIST' }
            ]))
          })
        })
      }
    }),
    getCertificateTemplate: build.query<CertificateTemplate, RequestPayload>({
      query: ({ params }) => {
        // eslint-disable-next-line max-len
        const req = createHttpRequest(CertificateUrls.getCertificateTemplate, params, defaultCertTempVersioningHeaders)
        return{
          ...req
        }
      },
      providesTags: [{ type: 'CertificateTemplate', id: 'DETAIL' }]
    }),
    addCertificateTemplate: build.mutation<CertificateTemplateMutationResult, RequestPayload>({
      query: ({ params, payload }) => {
        // eslint-disable-next-line max-len
        const req = createHttpRequest(CertificateUrls.addCertificateTemplate, params, defaultCertTempVersioningHeaders)
        return{
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'CertificateTemplate', id: 'LIST' }]
    }),
    editCertificateTemplate: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        // eslint-disable-next-line max-len
        const req = createHttpRequest(CertificateUrls.editCertificateTemplate, params, defaultCertTempVersioningHeaders)
        return{
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'CertificateTemplate', id: 'LIST' }]
    }),
    bindCertificateTemplateWithPolicySet: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        // eslint-disable-next-line max-len
        const req = createHttpRequest(CertificateUrls.bindCertificateTemplateWithPolicySet, params, defaultCertTempVersioningHeaders)
        return{
          ...req
        }
      },
      invalidatesTags: [{ type: 'CertificateTemplate', id: 'LIST' }]
    }),
    unbindCertificateTemplateWithPolicySet: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        // eslint-disable-next-line max-len
        const req = createHttpRequest(CertificateUrls.unbindCertificateTemplateWithPolicySet, params, defaultCertTempVersioningHeaders)
        return{
          ...req
        }
      },
      invalidatesTags: [{ type: 'CertificateTemplate', id: 'LIST' }]
    }),
    deleteCertificateTemplate: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        // eslint-disable-next-line max-len
        const req = createHttpRequest(CertificateUrls.deleteCertificateTemplate, params, defaultCertTempVersioningHeaders)
        return{
          ...req
        }
      },
      invalidatesTags: [{ type: 'CertificateTemplate', id: 'LIST' }]
    }),
    getCertificateAuthorities: build.query<TableResult<CertificateAuthority>, RequestPayload>({
      query: ({ params, payload }) => {
        // eslint-disable-next-line max-len
        const req = createHttpRequest(CertificateUrls.getCAs, params, defaultCertTempVersioningHeaders)
        return {
          ...req,
          body: JSON.stringify({
            ...(payload as TableChangePayload),
            // eslint-disable-next-line max-len
            ...transferToNewTablePaginationParams({ ...payload as TableChangePayload, pageStartZero: false })
          })
        }
      },
      providesTags: [{ type: 'CertificateAuthority', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, [
            'ADD_CA',
            'UPDATE_CA',
            'UPLOAD_CA',
            'DELETE_CA'
          ], () => {
            api.dispatch(policyApi.util.invalidateTags([
              { type: 'CertificateAuthority', id: 'LIST' }
            ]))
          })
        })
      }
    }),
    getCertificateAuthority: build.query<CertificateAuthority, RequestPayload>({
      query: ({ params }) => {
        // eslint-disable-next-line max-len
        const req = createHttpRequest(CertificateUrls.getCA, params, defaultCertTempVersioningHeaders)
        return{
          ...req
        }
      },
      providesTags: [{ type: 'CertificateAuthority', id: 'DETAIL' }]
    }),
    getSubCertificateAuthorities: build.query<TableResult<CertificateAuthority>, RequestPayload>({
      query: ({ params, payload }) => {
        // eslint-disable-next-line max-len
        const req = createHttpRequest(CertificateUrls.getSubCAs, params, defaultCertTempVersioningHeaders)
        return {
          ...req,
          body: JSON.stringify({
            ...(payload as TableChangePayload),
            // eslint-disable-next-line max-len
            ...transferToNewTablePaginationParams({ ...payload as TableChangePayload, pageStartZero: false })
          })
        }
      },
      providesTags: [{ type: 'CertificateAuthority', id: 'SUBLIST' }]
    }),
    addCertificateAuthority: build.mutation<CertificateTemplateMutationResult, RequestPayload>({
      query: ({ params, payload }) => {
        // eslint-disable-next-line max-len
        const req = createHttpRequest(CertificateUrls.addCA, params, defaultCertTempVersioningHeaders)
        return{
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'CertificateAuthority', id: 'LIST' }]
    }),
    uploadCertificateAuthority: build.mutation<CertificateTemplateMutationResult, RequestPayload>({
      query: ({ params, payload, customHeaders }) => {
        // eslint-disable-next-line max-len
        const req = createHttpRequest(CertificateUrls.addCA, params, { ...defaultCertTempVersioningHeaders, ...customHeaders })
        return{
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'CertificateAuthority', id: 'LIST' }]
    }),
    addSubCertificateAuthority: build.mutation<CertificateTemplateMutationResult, RequestPayload>({
      query: ({ params, payload, customHeaders }) => {
        // eslint-disable-next-line max-len
        const req = createHttpRequest(CertificateUrls.addSubCA, params, { ...defaultCertTempVersioningHeaders, ...customHeaders })
        return{
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'CertificateAuthority', id: 'LIST' }]
    }),
    editCertificateAuthority: build.mutation<CertificateTemplateMutationResult, RequestPayload>({
      query: ({ params, payload }) => {
        // eslint-disable-next-line max-len
        const req = createHttpRequest(CertificateUrls.editCA, params, defaultCertTempVersioningHeaders)
        return{
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'CertificateAuthority', id: 'LIST' }]
    }),
    uploadCaPrivateKey: build.mutation<CertificateTemplateMutationResult, RequestPayload>({
      query: ({ params, payload, customHeaders }) => {
        // eslint-disable-next-line max-len
        const req = createHttpRequest(CertificateUrls.uploadCAPrivateKey, params, { ...defaultCertTempVersioningHeaders, ...customHeaders })
        return{
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'CertificateAuthority', id: 'LIST' }]
    }),
    deleteCaPrivateKey: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        // eslint-disable-next-line max-len
        const req = createHttpRequest(CertificateUrls.deleteCAPrivateKey, params, defaultCertTempVersioningHeaders)
        return{
          ...req
        }
      },
      invalidatesTags: [{ type: 'CertificateAuthority', id: 'LIST' }]
    }),
    deleteCertificateAuthority: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        // eslint-disable-next-line max-len
        const req = createHttpRequest(CertificateUrls.deleteCA, params, defaultCertTempVersioningHeaders)
        return{
          ...req
        }
      },
      invalidatesTags: [{ type: 'CertificateAuthority', id: 'LIST' }]
    }),
    downloadCertificateAuthority: build.query<Blob, RequestPayload>({
      query: ({ params, customHeaders }) => {
        // eslint-disable-next-line max-len
        const req = createHttpRequest(CertificateUrls.downloadCA, params, { ...defaultCertTempVersioningHeaders, ...customHeaders })
        return {
          ...req,
          responseHandler: async (response) => {
            let extension = downloadCertExtension[customHeaders?.Accept as CertificateAcceptType]
            const headerContent = response.headers.get('content-disposition')
            const fileName = headerContent
              ? headerContent.split('filename=')[1] : `CertificateAuthority.${extension}`
            downloadFile(response, fileName)
          }
        }
      }
    }),
    downloadCertificateAuthorityChains: build.query<Blob, RequestPayload>({
      query: ({ params, customHeaders }) => {
        // eslint-disable-next-line max-len
        const req = createHttpRequest(CertificateUrls.downloadCAChains, params, { ...defaultCertTempVersioningHeaders, ...customHeaders })
        return {
          ...req,
          responseHandler: async (response) => {
            const extension = customHeaders?.Accept === CertificateAcceptType.PEM ? 'chain' : 'p7b'
            const headerContent = response.headers.get('content-disposition')
            const fileName = headerContent
              ? headerContent.split('filename=')[1] : `CertificateAuthorityChain.${extension}`
            downloadFile(response, fileName)
          }
        }
      }
    }),
    getCertificates: build.query<TableResult<Certificate>, RequestPayload>({
      query: ({ params, payload }) => {
        // eslint-disable-next-line max-len
        const req = createHttpRequest(CertificateUrls.getCertificates, params, defaultCertTempVersioningHeaders)
        return {
          ...req,
          body: JSON.stringify({
            ...(payload as TableChangePayload),
            // eslint-disable-next-line max-len
            ...transferToNewTablePaginationParams({ ...payload as TableChangePayload, pageStartZero: false })
          })
        }
      },
      providesTags: [{ type: 'Certificate', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, [
            'UPDATE_CERT',
            'GENERATE_CERT',
            'DELETE_CA',
            'DELETE_TEMPLATE'
          ], () => {
            api.dispatch(policyApi.util.invalidateTags([
              { type: 'Certificate', id: 'LIST' }
            ]))
          })
        })
      }
    }),
    getSpecificTemplateCertificates: build.query<TableResult<Certificate>, RequestPayload>({
      query: ({ params, payload }) => {
        // eslint-disable-next-line max-len
        const req = createHttpRequest(CertificateUrls.getSpecificTemplateCertificates, params, defaultCertTempVersioningHeaders)
        return {
          ...req,
          body: JSON.stringify({
            ...(payload as TableChangePayload),
            // eslint-disable-next-line max-len
            ...transferToNewTablePaginationParams({ ...payload as TableChangePayload, pageStartZero: false })
          })
        }
      },
      providesTags: [{ type: 'Certificate', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, [
            'GENERATE_CERT',
            'UPDATE_CERT'
          ], () => {
            api.dispatch(policyApi.util.invalidateTags([
              { type: 'Certificate', id: 'LIST' }
            ]))
          })
        })
      }
    }),
    generateCertificate: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        // eslint-disable-next-line max-len
        const req = createHttpRequest(CertificateUrls.generateCertificate, params, defaultCertTempVersioningHeaders)
        return{
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'Certificate', id: 'LIST' }]
    }),
    editCertificate: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        // eslint-disable-next-line max-len
        const req = createHttpRequest(CertificateUrls.editCertificate, params, defaultCertTempVersioningHeaders)
        return{
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'Certificate', id: 'LIST' }]
    }),
    downloadCertificate: build.query<Blob, RequestPayload>({
      query: ({ params, customHeaders }) => {
        // eslint-disable-next-line max-len
        const req = createHttpRequest(CertificateUrls.downloadCertificate, params, { ...defaultCertTempVersioningHeaders, ...customHeaders })
        return {
          ...req,
          responseHandler: async (response) => {
            let extension = downloadCertExtension[customHeaders?.Accept as CertificateAcceptType]
            const headerContent = response.headers.get('content-disposition')
            const fileName = headerContent
              ? headerContent.split('filename=')[1] : `Certificate.${extension}`
            downloadFile(response, fileName)
          }
        }
      }
    }),
    downloadCertificateChains: build.query<Blob, RequestPayload>({
      query: ({ params, customHeaders }) => {
        // eslint-disable-next-line max-len
        const req = createHttpRequest(CertificateUrls.downloadCertificateChains, params, { ...defaultCertTempVersioningHeaders, ...customHeaders })
        return {
          ...req,
          responseHandler: async (response) => {
            const extension = customHeaders?.Accept === CertificateAcceptType.PEM ? 'chain' : 'p7b'
            const headerContent = response.headers.get('content-disposition')
            const fileName = headerContent ?
              headerContent.split('filename=')[1] : `CertificateChain.${extension}`
            downloadFile(response, fileName)
          }
        }
      }
    })
  })
})

export const {
  useMacRegListsQuery,
  useSearchMacRegListsQuery,
  useLazySearchMacRegListsQuery,
  useDeleteMacRegListMutation,
  useGetMacRegListQuery,
  useMacRegistrationsQuery,
  useSearchMacRegistrationsQuery,
  useLazySearchMacRegistrationsQuery,
  useDeleteMacRegistrationMutation,
  useDeleteMacRegistrationsMutation,
  useAddMacRegistrationMutation,
  useUpdateMacRegistrationMutation,
  useAddMacRegListMutation,
  useUpdateMacRegListMutation,
  useUpdateAdaptivePolicySetToMacListMutation,
  useDeleteAdaptivePolicySetFromMacListMutation,
  useAvcCategoryListQuery,
  useAvcAppListQuery,
  useAddRoguePolicyMutation,
  useDelRoguePolicyMutation,
  useDelRoguePoliciesMutation,
  useAddL2AclPolicyMutation,
  useGetL2AclPolicyQuery,
  useDelL2AclPolicyMutation,
  useDelL2AclPoliciesMutation,
  useUpdateL2AclPolicyMutation,
  useAddAppPolicyMutation,
  useGetAppPolicyQuery,
  useDelAppPolicyMutation,
  useDelAppPoliciesMutation,
  useUpdateAppPolicyMutation,
  useAddL3AclPolicyMutation,
  useGetL3AclPolicyQuery,
  useDelL3AclPolicyMutation,
  useDelL3AclPoliciesMutation,
  useUpdateL3AclPolicyMutation,
  useAddAccessControlProfileMutation,
  useUpdateAccessControlProfileMutation,
  useDeleteAccessControlProfileMutation,
  useDeleteAccessControlProfilesMutation,
  useGetAccessControlProfileQuery,
  useL2AclPolicyListQuery,
  useL3AclPolicyListQuery,
  useAddDevicePolicyMutation,
  useGetDevicePolicyQuery,
  useDelDevicePolicyMutation,
  useDelDevicePoliciesMutation,
  useUpdateDevicePolicyMutation,
  useDevicePolicyListQuery,
  useAppPolicyListQuery,
  useGetRoguePolicyListQuery,
  useGetAccessControlProfileListQuery,
  useGetEnhancedAccessControlProfileListQuery,
  useGetEnhancedL2AclProfileListQuery,
  useGetEnhancedL3AclProfileListQuery,
  useGetEnhancedDeviceProfileListQuery,
  useGetEnhancedApplicationProfileListQuery,
  useUpdateRoguePolicyMutation,
  useRoguePolicyQuery,
  useVenueRoguePolicyQuery,
  useEnhancedRoguePoliciesQuery,
  useLazyMacRegListsQuery,
  useLazyMacRegistrationsQuery,
  useAddAAAPolicyMutation,
  useDeleteAAAPolicyListMutation,
  useUpdateAAAPolicyMutation,
  useAaaPolicyQuery,
  useLazyAaaPolicyQuery,
  useAddVLANPoolPolicyMutation,
  useDelVLANPoolPolicyMutation,
  useUpdateVLANPoolPolicyMutation,
  useGetVLANPoolPolicyViewModelListQuery,
  useVlanPoolListQuery,
  useGetVLANPoolPolicyDetailQuery,
  useGetVLANPoolVenuesQuery,
  useAddClientIsolationMutation,
  useDeleteClientIsolationListMutation,
  useGetClientIsolationListQuery,
  useLazyGetClientIsolationListQuery,
  useGetEnhancedClientIsolationListQuery,
  useGetClientIsolationQuery,
  useUpdateClientIsolationMutation,
  useGetClientIsolationUsageByVenueQuery,
  useGetVenueUsageByClientIsolationQuery,
  // HS2.0 Wi-Fi Operator
  useAddWifiOperatorMutation,
  useUpdateWifiOperatorMutation,
  useDeleteWifiOperatorMutation,
  useGetWifiOperatorQuery,
  useGetWifiOperatorListQuery,
  useActivateWifiOperatorOnWifiNetworkMutation,
  useDeactivateWifiOperatorOnWifiNetworkMutation,
  // HS2.0 Identity Provider
  useGetIdentityProviderListQuery,
  useLazyGetIdentityProviderListQuery,
  useGetIdentityProviderQuery,
  useAddIdentityProviderMutation,
  useUpdateIdentityProviderMutation,
  useDeleteIdentityProviderMutation,
  useActivateIdentityProviderRadiusMutation,
  useDeactivateIdentityProviderRadiusMutation,
  useActivateIdentityProviderOnWifiNetworkMutation,
  useDeactivateIdentityProviderOnWifiNetworkMutation,
  // LBS Server Profile
  useAddLbsServerProfileMutation,
  useUpdateLbsServerProfileMutation,
  useDeleteLbsServerProfileMutation,
  useGetLbsServerProfileQuery,
  useGetLbsServerProfileListQuery,
  useActivateLbsServerProfileOnVenueMutation,
  useDeactivateLbsServerProfileOnVenueMutation,
  useLazyGetMacRegListQuery,
  useUploadMacRegistrationMutation,
  useAddSyslogPolicyMutation,
  useDelSyslogPolicyMutation,
  useDelSyslogPoliciesMutation,
  useUpdateSyslogPolicyMutation,
  useVenueSyslogPolicyQuery,
  useGetSyslogPolicyQuery,
  useGetVenueSyslogApQuery,
  useUpdateVenueSyslogApMutation,
  useGetSyslogPolicyListQuery,
  useGetVenueSyslogListQuery,
  useSyslogPolicyListQuery,
  useGetAAAPolicyViewModelListQuery,
  useGetApSnmpPolicyListQuery,
  useLazyGetApSnmpPolicyListQuery,
  useGetApSnmpPolicyQuery,
  useAddApSnmpPolicyMutation,
  useUpdateApSnmpPolicyMutation,
  useDeleteApSnmpPolicyMutation,
  useGetApUsageByApSnmpQuery,
  useGetApSnmpViewModelQuery,
  useGetVenueApSnmpSettingsQuery,
  useLazyGetVenueApSnmpSettingsQuery,
  useUpdateVenueApSnmpSettingsMutation,
  useGetApSnmpSettingsQuery,
  useUpdateApSnmpSettingsMutation,
  useResetApSnmpSettingsMutation,
  useGetRadiusAttributeGroupQuery,
  useRadiusAttributeVendorListQuery,
  useRadiusAttributeListWithQueryQuery,
  useLazyRadiusAttributeListWithQueryQuery,
  useRadiusAttributeQuery,
  useDeleteRadiusAttributeGroupMutation,
  useUpdateRadiusAttributeGroupMutation,
  useAddRadiusAttributeGroupMutation,
  useRadiusAttributeGroupListByQueryQuery,
  useLazyRadiusAttributeGroupListByQueryQuery,
  useLazyGetAdaptivePolicySetQuery,
  useLazyGetRadiusAttributeGroupQuery,
  useLazyGetAssignmentsQuery,
  // policy
  useGetAdaptivePolicyQuery,
  useLazyGetAdaptivePolicyQuery,
  useDeleteAdaptivePolicyMutation,
  usePolicyTemplateListByQueryQuery,
  useGetPolicyTemplateAttributesListQuery,
  useLazyGetPolicyTemplateAttributesListQuery,
  useAddAdaptivePolicyMutation,
  useGetConditionsInPolicyQuery,
  useLazyGetConditionsInPolicyQuery,
  useUpdateAdaptivePolicyMutation,
  useAddPolicyConditionsMutation,
  useUpdatePolicyConditionsMutation,
  useLazyAdaptivePolicyListByQueryQuery,
  useDeletePolicyConditionsMutation,
  useAdaptivePolicyListByQueryQuery,
  // policy set
  useAdaptivePolicySetListQuery,
  useLazyAdaptivePolicySetListQuery,
  useAdaptivePolicySetListByQueryQuery,
  useLazyAdaptivePolicySetListByQueryQuery,
  useDeleteAdaptivePolicySetMutation,
  useLazyGetPrioritizedPoliciesQuery,
  useGetAdaptivePolicySetQuery,
  useAddAdaptivePolicySetMutation,
  useUpdateAdaptivePolicySetMutation,
  useAddPrioritizedPolicyMutation,
  useDeletePrioritizedPolicyMutation,
  useGetPrioritizedPoliciesQuery,
  useGetCertificateTemplatesQuery,
  useLazyGetCertificateTemplatesQuery,
  useLazyGetCertificateTemplateQuery,
  useLazyGetCertificateAuthoritiesQuery,
  useLazyGetCertificateAuthorityQuery,
  useLazyGetSubCertificateAuthoritiesQuery,
  useGetCertificateAuthorityQuery,
  useGetSubCertificateAuthoritiesQuery,
  useGetCertificateAuthoritiesQuery,
  useAddCertificateTemplateMutation,
  useDeleteCertificateTemplateMutation,
  useGetCertificateTemplateQuery,
  useEditCertificateTemplateMutation,
  useBindCertificateTemplateWithPolicySetMutation,
  useUnbindCertificateTemplateWithPolicySetMutation,
  useGetCertificatesQuery,
  useGetSpecificTemplateCertificatesQuery,
  useAddCertificateAuthorityMutation,
  useUploadCertificateAuthorityMutation,
  useAddSubCertificateAuthorityMutation,
  useEditCertificateAuthorityMutation,
  useUploadCaPrivateKeyMutation,
  useDeleteCaPrivateKeyMutation,
  useGenerateCertificateMutation,
  useEditCertificateMutation,
  useLazyDownloadCertificateAuthorityQuery,
  useLazyDownloadCertificateAuthorityChainsQuery,
  useLazyDownloadCertificateQuery,
  useLazyDownloadCertificateChainsQuery,
  useDeleteCertificateAuthorityMutation
} = policyApi
