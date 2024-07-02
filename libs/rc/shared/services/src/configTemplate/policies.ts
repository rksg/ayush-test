import {
  CommonResult,
  onActivityMessageReceived,
  onSocketActivityChanged,
  l2AclPolicyInfoType,
  AccessControlInfoType,
  l3AclPolicyInfoType,
  devicePolicyInfoType,
  appPolicyInfoType,
  DevicePolicy,
  PoliciesConfigTemplateUrlsInfo,
  L2AclPolicy,
  L3AclPolicy,
  ApplicationPolicy,
  TableResult,
  VLANPoolPolicyType,
  VLANPoolVenues,
  SyslogPolicyDetailType,
  VenueSyslogPolicyType,
  ConfigTemplateUrlsInfo,
  SyslogPolicyListType,
  RogueAPDetectionContextType,
  EnhancedRoguePolicyType,
  RogueAPDetectionTempType,
  VenueRoguePolicyType,
  VenueRogueAp,
  VenueSyslogSettingType,
  VLANPoolViewModelType,
  ApiVersionEnum,
  GetApiVersionHeader,
  RoguePolicyRequest,
  RogueApSettingsRequest
} from '@acx-ui/rc/utils'
import { baseConfigTemplateApi } from '@acx-ui/store'
import { RequestPayload }        from '@acx-ui/types'
import { createHttpRequest }     from '@acx-ui/utils'

import { addRoguePolicyFn, commonQueryFn, updateRoguePolicyFn, getVenueRoguePolicyFn, updateVenueRoguePolicyFn, addSyslogPolicyFn, getSyslogPolicyFn, transformGetVenueSyslog, updateSyslogPolicyFn } from '../servicePolicy.utils'


import { configTemplateApi }             from './common'
import {
  AccessControlTemplateUseCases, ApplicationTemplateUseCases,
  DeviceTemplateUseCases, L2AclTemplateUseCases, L3AclTemplateUseCases,
  useCasesToRefreshSyslogTemplateList,
  useCasesToRefreshVlanPoolTemplateList,
  useCasesToRefreshRogueAPTemplateList
} from './constants'
import { venueConfigTemplateApi } from './venue'

export const policiesConfigTemplateApi = baseConfigTemplateApi.injectEndpoints({
  endpoints: (build) => ({
    addL2AclPolicyTemplate: build.mutation<CommonResult, RequestPayload>({
      query: commonQueryFn(PoliciesConfigTemplateUrlsInfo.addL2AclPolicy),
      invalidatesTags: [{ type: 'AccessControlTemplate', id: 'LIST' }]
    }),
    getL2AclPolicyTemplate: build.query<l2AclPolicyInfoType, RequestPayload>({
      query: commonQueryFn(PoliciesConfigTemplateUrlsInfo.getL2AclPolicy),
      providesTags: [{ type: 'AccessControlTemplate', id: 'DETAIL' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, L2AclTemplateUseCases, () => {
            api.dispatch(policiesConfigTemplateApi.util.invalidateTags([
              { type: 'AccessControlTemplate', id: 'DETAIL' }
            ]))
          })
        })
      }
    }),
    getL2AclPolicyTemplateList: build.query<TableResult<L2AclPolicy>, RequestPayload>({
      query: commonQueryFn(PoliciesConfigTemplateUrlsInfo.getEnhancedL2AclPolicies),
      providesTags: [{ type: 'AccessControlTemplate', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, L2AclTemplateUseCases, () => {
            api.dispatch(configTemplateApi.util.invalidateTags([
              { type: 'AccessControlTemplate', id: 'LIST' }
            ]))
          })
        })
      },
      extraOptions: { maxRetries: 5 }
    }),
    updateL2AclPolicyTemplate: build.mutation<CommonResult, RequestPayload>({
      query: commonQueryFn(PoliciesConfigTemplateUrlsInfo.updateL2AclPolicy),
      invalidatesTags: [{ type: 'AccessControlTemplate', id: 'LIST' }]
    }),
    delL2AclPolicyTemplate: build.mutation<CommonResult, RequestPayload>({
      query: commonQueryFn(PoliciesConfigTemplateUrlsInfo.delL2AclPolicy),
      invalidatesTags: [{ type: 'AccessControlTemplate', id: 'LIST' }]
    }),
    addL3AclPolicyTemplate: build.mutation<CommonResult, RequestPayload>({
      query: commonQueryFn(PoliciesConfigTemplateUrlsInfo.addL3AclPolicy),
      invalidatesTags: [{ type: 'AccessControlTemplate', id: 'LIST' }]
    }),
    getL3AclPolicyTemplate: build.query<l3AclPolicyInfoType, RequestPayload>({
      query: commonQueryFn(PoliciesConfigTemplateUrlsInfo.getL3AclPolicy),
      providesTags: [{ type: 'AccessControlTemplate', id: 'DETAIL' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, L3AclTemplateUseCases, () => {
            api.dispatch(policiesConfigTemplateApi.util.invalidateTags([
              { type: 'AccessControlTemplate', id: 'DETAIL' }
            ]))
          })
        })
      }
    }),
    getL3AclPolicyTemplateList: build.query<TableResult<L3AclPolicy>, RequestPayload>({
      query: commonQueryFn(PoliciesConfigTemplateUrlsInfo.getEnhancedL3AclPolicies),
      providesTags: [{ type: 'AccessControlTemplate', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, L3AclTemplateUseCases, () => {
            api.dispatch(configTemplateApi.util.invalidateTags([
              { type: 'AccessControlTemplate', id: 'LIST' }
            ]))
          })
        })
      },
      extraOptions: { maxRetries: 5 }
    }),
    updateL3AclPolicyTemplate: build.mutation<CommonResult, RequestPayload>({
      query: commonQueryFn(PoliciesConfigTemplateUrlsInfo.updateL3AclPolicy),
      invalidatesTags: [{ type: 'AccessControlTemplate', id: 'LIST' }]
    }),
    delL3AclPolicyTemplate: build.mutation<CommonResult, RequestPayload>({
      query: commonQueryFn(PoliciesConfigTemplateUrlsInfo.delL3AclPolicy),
      invalidatesTags: [{ type: 'AccessControlTemplate', id: 'LIST' }]
    }),
    addAccessControlProfileTemplate: build.mutation<CommonResult, RequestPayload>({
      query: commonQueryFn(PoliciesConfigTemplateUrlsInfo.addAccessControlProfile),
      invalidatesTags: [{ type: 'AccessControlTemplate', id: 'LIST' }]
    }),
    getAccessControlProfileTemplate: build.query<AccessControlInfoType, RequestPayload>({
      query: commonQueryFn(PoliciesConfigTemplateUrlsInfo.getAccessControlProfile),
      providesTags: [{ type: 'AccessControlTemplate', id: 'DETAIL' }]
    }),
    // eslint-disable-next-line max-len
    getAccessControlProfileTemplateList: build.query<TableResult<AccessControlInfoType>, RequestPayload>({
      query: commonQueryFn(PoliciesConfigTemplateUrlsInfo.getEnhancedAccessControlProfiles),
      providesTags: [{ type: 'AccessControlTemplate', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, AccessControlTemplateUseCases, () => {
            api.dispatch(configTemplateApi.util.invalidateTags([
              { type: 'AccessControlTemplate', id: 'LIST' }
            ]))
          })
        })
      },
      extraOptions: { maxRetries: 5 }
    }),
    updateAccessControlProfileTemplate: build.mutation<CommonResult, RequestPayload>({
      query: commonQueryFn(PoliciesConfigTemplateUrlsInfo.updateAccessControlProfile),
      invalidatesTags: [{ type: 'AccessControlTemplate', id: 'LIST' }]
    }),
    deleteAccessControlProfileTemplate: build.mutation<CommonResult, RequestPayload>({
      query: commonQueryFn(PoliciesConfigTemplateUrlsInfo.deleteAccessControlProfile),
      invalidatesTags: [{ type: 'AccessControlTemplate', id: 'LIST' }]
    }),
    addDevicePolicyTemplate: build.mutation<CommonResult, RequestPayload>({
      query: commonQueryFn(PoliciesConfigTemplateUrlsInfo.addDevicePolicy),
      invalidatesTags: [{ type: 'AccessControlTemplate', id: 'LIST' }]
    }),
    getDevicePolicyTemplate: build.query<devicePolicyInfoType, RequestPayload>({
      query: commonQueryFn(PoliciesConfigTemplateUrlsInfo.getDevicePolicy),
      providesTags: [{ type: 'AccessControlTemplate', id: 'DETAIL' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, DeviceTemplateUseCases, () => {
            api.dispatch(policiesConfigTemplateApi.util.invalidateTags([
              { type: 'AccessControlTemplate', id: 'DETAIL' }
            ]))
          })
        })
      }
    }),
    getDevicePolicyTemplateList: build.query<TableResult<DevicePolicy>, RequestPayload>({
      query: commonQueryFn(PoliciesConfigTemplateUrlsInfo.getEnhancedDevicePolicies),
      providesTags: [{ type: 'AccessControlTemplate', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, DeviceTemplateUseCases, () => {
            api.dispatch(configTemplateApi.util.invalidateTags([
              { type: 'AccessControlTemplate', id: 'LIST' }
            ]))
          })
        })
      },
      extraOptions: { maxRetries: 5 }
    }),
    updateDevicePolicyTemplate: build.mutation<CommonResult, RequestPayload>({
      query: commonQueryFn(PoliciesConfigTemplateUrlsInfo.updateDevicePolicy),
      invalidatesTags: [{ type: 'AccessControlTemplate', id: 'LIST' }]
    }),
    delDevicePolicyTemplate: build.mutation<CommonResult, RequestPayload>({
      query: commonQueryFn(PoliciesConfigTemplateUrlsInfo.delDevicePolicy),
      invalidatesTags: [{ type: 'AccessControlTemplate', id: 'LIST' }]
    }),
    addAppPolicyTemplate: build.mutation<CommonResult, RequestPayload>({
      query: commonQueryFn(PoliciesConfigTemplateUrlsInfo.addAppPolicy),
      invalidatesTags: [{ type: 'AccessControlTemplate', id: 'LIST' }]
    }),
    getAppPolicyTemplate: build.query<appPolicyInfoType, RequestPayload>({
      query: commonQueryFn(PoliciesConfigTemplateUrlsInfo.getAppPolicy),
      providesTags: [{ type: 'AccessControlTemplate', id: 'DETAIL' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, ApplicationTemplateUseCases, () => {
            api.dispatch(policiesConfigTemplateApi.util.invalidateTags([
              { type: 'AccessControlTemplate', id: 'DETAIL' }
            ]))
          })
        })
      }
    }),
    getAppPolicyTemplateList: build.query<TableResult<ApplicationPolicy>, RequestPayload>({
      query: commonQueryFn(PoliciesConfigTemplateUrlsInfo.getEnhancedApplicationPolicies),
      providesTags: [{ type: 'AccessControlTemplate', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, ApplicationTemplateUseCases, () => {
            api.dispatch(configTemplateApi.util.invalidateTags([
              { type: 'AccessControlTemplate', id: 'LIST' }
            ]))
          })
        })
      },
      extraOptions: { maxRetries: 5 }
    }),
    updateAppPolicyTemplate: build.mutation<CommonResult, RequestPayload>({
      query: commonQueryFn(PoliciesConfigTemplateUrlsInfo.updateAppAclPolicy),
      invalidatesTags: [{ type: 'AccessControlTemplate', id: 'LIST' }]
    }),
    delAppPolicyTemplate: build.mutation<CommonResult, RequestPayload>({
      query: commonQueryFn(PoliciesConfigTemplateUrlsInfo.delAppAclPolicy),
      invalidatesTags: [{ type: 'AccessControlTemplate', id: 'LIST' }]
    }),
    // eslint-disable-next-line max-len
    getEnhancedVlanPoolPolicyTemplateList: build.query<TableResult<VLANPoolViewModelType>,RequestPayload>({
      query: commonQueryFn(PoliciesConfigTemplateUrlsInfo.getEnhancedVlanPools),
      providesTags: [{ type: 'VlanPoolTemplate', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, useCasesToRefreshVlanPoolTemplateList, () => {
            // eslint-disable-next-line max-len
            api.dispatch(policiesConfigTemplateApi.util.invalidateTags([{ type: 'VlanPoolTemplate', id: 'LIST' }]))
          })
        })
      },
      extraOptions: { maxRetries: 5 }
    }),
    getVlanPoolPolicyTemplateDetail: build.query<VLANPoolPolicyType, RequestPayload>({
      query: commonQueryFn(PoliciesConfigTemplateUrlsInfo.getVlanPoolPolicy),
      transformResponse (data: VLANPoolPolicyType) {
        data.vlanMembers = (data.vlanMembers as string[]).join(',')
        return data
      },
      providesTags: [{ type: 'VlanPoolTemplate', id: 'DETAIL' }]
    }),
    // eslint-disable-next-line max-len
    addVlanPoolPolicyTemplate: build.mutation<{ response: { [key:string]:string } }, RequestPayload>({
      query: commonQueryFn(PoliciesConfigTemplateUrlsInfo.addVlanPoolPolicy),
      invalidatesTags: [{ type: 'VlanPoolTemplate', id: 'LIST' }]
    }),
    updateVlanPoolPolicyTemplate: build.mutation<VLANPoolPolicyType, RequestPayload>({
      query: commonQueryFn(PoliciesConfigTemplateUrlsInfo.updateVlanPoolPolicy),
      invalidatesTags: [{ type: 'VlanPoolTemplate', id: 'LIST' }]
    }),
    delVlanPoolPolicyTemplate: build.mutation<CommonResult, RequestPayload>({
      query: commonQueryFn(PoliciesConfigTemplateUrlsInfo.deleteVlanPoolPolicy),
      invalidatesTags: [{ type: 'VlanPoolTemplate', id: 'LIST' }]
    }),
    getVlanPoolTemplateVenues: build.query<TableResult<VLANPoolVenues>, RequestPayload>({
      query: commonQueryFn(PoliciesConfigTemplateUrlsInfo.getVlanPoolVenues),
      providesTags: [{ type: 'VlanPoolTemplate', id: 'LIST' }],
      extraOptions: { maxRetries: 5 }
    }),
    addSyslogPolicyTemplate: build.mutation<CommonResult, RequestPayload>({
      queryFn: addSyslogPolicyFn(true),
      invalidatesTags: [{ type: 'SyslogTemplate', id: 'LIST' }]
    }),
    delSyslogPolicyTemplate: build.mutation<CommonResult, RequestPayload>({
      // eslint-disable-next-line max-len
      query: commonQueryFn(
        PoliciesConfigTemplateUrlsInfo.deleteSyslogPolicy,
        {
          rbacApiInfo: PoliciesConfigTemplateUrlsInfo.deleteSyslogPolicy,
          rbacApiVersionKey: ApiVersionEnum.v1_1
        }),
      invalidatesTags: [{ type: 'SyslogTemplate', id: 'LIST' }]
    }),
    updateSyslogPolicyTemplate: build.mutation<CommonResult, RequestPayload>({
      queryFn: updateSyslogPolicyFn(true),
      invalidatesTags: [{ type: 'SyslogTemplate', id: 'LIST' }]
    }),
    getSyslogPolicyTemplate: build.query<SyslogPolicyDetailType, RequestPayload>({
      queryFn: getSyslogPolicyFn(true),
      providesTags: [{ type: 'SyslogTemplate', id: 'LIST' }]
    }),
    getSyslogPolicyTemplateList: build.query<TableResult<SyslogPolicyListType>, RequestPayload>({
      query: commonQueryFn(
        PoliciesConfigTemplateUrlsInfo.getSyslogPolicyList,
        {
          rbacApiInfo: PoliciesConfigTemplateUrlsInfo.querySyslog,
          rbacApiVersionKey: ApiVersionEnum.v1
        }),
      providesTags: [{ type: 'SyslogTemplate', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, useCasesToRefreshSyslogTemplateList, () => {
            // eslint-disable-next-line max-len
            api.dispatch(policiesConfigTemplateApi.util.invalidateTags([{ type: 'SyslogTemplate', id: 'LIST' }]))
          })
        })
      }
    }),
    // eslint-disable-next-line max-len
    getVenueTemplateForSyslogPolicy: build.query<TableResult<VenueSyslogPolicyType>, RequestPayload>({
      query: commonQueryFn(ConfigTemplateUrlsInfo.getVenuesTemplateList, {
        rbacApiInfo: ConfigTemplateUrlsInfo.getVenuesTemplateList,
        rbacApiVersionKey: ApiVersionEnum.v1
      }),
      providesTags: [{ type: 'SyslogTemplate', id: 'VENUE' }],
      extraOptions: { maxRetries: 5 }
    }),
    getVenueTemplateSyslogSettings: build.query<VenueSyslogSettingType, RequestPayload>({
      query: ({ params, enableRbac }) => {
        const url = enableRbac ? PoliciesConfigTemplateUrlsInfo.querySyslog
          : PoliciesConfigTemplateUrlsInfo.getVenueSyslogSettings
        const headers = GetApiVersionHeader(enableRbac ? ApiVersionEnum.v1 : undefined)
        const req = createHttpRequest(url, params, headers)
        return{
          ...req,
          ...enableRbac ? {
            body: JSON.stringify({ filters: { venueIds: [params!.venueId] } }) } : {}
        }
      },
      providesTags: [{ type: 'SyslogTemplate', id: 'VENUE' }],
      transformResponse: transformGetVenueSyslog
    }),
    // eslint-disable-next-line max-len
    updateVenueTemplateSyslogSettings: build.mutation<VenueSyslogSettingType, RequestPayload<VenueSyslogSettingType>>({
      query: ({ params, payload, enableTemplateRbac: enableRbac }) => {
        const url = enableRbac ?
          // eslint-disable-next-line max-len
          (payload!.enabled ? PoliciesConfigTemplateUrlsInfo.bindVenueSyslog : PoliciesConfigTemplateUrlsInfo.unbindVenueSyslog)
          : PoliciesConfigTemplateUrlsInfo.updateVenueSyslogSettings
        const headers = GetApiVersionHeader(enableRbac ? ApiVersionEnum.v1 : undefined)
        const param = enableRbac ? { ...params, policyId: payload!.serviceProfileId } : params
        const req = createHttpRequest(url, param, headers)
        return {
          ...req,
          ...(enableRbac ? {} : { body: payload })
        }
      },
      invalidatesTags: [{ type: 'SyslogTemplate', id: 'VENUE' }]
    }),
    addRoguePolicyTemplate: build.mutation<CommonResult, RequestPayload<RoguePolicyRequest>>({
      queryFn: addRoguePolicyFn(true),
      invalidatesTags: [{ type: 'RogueApTemplate', id: 'LIST' }]
    }),
    getRoguePolicyTemplate: build.query<RogueAPDetectionContextType, RequestPayload>({
      // eslint-disable-next-line max-len
      query: commonQueryFn(PoliciesConfigTemplateUrlsInfo.getRoguePolicy, PoliciesConfigTemplateUrlsInfo.getRoguePolicyRbac),
      providesTags: [{ type: 'RogueApTemplate', id: 'DETAIL' }]
    }),
    getRoguePolicyTemplateList: build.query<TableResult<EnhancedRoguePolicyType>, RequestPayload>({
      // eslint-disable-next-line max-len
      query: commonQueryFn(PoliciesConfigTemplateUrlsInfo.getEnhancedRoguePolicyList, PoliciesConfigTemplateUrlsInfo.getRoguePolicyListRbac),
      providesTags: [{ type: 'RogueApTemplate', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, useCasesToRefreshRogueAPTemplateList, () => {
            api.dispatch(configTemplateApi.util.invalidateTags([
              { type: 'RogueApTemplate', id: 'LIST' }
            ]))
          })
        })
      },
      extraOptions: { maxRetries: 5 }
    }),
    // eslint-disable-next-line max-len
    updateRoguePolicyTemplate: build.mutation<RogueAPDetectionTempType, RequestPayload<RoguePolicyRequest>>({
      queryFn: updateRoguePolicyFn(true),
      invalidatesTags: [{ type: 'RogueApTemplate', id: 'LIST' }]
    }),
    delRoguePolicyTemplate: build.mutation<CommonResult, RequestPayload>({
      // eslint-disable-next-line max-len
      query: commonQueryFn(PoliciesConfigTemplateUrlsInfo.deleteRogueApPolicy, PoliciesConfigTemplateUrlsInfo.deleteRoguePolicyRbac),
      invalidatesTags: [{ type: 'RogueApTemplate', id: 'LIST' }]
    }),
    getVenueRoguePolicyTemplate: build.query<TableResult<VenueRoguePolicyType>, RequestPayload>({
      query: commonQueryFn(ConfigTemplateUrlsInfo.getVenuesTemplateList),
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'ActivateRoguePolicyOnVenueTemplate',
            'DeactivateRoguePolicyOnVenueTemplate'
          ]
          onActivityMessageReceived(msg, activities, () => {
            // eslint-disable-next-line max-len
            api.dispatch(venueConfigTemplateApi.util.invalidateTags([{ type: 'VenueTemplate', id: 'LIST' }]))
          })
        })
      },
      providesTags: [{ type: 'RogueApTemplate', id: 'LIST' }, { type: 'VenueTemplate', id: 'LIST' }]
    }),
    getVenueRogueApTemplate: build.query<VenueRogueAp, RequestPayload>({
      queryFn: getVenueRoguePolicyFn(true),
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'UpdateVenueTemplateRogueAp',
            'UpdateVenueTemplateDenialOfServiceProtection'
          ]
          onActivityMessageReceived(msg, activities, () => {
            // eslint-disable-next-line max-len
            api.dispatch(venueConfigTemplateApi.util.invalidateTags([{ type: 'VenueTemplate', id: 'LIST' }]))
          })
        })
      }
    }),
    // eslint-disable-next-line max-len
    updateVenueRogueApTemplate: build.mutation<VenueRogueAp, RequestPayload<RogueApSettingsRequest>>({
      queryFn: updateVenueRoguePolicyFn(true),
      invalidatesTags: [{ type: 'VenueTemplate', id: 'LIST' }]
    })
  })
})

export const {
  useAddL2AclPolicyTemplateMutation,
  useGetL2AclPolicyTemplateQuery,
  useGetL2AclPolicyTemplateListQuery,
  useUpdateL2AclPolicyTemplateMutation,
  useDelL2AclPolicyTemplateMutation,
  useAddL3AclPolicyTemplateMutation,
  useGetL3AclPolicyTemplateQuery,
  useGetL3AclPolicyTemplateListQuery,
  useDelL3AclPolicyTemplateMutation,
  useUpdateL3AclPolicyTemplateMutation,
  useAddAccessControlProfileTemplateMutation,
  useUpdateAccessControlProfileTemplateMutation,
  useDeleteAccessControlProfileTemplateMutation,
  useGetAccessControlProfileTemplateQuery,
  useGetAccessControlProfileTemplateListQuery,
  useAddDevicePolicyTemplateMutation,
  useGetDevicePolicyTemplateQuery,
  useGetDevicePolicyTemplateListQuery,
  useDelDevicePolicyTemplateMutation,
  useUpdateDevicePolicyTemplateMutation,
  useAddAppPolicyTemplateMutation,
  useGetAppPolicyTemplateQuery,
  useGetAppPolicyTemplateListQuery,
  useUpdateAppPolicyTemplateMutation,
  useDelAppPolicyTemplateMutation,
  useGetEnhancedVlanPoolPolicyTemplateListQuery,
  useGetVlanPoolPolicyTemplateDetailQuery,
  useAddVlanPoolPolicyTemplateMutation,
  useUpdateVlanPoolPolicyTemplateMutation,
  useDelVlanPoolPolicyTemplateMutation,
  useGetVlanPoolTemplateVenuesQuery,
  useAddSyslogPolicyTemplateMutation,
  useDelSyslogPolicyTemplateMutation,
  useGetSyslogPolicyTemplateListQuery,
  useGetSyslogPolicyTemplateQuery,
  useUpdateSyslogPolicyTemplateMutation,
  useGetVenueTemplateForSyslogPolicyQuery,
  useGetVenueTemplateSyslogSettingsQuery,
  useUpdateVenueTemplateSyslogSettingsMutation,
  useAddRoguePolicyTemplateMutation,
  useGetRoguePolicyTemplateQuery,
  useGetRoguePolicyTemplateListQuery,
  useUpdateRoguePolicyTemplateMutation,
  useDelRoguePolicyTemplateMutation,
  useGetVenueRoguePolicyTemplateQuery,
  useGetVenueRogueApTemplateQuery,
  useUpdateVenueRogueApTemplateMutation
} = policiesConfigTemplateApi
