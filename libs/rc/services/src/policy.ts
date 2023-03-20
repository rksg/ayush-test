import { Params } from 'react-router-dom'

import {
  createHttpRequest,
  MacRegistration,
  MacRegistrationPool,
  MacRegListUrlsInfo,
  CommonUrlsInfo,
  RequestPayload,
  Policy,
  RogueApUrls,
  RogueAPDetectionContextType,
  RogueAPDetectionTempType,
  SyslogUrls,
  SyslogContextType,
  SyslogPolicyDetailType,
  SyslogPolicyListType,
  VenueSyslogPolicyType,
  VenueSyslogSettingType,
  VenueRoguePolicyType,
  VLANPoolPolicyType, VLANPoolViewModelType, VlanPoolUrls, VLANPoolVenues,
  TableResult,
  onSocketActivityChanged,
  onActivityMessageReceived,
  CommonResult,
  devicePolicyInfoType,
  DevicePolicy,
  NewTableResult,
  transferToTableResult,
  AAAPolicyType,
  AaaUrls,
  AAATempType,
  AAAViewModalType,
  l3AclPolicyInfoType,
  l2AclPolicyInfoType,
  L2AclPolicy,
  L3AclPolicy,
  AvcCategory,
  AvcApp,
  appPolicyInfoType, ApplicationPolicy, AccessControlInfoType,
  VlanPool,
  WifiUrlsInfo,
  AccessControlUrls,
  ClientIsolationSaveData, ClientIsolationUrls,
  createNewTableHttpRequest, TableChangePayload, RequestFormData,
  ClientIsolationListUsageByVenue,
  VenueUsageByClientIsolation,
  AAAPolicyNetwork,
  ClientIsolationViewModel,
  ApSnmpUrls, ApSnmpPolicy, VenueApSnmpSettings,
  ApSnmpSettings, ApSnmpApUsage, ApSnmpViewModelData,
  EnhancedAccessControlInfoType,
  RadiusAttributeGroupUrlsInfo,
  RadiusAttributeGroup,
  RadiusAttribute,
  RadiusAttributeVendor,
  EnhancedRoguePolicyType
} from '@acx-ui/rc/utils'
import { basePolicyApi } from '@acx-ui/store'


const RKS_NEW_UI = {
  'x-rks-new-ui': true
}

const clientIsolationMutationUseCases = [
  'AddClientIsolationAllowlist',
  'UpdateClientIsolationAllowlist',
  'DeleteClientIsolationAllowlist'
]

export const policyApi = basePolicyApi.injectEndpoints({
  endpoints: (build) => ({
    addRoguePolicy: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(RogueApUrls.addRoguePolicy, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'RogueAp', id: 'LIST' }]
    }),
    delRoguePolicy: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(RogueApUrls.deleteRogueApPolicy, params)
        return {
          ...req
        }
      },
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
      providesTags: [{ type: 'AccessControl', id: 'DETAIL' }]
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
    addAccessControlProfile: build.mutation<AccessControlInfoType, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(AccessControlUrls.addAccessControlProfile, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'AccessControl', id: 'LIST' }]
    }),
    updateAccessControlProfile: build.mutation<AccessControlInfoType, RequestPayload>({
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
    deleteAccessControlProfile: build.mutation<AccessControlInfoType, RequestPayload>({
      query: ({ params, payload }) => {
        // eslint-disable-next-line max-len
        const req = createHttpRequest(AccessControlUrls.deleteAccessControlProfile, params, RKS_NEW_UI)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'AccessControl', id: 'LIST' }]
    }),
    getAccessControlProfile: build.query<AccessControlInfoType, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(AccessControlUrls.getAccessControlProfile, params, RKS_NEW_UI)
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
      providesTags: [{ type: 'AccessControl', id: 'DETAIL' }]
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
      providesTags: [{ type: 'AccessControl', id: 'DETAIL' }]
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
        const req = createHttpRequest(AccessControlUrls.addAppPolicy, params, RKS_NEW_UI)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'AccessControl', id: 'LIST' }]
    }),
    getAppPolicy: build.query<appPolicyInfoType, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(AccessControlUrls.getAppPolicy, params, RKS_NEW_UI)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'AccessControl', id: 'DETAIL' }]
    }),
    delAppPolicy: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(AccessControlUrls.delDevicePolicy, params)
        return {
          ...req
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
    devicePolicyList: build.query<TableResult<DevicePolicy>, RequestPayload>({
      query: ({ params, payload }) => {
        const devicePolicyListReq = createHttpRequest(
          AccessControlUrls.getDevicePolicyList,
          params
        )
        return {
          ...devicePolicyListReq,
          body: payload
        }
      },
      providesTags: [{ type: 'AccessControl', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const params = requestArgs.params as { requestId: string }
          onActivityMessageReceived(msg, [
            'Add Device Policy Profile',
            'Update Device Policy Profile',
            'Delete Device Policy Profile',
            'Delete Device Policy Profiles'
          ], () => {
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
            'AddRogueApPolicyProfile'
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
      providesTags: [{ type: 'AccessControl', id: 'DETAIL' }]
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
      providesTags: [{ type: 'AccessControl', id: 'DETAIL' }]
    }),
    getEnhancedL2AclProfileList: build.query<TableResult<L2AclPolicy>, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(AccessControlUrls.getEnhancedL2AclPolicies, params)
        return {
          ...req,
          body: payload
        }
      },
      providesTags: [{ type: 'AccessControl', id: 'DETAIL' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, [
            'AddL2AclPolicy',
            'UpdateL2AclPolicy',
            'DeleteL2AclPolicy',
            'DeleteBulkL2AclPolicies'
          ], () => {
            api.dispatch(policyApi.util.invalidateTags([
              { type: 'AccessControl', id: 'DETAIL' }
            ]))
          })
        })
      }
    }),
    getEnhancedL3AclProfileList: build.query<TableResult<L3AclPolicy>, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(AccessControlUrls.getEnhancedL3AclPolicies, params)
        return {
          ...req,
          body: payload
        }
      },
      providesTags: [{ type: 'AccessControl', id: 'DETAIL' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, [
            'AddL3AclPolicy',
            'UpdateL3AclPolicy',
            'DeleteL3AclPolicy',
            'DeleteBulkL3AclPolicies'
          ], () => {
            api.dispatch(policyApi.util.invalidateTags([
              { type: 'AccessControl', id: 'DETAIL' }
            ]))
          })
        })
      }
    }),
    getEnhancedDeviceProfileList: build.query<TableResult<DevicePolicy>, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(AccessControlUrls.getEnhancedDevicePolicies, params)
        return {
          ...req,
          body: payload
        }
      },
      providesTags: [{ type: 'AccessControl', id: 'DETAIL' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, [
            'AddDevicePolicy',
            'UpdateDevicePolicy',
            'DeleteDevicePolicy',
            'DeleteBulkDevicePolicies'
          ], () => {
            api.dispatch(policyApi.util.invalidateTags([
              { type: 'AccessControl', id: 'DETAIL' }
            ]))
          })
        })
      }
    }),
    getEnhancedApplicationProfileList: build.query<TableResult<ApplicationPolicy>, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(AccessControlUrls.getEnhancedApplicationPolicies, params)
        return {
          ...req,
          body: payload
        }
      },
      providesTags: [{ type: 'AccessControl', id: 'DETAIL' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, [
            'AddApplicationPolicy',
            'UpdateApplicationPolicy',
            'DeleteApplicationPolicy',
            'DeleteBulkApplicationPolicies'
          ], () => {
            api.dispatch(policyApi.util.invalidateTags([
              { type: 'AccessControl', id: 'DETAIL' }
            ]))
          })
        })
      }
    }),
    delRoguePolicies: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(RogueApUrls.deleteRogueApPolicies, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'RogueAp', id: 'LIST' }]
    }),
    roguePolicy: build.query<RogueAPDetectionContextType, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(RogueApUrls.getRoguePolicy, params)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'RogueAp', id: 'DETAIL' }]
    }),
    updateRoguePolicy: build.mutation<RogueAPDetectionTempType, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(RogueApUrls.updateRoguePolicy, params)
        return {
          ...req,
          body: payload
        }
      },
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
      providesTags: [{ type: 'Policy', id: 'DETAIL' }]
    }),
    enhancedRoguePolicies: build.query<TableResult<EnhancedRoguePolicyType>, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(RogueApUrls.getEnhancedRoguePolicyList, params)
        return {
          ...req,
          body: payload
        }
      },
      providesTags: [{ type: 'RogueAp', id: 'LIST' }]
    }),
    policyList: build.query<TableResult<Policy>, RequestPayload>({
      query: ({ params, payload }) => {
        const policyListReq = createHttpRequest(CommonUrlsInfo.getPoliciesList, params)
        return {
          ...policyListReq,
          body: payload
        }
      },
      providesTags: [{ type: 'Policy', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, [
            'AddRogueApPolicyProfile',
            'UpdateRogueApPolicyProfile',
            'DeleteRogueApPolicyProfile',
            'AddVlanPool',
            'UpdateVlanPool',
            'DeleteVlanPool',
            'PatchVlanPool',
            'DeleteVlanPools',
            ...clientIsolationMutationUseCases
          ], () => {
            api.dispatch(policyApi.util.invalidateTags([{ type: 'Policy', id: 'LIST' }]))
          })
        })
      }
    }),
    addAAAPolicy: build.mutation<{ response: { [key:string]:string } }, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(AaaUrls.addAAAPolicy, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'AAA', id: 'LIST' }]
    }),
    deleteAAAPolicy: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(AaaUrls.deleteAAAPolicy, params)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'AAA', id: 'LIST' }]
    }),
    getAAAPolicyList: build.query<TableResult<AAATempType>, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(AaaUrls.getAAAPolicyList, params)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'AAA', id: 'LIST' }],
      transformResponse (result: AAATempType[]) {
        return { data: result, totalCount: result.length, page: 0 }
      },
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, [
            'AddRadius',
            'UpdateRadius',
            'DeleteRadius'
          ], () => {
            api.dispatch(policyApi.util.invalidateTags([{ type: 'AAA', id: 'LIST' }]))
          })
        })
      }
    }),
    getAAAPolicyViewModelList: build.query<TableResult<AAAViewModalType>, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(AaaUrls.getAAAPolicyViewModelList, params)
        return {
          ...req,
          body: payload
        }
      },
      providesTags: [{ type: 'AAA', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, [
            'AddRadius',
            'UpdateRadius',
            'DeleteRadius'
          ], () => {
            api.dispatch(policyApi.util.invalidateTags([{ type: 'AAA', id: 'LIST' }]))
          })
        })
      }
    }),
    aaaPolicy: build.query<AAAPolicyType, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(AaaUrls.getAAAPolicy, params)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'AAA', id: 'DETAIL' }]
    }),
    updateAAAPolicy: build.mutation<AAAPolicyType, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(AaaUrls.updateAAAPolicy, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'AAA', id: 'LIST' }]
    }),
    aaaNetworkInstances: build.query<TableResult<AAAPolicyNetwork>, RequestPayload>({
      query: ({ params, payload }) => {
        const instancesRes = createHttpRequest(AaaUrls.getAAANetworkInstances, params)
        return {
          ...instancesRes,
          body: payload
        }
      },
      providesTags: [{ type: 'AAA', id: 'LIST' }]
    }),
    getAAAProfileDetail: build.query<AAAPolicyType | undefined, RequestPayload>({
      query: ({ params }) => {
        const aaaDetailReq = createHttpRequest(AaaUrls.getAAAProfileDetail, params)
        return {
          ...aaaDetailReq
        }
      },
      providesTags: [{ type: 'AAA', id: 'LIST' }]
    }),
    l2AclPolicyList: build.query<TableResult<L2AclPolicy>, RequestPayload>({
      query: ({ params, payload }) => {
        const l2AclPolicyListReq = createHttpRequest(
          AccessControlUrls.getL2AclPolicyList,
          params
        )
        return {
          ...l2AclPolicyListReq,
          body: payload
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
    l3AclPolicyList: build.query<TableResult<L3AclPolicy>, RequestPayload>({
      query: ({ params, payload }) => {
        const l3AclPolicyListReq = createHttpRequest(
          AccessControlUrls.getL3AclPolicyList,
          params
        )
        return {
          ...l3AclPolicyListReq,
          body: payload
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
    appPolicyList: build.query<TableResult<ApplicationPolicy>, RequestPayload>({
      query: ({ params, payload }) => {
        const appPolicyListReq = createHttpRequest(
          AccessControlUrls.getAppPolicyList,
          params
        )
        return {
          ...appPolicyListReq,
          body: payload
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
          payload: payload as TableChangePayload
        })
        return {
          ...poolsReq
        }
      },
      transformResponse (result: NewTableResult<MacRegistrationPool>) {
        return transferToTableResult<MacRegistrationPool>(result)
      },
      providesTags: [{ type: 'MacRegistrationPool', id: 'LIST' }]
    }),
    macRegistrations: build.query<TableResult<MacRegistration>, RequestPayload>({
      query: ({ params, payload }) => {
        const poolsReq = createNewTableHttpRequest({
          apiInfo: MacRegListUrlsInfo.getMacRegistrations,
          params,
          payload: payload as TableChangePayload
        })
        return {
          ...poolsReq
        }
      },
      transformResponse (result: NewTableResult<MacRegistration>) {
        return transferToTableResult<MacRegistration>(result)
      },
      providesTags: [{ type: 'MacRegistration', id: 'LIST' }]
    }),
    addMacRegList: build.mutation<MacRegistrationPool, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(MacRegListUrlsInfo.createMacRegistrationPool, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'MacRegistrationPool', id: 'LIST' }]
    }),
    updateMacRegList: build.mutation<MacRegistrationPool, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(MacRegListUrlsInfo.updateMacRegistrationPool, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'MacRegistrationPool', id: 'LIST' }]
    }),
    deleteMacRegList: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(MacRegListUrlsInfo.deleteMacRegistrationPool, params)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'MacRegistrationPool', id: 'LIST' }]
    }),
    deleteMacRegistration: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(MacRegListUrlsInfo.deleteMacRegistration, params)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'MacRegistration', id: 'LIST' }]
    }),
    getMacRegList: build.query<MacRegistrationPool, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(MacRegListUrlsInfo.getMacRegistrationPool, params)
        return{
          ...req
        }
      },
      providesTags: [{ type: 'MacRegistrationPool', id: 'DETAIL' }]
    }),
    addMacRegistration: build.mutation<MacRegistration, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(MacRegListUrlsInfo.addMacRegistration, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'MacRegistration', id: 'LIST' }]
    }),
    updateMacRegistration: build.mutation<MacRegistration, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(MacRegListUrlsInfo.updateMacRegistration, params)
        return {
          ...req,
          body: payload
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
    deleteClientIsolation: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(ClientIsolationUrls.deleteClientIsolation, params)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'Policy', id: 'LIST' }]
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
      }
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
    getVLANPoolPolicyViewModelList:
    build.query<TableResult<VLANPoolViewModelType>,RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(WifiUrlsInfo.getVlanPoolViewModelList, params)
        return {
          ...req,
          body: payload
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
            'DeleteVlanPools'
          ], () => {
            api.dispatch(policyApi.util.invalidateTags([{ type: 'VLANPool', id: 'LIST' }]))
          })
        })
      }
    }),
    getVLANPoolPolicyDetail: build.query<VLANPoolPolicyType, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(VlanPoolUrls.getVLANPoolPolicy, params)
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
      query: ({ params, payload }:{ params:Params<string>, payload:VLANPoolPolicyType }) => {
        const req = createHttpRequest(VlanPoolUrls.addVLANPoolPolicy, params)
        return {
          ...req,
          body: {
            ...payload,
            vlanMembers: (payload.vlanMembers as string).split(',')
          }
        }
      },
      invalidatesTags: [{ type: 'VLANPool', id: 'LIST' }]
    }),
    updateVLANPoolPolicy: build.mutation<VLANPoolPolicyType, RequestPayload>({
      query: ({ params, payload }:{ params:Params<string>, payload:VLANPoolPolicyType }) => {
        const req = createHttpRequest(VlanPoolUrls.updateVLANPoolPolicy, params)
        return {
          ...req,
          body: {
            ...payload,
            vlanMembers: (payload.vlanMembers as string).split(',')
          }
        }
      },
      invalidatesTags: [{ type: 'VLANPool', id: 'LIST' }]
    }),
    delVLANPoolPolicy: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(VlanPoolUrls.deleteVLANPoolPolicy, params)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'VLANPool', id: 'LIST' }]
    }),
    getVLANPoolVenues: build.query<TableResult<VLANPoolVenues>, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(VlanPoolUrls.getVLANPoolVenues, params)
        return {
          ...req,
          body: payload
        }
      },
      providesTags: [{ type: 'VLANPool', id: 'LIST' }]
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
      }
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
      }
    }),
    uploadMacRegistration: build.mutation<{}, RequestFormData>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(MacRegListUrlsInfo.addMacRegistration, params, {
          'Content-Type': undefined,
          'Accept': '*/*'
        })
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
    addSyslogPolicy: build.mutation<SyslogContextType, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(SyslogUrls.addSyslogPolicy, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Syslog', id: 'LIST' }]
    }),
    delSyslogPolicy: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(SyslogUrls.deleteSyslogPolicy, params)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'Syslog', id: 'LIST' }]
    }),
    updateSyslogPolicy: build.mutation<SyslogContextType, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(SyslogUrls.updateSyslogPolicy, params)
        return {
          ...req,
          body: payload
        }
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
      providesTags: [{ type: 'Syslog', id: 'VENUE' }]
    }),
    getSyslogPolicy: build.query<SyslogPolicyDetailType, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(SyslogUrls.getSyslogPolicy, params)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'Syslog', id: 'LIST' }]
    }),
    getVenueSyslogAp: build.query<VenueSyslogSettingType, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(SyslogUrls.getVenueSyslogAp, params)
        return{
          ...req
        }
      },
      providesTags: [{ type: 'Syslog', id: 'VENUE' }]
    }),
    updateVenueSyslogAp: build.mutation<VenueSyslogSettingType, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(SyslogUrls.updateVenueSyslogAp, params)
        return {
          ...req,
          body: payload
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
            'UpdateSyslogServerProfile',
            'DeleteSyslogServerProfile'
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
      query: ({ params, payload }) => {
        const req = createHttpRequest(SyslogUrls.syslogPolicyList, params)
        return {
          ...req,
          body: payload
        }
      },
      providesTags: [{ type: 'Syslog', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, [
            'AddSyslogServerProfile',
            'UpdateSyslogServerProfile',
            'DeleteSyslogServerProfile'
          ], () => {
            api.dispatch(policyApi.util.invalidateTags([{ type: 'Syslog', id: 'LIST' }]))
          })
        })
      }
    }),
    getApSnmpPolicyList: build.query<ApSnmpPolicy[], RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(ApSnmpUrls.getApSnmpPolicyList, params, RKS_NEW_UI)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'SnmpAgent', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, [
            'AddApSnmpAgent',
            'UpdateApSnmpAgent',
            'DeleteApSnmpAgentProfile'
          ], () => {
            api.dispatch(policyApi.util.invalidateTags([{ type: 'SnmpAgent', id: 'LIST' }]))
          })
        })
      }
    }),
    getApSnmpPolicy: build.query<ApSnmpPolicy, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(ApSnmpUrls.getApSnmpPolicy, params, RKS_NEW_UI)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'SnmpAgent', id: 'LIST' }]
    }),
    addApSnmpPolicy: build.mutation<{ response: { [key:string]:string } }, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(ApSnmpUrls.addApSnmpPolicy, params, RKS_NEW_UI)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'SnmpAgent', id: 'LIST' }]
    }),
    updateApSnmpPolicy: build.mutation<ApSnmpPolicy, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(ApSnmpUrls.updateApSnmpPolicy, params, RKS_NEW_UI)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'SnmpAgent', id: 'LIST' }]
    }),
    deleteApSnmpPolicy: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(ApSnmpUrls.deleteApSnmpPolicy, params, RKS_NEW_UI)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'SnmpAgent', id: 'LIST' }]
    }),
    deleteApSnmpPolicies: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(ApSnmpUrls.deleteApSnmpPolicies, params, RKS_NEW_UI)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'SnmpAgent', id: 'LIST' }]
    }),
    getApUsageByApSnmp: build.query<TableResult<ApSnmpApUsage>, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(ApSnmpUrls.getApUsageByApSnmpPolicy, params, RKS_NEW_UI)
        return {
          ...req,
          body: payload
        }
      },
      providesTags: [{ type: 'SnmpAgent', id: 'LIST' }]
    }),
    getApSnmpViewModel: build.query<TableResult<ApSnmpViewModelData>, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(ApSnmpUrls.getApSnmpFromViewModel, params, RKS_NEW_UI)
        return {
          ...req,
          body: payload
        }
      },
      providesTags: [
        { type: 'SnmpAgent', id: 'LIST' },
        { type: 'SnmpAgent', id: 'VENUE' },
        { type: 'SnmpAgent', id: 'AP' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, [
            'AddApSnmpAgent',
            'UpdateApSnmpAgent',
            'DeleteApSnmpAgentProfile'
          ], () => {
            api.dispatch(policyApi.util.invalidateTags([{ type: 'Policy', id: 'LIST' }]))
          })
        })
      }
    }),
    getVenueApSnmpSettings: build.query<VenueApSnmpSettings, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(ApSnmpUrls.getVenueApSnmpSettings, params, RKS_NEW_UI)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'SnmpAgent', id: 'VENUE' }]
    }),
    updateVenueApSnmpSettings: build.mutation<VenueApSnmpSettings, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(ApSnmpUrls.updateVenueApSnmpSettings, params, RKS_NEW_UI)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'SnmpAgent', id: 'VENUE' }]
    }),
    getApSnmpSettings: build.query<ApSnmpSettings, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(ApSnmpUrls.getApSnmpSettings, params, RKS_NEW_UI)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'SnmpAgent', id: 'AP' }]
    }),
    updateApSnmpSettings: build.mutation<ApSnmpSettings, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(ApSnmpUrls.updateApSnmpSettings, params, RKS_NEW_UI)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'SnmpAgent', id: 'AP' }]
    }),
    resetApSnmpSettings: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(ApSnmpUrls.resetApSnmpSettings, params, RKS_NEW_UI)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'SnmpAgent', id: 'AP' }]
    }),
    radiusAttributeGroupList: build.query<TableResult<RadiusAttributeGroup>, RequestPayload>({
      query: ({ params, payload }) => {
        // eslint-disable-next-line max-len
        const groupReq = createNewTableHttpRequest({
          apiInfo: RadiusAttributeGroupUrlsInfo.getAttributeGroups,
          params,
          payload: payload as TableChangePayload
        })
        return {
          ...groupReq
        }
      },
      transformResponse (result: NewTableResult<RadiusAttributeGroup>) {
        return transferToTableResult<RadiusAttributeGroup>(result)
      },
      providesTags: [{ type: 'RadiusAttributeGroup', id: 'LIST' }]
    }),
    // eslint-disable-next-line max-len
    radiusAttributeGroupListByQuery: build.query<TableResult<RadiusAttributeGroup>, RequestPayload>({
      query: ({ params, payload }) => {
        // eslint-disable-next-line max-len
        const req = createHttpRequest(RadiusAttributeGroupUrlsInfo.getAttributeGroupsWithQuery, params)
        return {
          ...req,
          body: payload
        }
      }
    }),
    radiusAttributeList: build.query<TableResult<RadiusAttribute>, RequestPayload>({
      query: ({ params }) => {
        // eslint-disable-next-line max-len
        const groupReq = createHttpRequest(
          RadiusAttributeGroupUrlsInfo.getAttributes,
          params
        )
        return {
          ...groupReq
        }
      },
      transformResponse (result: NewTableResult<RadiusAttribute>) {
        return transferToTableResult<RadiusAttribute>(result)
      },
      providesTags: [{ type: 'RadiusAttribute', id: 'LIST' }]
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
    })
  })
})

export const {
  usePolicyListQuery,
  useMacRegListsQuery,
  useDeleteMacRegListMutation,
  useGetMacRegListQuery,
  useMacRegistrationsQuery,
  useDeleteMacRegistrationMutation,
  useAddMacRegistrationMutation,
  useUpdateMacRegistrationMutation,
  useAddMacRegListMutation,
  useUpdateMacRegListMutation,
  useAvcCategoryListQuery,
  useAvcAppListQuery,
  useAddRoguePolicyMutation,
  useDelRoguePolicyMutation,
  useDelRoguePoliciesMutation,
  useAddL2AclPolicyMutation,
  useGetL2AclPolicyQuery,
  useDelL2AclPolicyMutation,
  useUpdateL2AclPolicyMutation,
  useAddAppPolicyMutation,
  useGetAppPolicyQuery,
  useDelAppPolicyMutation,
  useUpdateAppPolicyMutation,
  useAddL3AclPolicyMutation,
  useGetL3AclPolicyQuery,
  useDelL3AclPolicyMutation,
  useUpdateL3AclPolicyMutation,
  useAddAccessControlProfileMutation,
  useUpdateAccessControlProfileMutation,
  useDeleteAccessControlProfileMutation,
  useGetAccessControlProfileQuery,
  useL2AclPolicyListQuery,
  useL3AclPolicyListQuery,
  useAddDevicePolicyMutation,
  useGetDevicePolicyQuery,
  useDelDevicePolicyMutation,
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
  useDeleteAAAPolicyMutation,
  useGetAAAPolicyListQuery,
  useLazyGetAAAPolicyListQuery,
  useUpdateAAAPolicyMutation,
  useAaaPolicyQuery,
  useAaaNetworkInstancesQuery,
  useGetAAAProfileDetailQuery,
  useAddVLANPoolPolicyMutation,
  useDelVLANPoolPolicyMutation,
  useUpdateVLANPoolPolicyMutation,
  useGetVLANPoolPolicyViewModelListQuery,
  useVlanPoolListQuery,
  useGetVLANPoolPolicyDetailQuery,
  useGetVLANPoolVenuesQuery,
  useAddClientIsolationMutation,
  useDeleteClientIsolationMutation,
  useGetClientIsolationListQuery,
  useLazyGetClientIsolationListQuery,
  useGetEnhancedClientIsolationListQuery,
  useGetClientIsolationQuery,
  useUpdateClientIsolationMutation,
  useGetClientIsolationUsageByVenueQuery,
  useGetVenueUsageByClientIsolationQuery,
  useLazyGetMacRegListQuery,
  useUploadMacRegistrationMutation,
  useAddSyslogPolicyMutation,
  useDelSyslogPolicyMutation,
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
  useDeleteApSnmpPoliciesMutation,
  useGetApUsageByApSnmpQuery,
  useGetApSnmpViewModelQuery,
  useGetVenueApSnmpSettingsQuery,
  useLazyGetVenueApSnmpSettingsQuery,
  useUpdateVenueApSnmpSettingsMutation,
  useGetApSnmpSettingsQuery,
  useUpdateApSnmpSettingsMutation,
  useResetApSnmpSettingsMutation,
  useRadiusAttributeGroupListQuery,
  useGetRadiusAttributeGroupQuery,
  useRadiusAttributeListQuery,
  useRadiusAttributeVendorListQuery,
  useRadiusAttributeListWithQueryQuery,
  useLazyRadiusAttributeListWithQueryQuery,
  useRadiusAttributeQuery,
  useDeleteRadiusAttributeGroupMutation,
  useLazyRadiusAttributeGroupListQuery,
  useUpdateRadiusAttributeGroupMutation,
  useAddRadiusAttributeGroupMutation,
  useLazyRadiusAttributeGroupListByQueryQuery
} = policyApi
