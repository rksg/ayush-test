/* eslint-disable max-len */
import { FetchBaseQueryError, FetchBaseQueryMeta, QueryReturnValue } from '@reduxjs/toolkit/query'

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
  RoguePolicyRequest,
  RogueApSettingsRequest,
  EthernetPortProfile,
  EthernetPortProfileViewData,
  EthernetPortType
} from '@acx-ui/rc/utils'
import { baseConfigTemplateApi } from '@acx-ui/store'
import { RequestPayload }        from '@acx-ui/types'
import { createHttpRequest }     from '@acx-ui/utils'

import { createDefaultEthPort }      from '../ethernetPortProfile'
import {
  addRoguePolicyFn,
  commonQueryFn,
  updateRoguePolicyFn,
  getVenueRoguePolicyFn,
  updateVenueRoguePolicyFn,
  addSyslogPolicyFn,
  getSyslogPolicyFn,
  transformGetVenueSyslog,
  updateSyslogPolicyFn,
  addAccessControlProfileFn,
  updateAccessControlProfileFn,
  getEnhancedAccessControlProfileListFn,
  getEnhancedL2AclProfileListFn,
  getEnhancedL3AclProfileListFn,
  getEnhancedDeviceProfileListFn,
  getEnhancedApplicationProfileListFn,
  getVLANPoolVenuesFn,
  getVLANPoolPolicyViewModelListFn
} from '../servicePolicy.utils'


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
      query: commonQueryFn(
        PoliciesConfigTemplateUrlsInfo.addL2AclPolicy,
        PoliciesConfigTemplateUrlsInfo.addL2AclPolicyRbac
      ),
      invalidatesTags: [{ type: 'AccessControlTemplate', id: 'LIST' }]
    }),
    getL2AclPolicyTemplate: build.query<l2AclPolicyInfoType, RequestPayload>({
      query: commonQueryFn(
        PoliciesConfigTemplateUrlsInfo.getL2AclPolicy,
        PoliciesConfigTemplateUrlsInfo.getL2AclPolicyRbac
      ),
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
      queryFn: getEnhancedL2AclProfileListFn(true),
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
      query: commonQueryFn(
        PoliciesConfigTemplateUrlsInfo.updateL2AclPolicy,
        PoliciesConfigTemplateUrlsInfo.updateL2AclPolicyRbac
      ),
      invalidatesTags: [{ type: 'AccessControlTemplate', id: 'LIST' }]
    }),
    delL2AclPolicyTemplate: build.mutation<CommonResult, RequestPayload>({
      query: commonQueryFn(
        PoliciesConfigTemplateUrlsInfo.delL2AclPolicy,
        PoliciesConfigTemplateUrlsInfo.delL2AclPolicyRbac
      ),
      invalidatesTags: [{ type: 'AccessControlTemplate', id: 'LIST' }]
    }),
    activateL2AclTemplateOnAccessControlProfile: build.mutation<CommonResult, RequestPayload>({
      query: commonQueryFn(
        PoliciesConfigTemplateUrlsInfo.activateL2AclOnAccessControlProfile
      ),
      invalidatesTags: [{ type: 'AccessControlTemplate', id: 'LIST' }]
    }),
    deactivateL2AclTemplateOnAccessControlProfile: build.mutation<CommonResult, RequestPayload>({
      query: commonQueryFn(
        PoliciesConfigTemplateUrlsInfo.deactivateL2AclOnAccessControlProfile
      ),
      invalidatesTags: [{ type: 'AccessControlTemplate', id: 'LIST' }]
    }),
    activateL2AclTemplateOnWifiNetwork: build.mutation<CommonResult, RequestPayload>({
      query: commonQueryFn(
        PoliciesConfigTemplateUrlsInfo.activateL2AclOnWifiNetwork
      )
    }),
    deactivateL2AclTemplateOnWifiNetwork: build.mutation<CommonResult, RequestPayload>({
      query: commonQueryFn(
        PoliciesConfigTemplateUrlsInfo.deactivateL2AclOnWifiNetwork
      )
    }),
    addL3AclPolicyTemplate: build.mutation<CommonResult, RequestPayload>({
      query: commonQueryFn(
        PoliciesConfigTemplateUrlsInfo.addL3AclPolicy,
        PoliciesConfigTemplateUrlsInfo.addL3AclPolicyRbac
      ),
      invalidatesTags: [{ type: 'AccessControlTemplate', id: 'LIST' }]
    }),
    getL3AclPolicyTemplate: build.query<l3AclPolicyInfoType, RequestPayload>({
      query: commonQueryFn(
        PoliciesConfigTemplateUrlsInfo.getL3AclPolicy,
        PoliciesConfigTemplateUrlsInfo.getL3AclPolicyRbac
      ),
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
      queryFn: getEnhancedL3AclProfileListFn(true),
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
      query: commonQueryFn(
        PoliciesConfigTemplateUrlsInfo.updateL3AclPolicy,
        PoliciesConfigTemplateUrlsInfo.updateL3AclPolicyRbac
      ),
      invalidatesTags: [{ type: 'AccessControlTemplate', id: 'LIST' }]
    }),
    delL3AclPolicyTemplate: build.mutation<CommonResult, RequestPayload>({
      query: commonQueryFn(
        PoliciesConfigTemplateUrlsInfo.delL3AclPolicy,
        PoliciesConfigTemplateUrlsInfo.delL3AclPolicyRbac
      ),
      invalidatesTags: [{ type: 'AccessControlTemplate', id: 'LIST' }]
    }),
    activateL3AclTemplateOnAccessControlProfile: build.mutation<CommonResult, RequestPayload>({
      query: commonQueryFn(
        PoliciesConfigTemplateUrlsInfo.activateL3AclOnAccessControlProfile
      ),
      invalidatesTags: [{ type: 'AccessControlTemplate', id: 'LIST' }]
    }),
    deactivateL3AclTemplateOnAccessControlProfile: build.mutation<CommonResult, RequestPayload>({
      query: commonQueryFn(
        PoliciesConfigTemplateUrlsInfo.deactivateL3AclOnAccessControlProfile
      ),
      invalidatesTags: [{ type: 'AccessControlTemplate', id: 'LIST' }]
    }),
    activateL3AclTemplateOnWifiNetwork: build.mutation<CommonResult, RequestPayload>({
      query: commonQueryFn(
        PoliciesConfigTemplateUrlsInfo.activateL3AclOnWifiNetwork
      )
    }),
    deactivateL3AclTemplateOnWifiNetwork: build.mutation<CommonResult, RequestPayload>({
      query: commonQueryFn(
        PoliciesConfigTemplateUrlsInfo.deactivateL3AclOnWifiNetwork
      )
    }),
    addAccessControlProfileTemplate: build.mutation<CommonResult, RequestPayload>({
      queryFn: addAccessControlProfileFn(true),
      invalidatesTags: [{ type: 'AccessControlTemplate', id: 'LIST' }]
    }),
    getAccessControlProfileTemplate: build.query<AccessControlInfoType, RequestPayload>({
      query: commonQueryFn(PoliciesConfigTemplateUrlsInfo.getAccessControlProfile, PoliciesConfigTemplateUrlsInfo.getAccessControlProfileRbac),
      providesTags: [{ type: 'AccessControlTemplate', id: 'DETAIL' }]
    }),
    getAccessControlProfileTemplateList: build.query<TableResult<AccessControlInfoType>, RequestPayload>({
      queryFn: getEnhancedAccessControlProfileListFn(true),
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
      queryFn: updateAccessControlProfileFn(true),
      invalidatesTags: [{ type: 'AccessControlTemplate', id: 'LIST' }]
    }),
    deleteAccessControlProfileTemplate: build.mutation<CommonResult, RequestPayload>({
      query: commonQueryFn(
        PoliciesConfigTemplateUrlsInfo.deleteAccessControlProfile,
        PoliciesConfigTemplateUrlsInfo.deleteAccessControlProfileRbac
      ),
      invalidatesTags: [{ type: 'AccessControlTemplate', id: 'LIST' }]
    }),
    activateAccessControlProfileTemplateOnWifiNetwork: build.mutation<CommonResult, RequestPayload>({
      query: commonQueryFn(
        PoliciesConfigTemplateUrlsInfo.activateAccessControlProfileOnWifiNetwork
      )
    }),
    deactivateAccessControlProfileTemplateOnWifiNetwork: build.mutation<CommonResult, RequestPayload>({
      query: commonQueryFn(
        PoliciesConfigTemplateUrlsInfo.deactivateAccessControlProfileOnWifiNetwork
      )
    }),
    addDevicePolicyTemplate: build.mutation<CommonResult, RequestPayload>({
      query: commonQueryFn(
        PoliciesConfigTemplateUrlsInfo.addDevicePolicy,
        PoliciesConfigTemplateUrlsInfo.addDevicePolicyRbac
      ),
      invalidatesTags: [{ type: 'AccessControlTemplate', id: 'LIST' }]
    }),
    getDevicePolicyTemplate: build.query<devicePolicyInfoType, RequestPayload>({
      query: commonQueryFn(
        PoliciesConfigTemplateUrlsInfo.getDevicePolicy,
        PoliciesConfigTemplateUrlsInfo.getDevicePolicyRbac
      ),
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
      queryFn: getEnhancedDeviceProfileListFn(true),
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
      query: commonQueryFn(
        PoliciesConfigTemplateUrlsInfo.updateDevicePolicy,
        PoliciesConfigTemplateUrlsInfo.updateDevicePolicyRbac
      ),
      invalidatesTags: [{ type: 'AccessControlTemplate', id: 'LIST' }]
    }),
    delDevicePolicyTemplate: build.mutation<CommonResult, RequestPayload>({
      query: commonQueryFn(
        PoliciesConfigTemplateUrlsInfo.delDevicePolicy,
        PoliciesConfigTemplateUrlsInfo.delDevicePolicyRbac
      ),
      invalidatesTags: [{ type: 'AccessControlTemplate', id: 'LIST' }]
    }),
    activateDeviceTemplateOnAccessControlProfile: build.mutation<CommonResult, RequestPayload>({
      query: commonQueryFn(
        PoliciesConfigTemplateUrlsInfo.activateDevicePolicyOnAccessControlProfile
      ),
      invalidatesTags: [{ type: 'AccessControlTemplate', id: 'LIST' }]
    }),
    deactivateDeviceTemplateOnAccessControlProfile: build.mutation<CommonResult, RequestPayload>({
      query: commonQueryFn(
        PoliciesConfigTemplateUrlsInfo.deactivateDevicePolicyOnAccessControlProfile
      ),
      invalidatesTags: [{ type: 'AccessControlTemplate', id: 'LIST' }]
    }),
    activateDeviceTemplateOnWifiNetwork: build.mutation<CommonResult, RequestPayload>({
      query: commonQueryFn(
        PoliciesConfigTemplateUrlsInfo.activateDevicePolicyOnWifiNetwork
      )
    }),
    deactivateDeviceTemplateOnWifiNetwork: build.mutation<CommonResult, RequestPayload>({
      query: commonQueryFn(
        PoliciesConfigTemplateUrlsInfo.deactivateDevicePolicyOnWifiNetwork
      )
    }),
    addAppPolicyTemplate: build.mutation<CommonResult, RequestPayload>({
      query: commonQueryFn(
        PoliciesConfigTemplateUrlsInfo.addAppPolicy,
        PoliciesConfigTemplateUrlsInfo.addAppPolicyRbac
      ),
      invalidatesTags: [{ type: 'AccessControlTemplate', id: 'LIST' }]
    }),
    getAppPolicyTemplate: build.query<appPolicyInfoType, RequestPayload>({
      query: commonQueryFn(
        PoliciesConfigTemplateUrlsInfo.getAppPolicy,
        PoliciesConfigTemplateUrlsInfo.getAppPolicyRbac
      ),
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
      queryFn: getEnhancedApplicationProfileListFn(true),
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
      query: commonQueryFn(
        PoliciesConfigTemplateUrlsInfo.updateAppAclPolicy,
        PoliciesConfigTemplateUrlsInfo.updateAppAclPolicyRbac
      ),
      invalidatesTags: [{ type: 'AccessControlTemplate', id: 'LIST' }]
    }),
    delAppPolicyTemplate: build.mutation<CommonResult, RequestPayload>({
      query: commonQueryFn(
        PoliciesConfigTemplateUrlsInfo.delAppAclPolicy,
        PoliciesConfigTemplateUrlsInfo.delAppAclPolicyRbac
      ),
      invalidatesTags: [{ type: 'AccessControlTemplate', id: 'LIST' }]
    }),
    activateApplicationPolicyTemplateOnAccessControlProfile: build.mutation<CommonResult, RequestPayload>({
      query: commonQueryFn(
        PoliciesConfigTemplateUrlsInfo.activateApplicationPolicyOnAccessControlProfile
      ),
      invalidatesTags: [{ type: 'AccessControlTemplate', id: 'LIST' }]
    }),
    deactivateApplicationPolicyTemplateOnAccessControlProfile: build.mutation<CommonResult, RequestPayload>({
      query: commonQueryFn(
        PoliciesConfigTemplateUrlsInfo.deactivateApplicationPolicyOnAccessControlProfile
      ),
      invalidatesTags: [{ type: 'AccessControlTemplate', id: 'LIST' }]
    }),
    activateApplicationPolicyTemplateOnWifiNetwork: build.mutation<CommonResult, RequestPayload>({
      query: commonQueryFn(
        PoliciesConfigTemplateUrlsInfo.activateApplicationPolicyOnWifiNetwork
      )
    }),
    deactivateApplicationPolicyTemplateOnWifiNetwork: build.mutation<CommonResult, RequestPayload>({
      query: commonQueryFn(
        PoliciesConfigTemplateUrlsInfo.deactivateApplicationPolicyOnWifiNetwork
      )
    }),
    getEnhancedVlanPoolPolicyTemplateList: build.query<TableResult<VLANPoolViewModelType>,RequestPayload>({
      queryFn: getVLANPoolPolicyViewModelListFn(true),
      providesTags: [{ type: 'VlanPoolTemplate', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, useCasesToRefreshVlanPoolTemplateList, () => {
            api.dispatch(policiesConfigTemplateApi.util.invalidateTags([{ type: 'VlanPoolTemplate', id: 'LIST' }]))
          })
        })
      },
      extraOptions: { maxRetries: 5 }
    }),
    getVlanPoolPolicyTemplateDetail: build.query<VLANPoolPolicyType, RequestPayload>({
      query: commonQueryFn(PoliciesConfigTemplateUrlsInfo.getVlanPoolPolicy, PoliciesConfigTemplateUrlsInfo.getVlanPoolPolicyRbac),
      transformResponse (data: VLANPoolPolicyType) {
        data.vlanMembers = (data.vlanMembers as string[]).join(',')
        return data
      },
      providesTags: [{ type: 'VlanPoolTemplate', id: 'DETAIL' }]
    }),
    addVlanPoolPolicyTemplate: build.mutation<{ response: { [key:string]:string } }, RequestPayload>({
      query: commonQueryFn(PoliciesConfigTemplateUrlsInfo.addVlanPoolPolicy, PoliciesConfigTemplateUrlsInfo.addVlanPoolPolicyRbac),
      invalidatesTags: [{ type: 'VlanPoolTemplate', id: 'LIST' }]
    }),
    updateVlanPoolPolicyTemplate: build.mutation<VLANPoolPolicyType, RequestPayload>({
      query: commonQueryFn(PoliciesConfigTemplateUrlsInfo.updateVlanPoolPolicy, PoliciesConfigTemplateUrlsInfo.updateVlanPoolPolicyRbac),
      invalidatesTags: [{ type: 'VlanPoolTemplate', id: 'LIST' }]
    }),
    delVlanPoolPolicyTemplate: build.mutation<CommonResult, RequestPayload>({
      query: commonQueryFn(PoliciesConfigTemplateUrlsInfo.deleteVlanPoolPolicy, PoliciesConfigTemplateUrlsInfo.deleteVlanPoolPolicyRbac),
      invalidatesTags: [{ type: 'VlanPoolTemplate', id: 'LIST' }]
    }),
    getVlanPoolTemplateVenues: build.query<TableResult<VLANPoolVenues>, RequestPayload>({
      queryFn: getVLANPoolVenuesFn(true),
      providesTags: [{ type: 'VlanPoolTemplate', id: 'LIST' }],
      extraOptions: { maxRetries: 5 }
    }),
    addSyslogPolicyTemplate: build.mutation<CommonResult, RequestPayload>({
      queryFn: addSyslogPolicyFn(true),
      invalidatesTags: [{ type: 'SyslogTemplate', id: 'LIST' }]
    }),
    delSyslogPolicyTemplate: build.mutation<CommonResult, RequestPayload>({
      query: commonQueryFn(PoliciesConfigTemplateUrlsInfo.deleteSyslogPolicy, PoliciesConfigTemplateUrlsInfo.deleteSyslogPolicyRbac),
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
      query: commonQueryFn(PoliciesConfigTemplateUrlsInfo.getSyslogPolicyList, PoliciesConfigTemplateUrlsInfo.querySyslog),
      providesTags: [{ type: 'SyslogTemplate', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, useCasesToRefreshSyslogTemplateList, () => {
            api.dispatch(policiesConfigTemplateApi.util.invalidateTags([{ type: 'SyslogTemplate', id: 'LIST' }]))
          })
        })
      }
    }),
    getVenueTemplateForSyslogPolicy: build.query<TableResult<VenueSyslogPolicyType>, RequestPayload>({
      query: commonQueryFn(ConfigTemplateUrlsInfo.getVenuesTemplateList, ConfigTemplateUrlsInfo.getVenuesTemplateListRbac),
      providesTags: [{ type: 'SyslogTemplate', id: 'VENUE' }],
      extraOptions: { maxRetries: 5 }
    }),
    getVenueTemplateSyslogSettings: build.query<VenueSyslogSettingType, RequestPayload>({
      query: ({ params, enableRbac }) => {
        const url = enableRbac ? PoliciesConfigTemplateUrlsInfo.querySyslog
          : PoliciesConfigTemplateUrlsInfo.getVenueSyslogSettings
        const req = createHttpRequest(url, params)
        return{
          ...req,
          ...enableRbac ? {
            body: JSON.stringify({ filters: { venueIds: [params!.venueId] } }) } : {}
        }
      },
      providesTags: [{ type: 'SyslogTemplate', id: 'VENUE' }],
      transformResponse: transformGetVenueSyslog
    }),
    updateVenueTemplateSyslogSettings: build.mutation<VenueSyslogSettingType, RequestPayload<VenueSyslogSettingType>>({
      query: ({ params, payload, enableTemplateRbac: enableRbac }) => {
        const url = enableRbac ?
          (payload!.enabled ? PoliciesConfigTemplateUrlsInfo.bindVenueSyslog : PoliciesConfigTemplateUrlsInfo.unbindVenueSyslog)
          : PoliciesConfigTemplateUrlsInfo.updateVenueSyslogSettings
        const param = enableRbac ? { ...params, policyId: payload!.serviceProfileId } : params
        const req = createHttpRequest(url, param)
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
      query: commonQueryFn(PoliciesConfigTemplateUrlsInfo.getRoguePolicy, PoliciesConfigTemplateUrlsInfo.getRoguePolicyRbac),
      providesTags: [{ type: 'RogueApTemplate', id: 'DETAIL' }]
    }),
    getRoguePolicyTemplateList: build.query<TableResult<EnhancedRoguePolicyType>, RequestPayload>({
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
    updateRoguePolicyTemplate: build.mutation<RogueAPDetectionTempType, RequestPayload<RoguePolicyRequest>>({
      queryFn: updateRoguePolicyFn(true),
      invalidatesTags: [{ type: 'RogueApTemplate', id: 'LIST' }]
    }),
    delRoguePolicyTemplate: build.mutation<CommonResult, RequestPayload>({
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
            api.dispatch(venueConfigTemplateApi.util.invalidateTags([{ type: 'VenueTemplate', id: 'LIST' }]))
          })
        })
      }
    }),
    updateVenueRogueApTemplate: build.mutation<VenueRogueAp, RequestPayload<RogueApSettingsRequest>>({
      queryFn: updateVenueRoguePolicyFn(true),
      invalidatesTags: [{ type: 'VenueTemplate', id: 'LIST' }]
    }),
    activateVlanPoolTemplateOnWifiNetwork: build.mutation<CommonResult, RequestPayload>({
      query: commonQueryFn(PoliciesConfigTemplateUrlsInfo.activateVlanPool)
    }),
    deactivateVlanPoolTemplateOnWifiNetwork: build.mutation<CommonResult, RequestPayload>({
      query: commonQueryFn(PoliciesConfigTemplateUrlsInfo.deactivateVlanPool)
    }),
    getEthernetPortProfileTemplateList: build.query<TableResult<EthernetPortProfileViewData>, RequestPayload>({
      query: ({ payload, params }) => {
        const req = createHttpRequest(PoliciesConfigTemplateUrlsInfo.getEthernetPortProfileViewDataList, params)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      providesTags: [{ type: 'EthernetPortProfileTemplate', id: 'LIST' }]
    }),
    getEthernetPortProfilesTemplateWithOverwrites: build.query<TableResult<EthernetPortProfileViewData>, RequestPayload>({
      async queryFn ({ payload, params }, _queryApi, _extraOptions, fetchWithBQ) {
        const tenantId = params?.tenantId ?? ''
        const viewDataReq = createHttpRequest(PoliciesConfigTemplateUrlsInfo.getEthernetPortProfileViewDataList, params)
        const ethListQuery = await fetchWithBQ({ ...viewDataReq, body: JSON.stringify(payload) })
        let ethList = ethListQuery.data as TableResult<EthernetPortProfileViewData>

        // Do a workaround to avoid the default ethPort data doesn't be added (data migrate not completed)
        const ethListData = ethList.data
        const predefinedEthPortData = [] as EthernetPortProfileViewData[]
        if (!ethListData.find(d => d?.isDefault && d?.id.includes('_ACCESS'))) {
          predefinedEthPortData.push(createDefaultEthPort(tenantId, EthernetPortType.ACCESS, true))
        }
        if (!ethListData.find(d => d?.isDefault && d?.id.includes('_TRUNK'))) {
          predefinedEthPortData.push(createDefaultEthPort(tenantId, EthernetPortType.TRUNK, true))
        }

        ethList.data = [
          ...predefinedEthPortData,
          ...ethList.data
        ]

        return ethList.data
          ? { data: ethList }
          : { error: ethListQuery.error as FetchBaseQueryError }
      },
      providesTags: [{ type: 'EthernetPortProfileTemplate', id: 'LIST' }]
    }),
    getEthernetPortProfileTemplateWithRelationsById:
    build.query<EthernetPortProfile | null, RequestPayload>({
      async queryFn ({ payload, params }, _queryApi, _extraOptions, fetchWithBQ) {
        if (!params?.id) return Promise.resolve({ data: null } as QueryReturnValue<
          null,
          FetchBaseQueryError,
          FetchBaseQueryMeta
        >)

        const viewDataReq = createHttpRequest(PoliciesConfigTemplateUrlsInfo.getEthernetPortProfileViewDataList, params)
        const ethListQuery = await fetchWithBQ({ ...viewDataReq, body: JSON.stringify(payload) })
        let ethList = ethListQuery.data as TableResult<EthernetPortProfileViewData>

        const ethernetPortProfile = await fetchWithBQ(
          createHttpRequest(PoliciesConfigTemplateUrlsInfo.getEthernetPortProfile, params)
        )
        const ethernetPortProfileData = ethernetPortProfile.data as EthernetPortProfile

        if (ethernetPortProfileData && ethList.data) {
          ethernetPortProfileData.authRadiusId = ethList.data?.[0]?.authRadiusId
          ethernetPortProfileData.accountingRadiusId = ethList.data?.[0]?.accountingRadiusId
          ethernetPortProfileData.apSerialNumbers = ethList.data?.[0]?.apSerialNumbers
          ethernetPortProfileData.venueActivations = ethList.data?.[0]?.venueActivations
        }

        return ethernetPortProfileData
          ? { data: ethernetPortProfileData }
          : { error: ethernetPortProfile.error } as QueryReturnValue<
          EthernetPortProfile, FetchBaseQueryError, FetchBaseQueryMeta | undefined>
      },
      providesTags: [{ type: 'EthernetPortProfileTemplate', id: 'DETAIL' }]
    }),
    getEthernetPortProfileTemplate: build.query<EthernetPortProfile, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(PoliciesConfigTemplateUrlsInfo.getEthernetPortProfile, params)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'EthernetPortProfileTemplate', id: 'DETAIL' }]
    }),
    addEthernetPortProfileTemplate: build.mutation<CommonResult, RequestPayload>({
      query: ({ payload }) => {
        const req = createHttpRequest(PoliciesConfigTemplateUrlsInfo.createEthernetPortProfile)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'EthernetPortProfileTemplate', id: 'LIST' }]
    }),
    updateEthernetPortProfileTemplate: build.mutation<EthernetPortProfile, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(PoliciesConfigTemplateUrlsInfo.updateEthernetPortProfile, params)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'EthernetPortProfileTemplate', id: 'LIST' }]
    }),
    delEthernetPortProfileTemplate: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(PoliciesConfigTemplateUrlsInfo.deleteEthernetPortProfile, params)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'EthernetPortProfileTemplate', id: 'LIST' }]
    })
  })
})

export const {
  useAddL2AclPolicyTemplateMutation,
  useGetL2AclPolicyTemplateQuery,
  useGetL2AclPolicyTemplateListQuery,
  useUpdateL2AclPolicyTemplateMutation,
  useDelL2AclPolicyTemplateMutation,
  useActivateL2AclTemplateOnAccessControlProfileMutation,
  useDeactivateL2AclTemplateOnAccessControlProfileMutation,
  useActivateL2AclTemplateOnWifiNetworkMutation,
  useDeactivateL2AclTemplateOnWifiNetworkMutation,
  useAddL3AclPolicyTemplateMutation,
  useGetL3AclPolicyTemplateQuery,
  useGetL3AclPolicyTemplateListQuery,
  useDelL3AclPolicyTemplateMutation,
  useUpdateL3AclPolicyTemplateMutation,
  useActivateL3AclTemplateOnAccessControlProfileMutation,
  useDeactivateL3AclTemplateOnAccessControlProfileMutation,
  useActivateL3AclTemplateOnWifiNetworkMutation,
  useDeactivateL3AclTemplateOnWifiNetworkMutation,
  useAddAccessControlProfileTemplateMutation,
  useUpdateAccessControlProfileTemplateMutation,
  useDeleteAccessControlProfileTemplateMutation,
  useGetAccessControlProfileTemplateQuery,
  useGetAccessControlProfileTemplateListQuery,
  useActivateAccessControlProfileTemplateOnWifiNetworkMutation,
  useDeactivateAccessControlProfileTemplateOnWifiNetworkMutation,
  useAddDevicePolicyTemplateMutation,
  useGetDevicePolicyTemplateQuery,
  useGetDevicePolicyTemplateListQuery,
  useDelDevicePolicyTemplateMutation,
  useUpdateDevicePolicyTemplateMutation,
  useActivateDeviceTemplateOnAccessControlProfileMutation,
  useDeactivateDeviceTemplateOnAccessControlProfileMutation,
  useActivateDeviceTemplateOnWifiNetworkMutation,
  useDeactivateDeviceTemplateOnWifiNetworkMutation,
  useAddAppPolicyTemplateMutation,
  useGetAppPolicyTemplateQuery,
  useGetAppPolicyTemplateListQuery,
  useUpdateAppPolicyTemplateMutation,
  useDelAppPolicyTemplateMutation,
  useActivateApplicationPolicyTemplateOnAccessControlProfileMutation,
  useDeactivateApplicationPolicyTemplateOnAccessControlProfileMutation,
  useActivateApplicationPolicyTemplateOnWifiNetworkMutation,
  useDeactivateApplicationPolicyTemplateOnWifiNetworkMutation,
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
  useUpdateVenueRogueApTemplateMutation,
  useActivateVlanPoolTemplateOnWifiNetworkMutation,
  useDeactivateVlanPoolTemplateOnWifiNetworkMutation,
  useGetEthernetPortProfileTemplateListQuery,
  useGetEthernetPortProfilesTemplateWithOverwritesQuery,
  useGetEthernetPortProfileTemplateWithRelationsByIdQuery,
  useGetEthernetPortProfileTemplateQuery,
  useAddEthernetPortProfileTemplateMutation,
  useUpdateEthernetPortProfileTemplateMutation,
  useDelEthernetPortProfileTemplateMutation
} = policiesConfigTemplateApi
