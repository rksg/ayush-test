import {
  createApi,
  fetchBaseQuery
} from '@reduxjs/toolkit/query/react'
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
  VenueSyslogPolicyType,
  VenueSyslogSettingType,
  VenueRoguePolicyType,
  VLANPoolPolicyType, VlanPoolUrls, VLANPoolVenues,
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
  ClientIsolationListUsageByVenue, VenueUsageByClientIsolation, AAAPolicyNetwork,
  ApSnmpUrls, ApSnmpProfile, VenueApSnmpSettings,
  ApSnmpSettings, ApSnmpApUsage, ApSnmpViewModelData
} from '@acx-ui/rc/utils'

const RKS_NEW_UI = {
  'x-rks-new-ui': true
}



export const basePolicyApi = createApi({
  baseQuery: fetchBaseQuery(),
  reducerPath: 'policyApi',
  tagTypes: ['Venue', 'Policy', 'MacRegistrationPool', 'MacRegistration', 'ClientIsolation', 'Ap'],
  refetchOnMountOrArgChange: true,
  endpoints: () => ({ })
})

export const policyApi = basePolicyApi.injectEndpoints({
  endpoints: (build) => ({
    addRoguePolicy: build.mutation<RogueAPDetectionContextType, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(RogueApUrls.addRoguePolicy, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Policy', id: 'LIST' }]
    }),
    delRoguePolicy: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(RogueApUrls.deleteRogueApPolicy, params)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'Policy', id: 'LIST' }]
    }),
    addL2AclPolicy: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(AccessControlUrls.addL2AclPolicy, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Policy', id: 'LIST' }]
    }),
    getL2AclPolicy: build.query<l2AclPolicyInfoType, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(AccessControlUrls.getL2AclPolicy, params)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'Policy', id: 'DETAIL' }]
    }),
    delL2AclPolicy: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(AccessControlUrls.delL2AclPolicy, params)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'Policy', id: 'LIST' }]
    }),
    addL3AclPolicy: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(AccessControlUrls.addL3AclPolicy, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Policy', id: 'LIST' }]
    }),
    delL3AclPolicy: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(AccessControlUrls.delL3AclPolicy, params)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'Policy', id: 'LIST' }]
    }),
    addAccessControlProfile: build.mutation<AccessControlInfoType, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(AccessControlUrls.addAccessControlProfile, params, RKS_NEW_UI)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Policy', id: 'LIST' }]
    }),
    updateAccessControlProfile: build.mutation<AccessControlInfoType, RequestPayload>({
      query: ({ params, payload }) => {
        // eslint-disable-next-line max-len
        const req = createHttpRequest(AccessControlUrls.updateAccessControlProfile, params, RKS_NEW_UI)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Policy', id: 'LIST' }]
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
      invalidatesTags: [{ type: 'Policy', id: 'LIST' }]
    }),
    getAccessControlProfile: build.query<AccessControlInfoType, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(AccessControlUrls.getAccessControlProfile, params, RKS_NEW_UI)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'Policy', id: 'DETAIL' }]
    }),
    getL3AclPolicy: build.query<l3AclPolicyInfoType, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(AccessControlUrls.getL3AclPolicy, params)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'Policy', id: 'DETAIL' }]
    }),
    addDevicePolicy: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(AccessControlUrls.addDevicePolicy, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Policy', id: 'LIST' }]
    }),
    getDevicePolicy: build.query<devicePolicyInfoType, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(AccessControlUrls.getDevicePolicy, params)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'Policy', id: 'DETAIL' }]
    }),
    delDevicePolicy: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(AccessControlUrls.delDevicePolicy, params)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'Policy', id: 'LIST' }]
    }),
    addAppPolicy: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(AccessControlUrls.addAppPolicy, params, RKS_NEW_UI)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Policy', id: 'LIST' }]
    }),
    getAppPolicy: build.query<appPolicyInfoType, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(AccessControlUrls.getAppPolicy, params, RKS_NEW_UI)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'Policy', id: 'DETAIL' }]
    }),
    delAppPolicy: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(AccessControlUrls.delDevicePolicy, params)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'Policy', id: 'LIST' }]
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
      providesTags: [{ type: 'Policy', id: 'LIST' }],
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
              { type: 'Policy', id: 'LIST' }
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
      providesTags: [{ type: 'Policy', id: 'DETAIL' }]
    }),
    getAccessControlProfileList: build.query<AccessControlInfoType[], RequestPayload>({
      query: ({ params }) => {
        // eslint-disable-next-line max-len
        const req = createHttpRequest(AccessControlUrls.getAccessControlProfileList, params, RKS_NEW_UI)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'Policy', id: 'DETAIL' }]
    }),
    delRoguePolicies: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(RogueApUrls.deleteRogueApPolicies, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Policy', id: 'LIST' }]
    }),
    roguePolicy: build.query<RogueAPDetectionContextType, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(RogueApUrls.getRoguePolicy, params)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'Policy', id: 'DETAIL' }]
    }),
    updateRoguePolicy: build.mutation<RogueAPDetectionTempType, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(RogueApUrls.updateRoguePolicy, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Policy', id: 'LIST' }]
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
            'AddClientIsolationAllowlist',
            'UpdateClientIsolationAllowlist',
            'DeleteClientIsolationAllowlist'
          ], () => {
            api.dispatch(policyApi.util.invalidateTags([{ type: 'Policy', id: 'LIST' }]))
          })
        })
      }
    }),
    addAAAPolicy: build.mutation<{ response: { [key:string]:string } }, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(AaaUrls.addAAAPolicy, params, RKS_NEW_UI)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Policy', id: 'LIST' }]
    }),
    deleteAAAPolicy: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(AaaUrls.deleteAAAPolicy, params, RKS_NEW_UI)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'Policy', id: 'LIST' }]
    }),
    getAAAPolicyList: build.query<AAATempType[], RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(AaaUrls.getAAAPolicyList, params, RKS_NEW_UI)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'Policy', id: 'DETAIL' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, [
            'Add AAA Policy Profile',
            'Update AAA Policy Profile'
          ], () => {
            api.dispatch(policyApi.util.invalidateTags([{ type: 'Policy', id: 'LIST' }]))
          })
        })
      }
    }),
    aaaPolicy: build.query<AAAPolicyType, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(AaaUrls.getAAAPolicy, params, RKS_NEW_UI)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'Policy', id: 'DETAIL' }]
    }),
    updateAAAPolicy: build.mutation<AAAPolicyType, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(AaaUrls.updateAAAPolicy, params, RKS_NEW_UI)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Policy', id: 'LIST' }]
    }),
    aaaNetworkInstances: build.query<TableResult<AAAPolicyNetwork>, RequestPayload>({
      query: ({ params, payload }) => {
        const instancesRes = createHttpRequest(AaaUrls.getAAANetworkInstances, params, RKS_NEW_UI)
        return {
          ...instancesRes,
          body: payload
        }
      },
      providesTags: [{ type: 'Policy', id: 'LIST' }]
    }),
    getAAAProfileDetail: build.query<AAAPolicyType | undefined, RequestPayload>({
      query: ({ params }) => {
        const aaaDetailReq = createHttpRequest(AaaUrls.getAAAProfileDetail, params, RKS_NEW_UI)
        return {
          ...aaaDetailReq
        }
      },
      providesTags: [{ type: 'Policy', id: 'LIST' }]
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
      providesTags: [{ type: 'Policy', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const params = requestArgs.params as { requestId: string }
          if (params.requestId) {
            onActivityMessageReceived(msg, [
              'Add Layer 2 Policy Profile'
            ],() => {
              api.dispatch(policyApi.util.invalidateTags([{ type: 'Policy', id: 'LIST' }]))
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
      providesTags: [{ type: 'Policy', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const params = requestArgs.params as { requestId: string }
          if (params.requestId) {
            onActivityMessageReceived(msg, [
              'Add Layer 3 Policy Profile'
            ],() => {
              api.dispatch(policyApi.util.invalidateTags([{ type: 'Policy', id: 'LIST' }]))
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
      providesTags: [{ type: 'Policy', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const params = requestArgs.params as { requestId: string }
          if (params.requestId) {
            onActivityMessageReceived(msg, [
              'Add Application Policy Profile'
            ],() => {
              api.dispatch(policyApi.util.invalidateTags([{ type: 'Policy', id: 'LIST' }]))
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
      providesTags: [{ type: 'Policy', id: 'LIST' }]
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
          onActivityMessageReceived(msg, [
            'Add Client Isolation Policy Profile',
            'Update Client Isolation Policy Profile'
          ], () => {
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
    getVLANPoolPolicyList: build.query<VLANPoolPolicyType[], RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(VlanPoolUrls.getVLANPoolPolicyList, params, RKS_NEW_UI)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'Policy', id: 'LIST' }]
    }),
    getVLANPoolPolicyDetail: build.query<VLANPoolPolicyType, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(VlanPoolUrls.getVLANPoolPolicy, params, RKS_NEW_UI)
        return {
          ...req
        }
      },
      transformResponse (data: VLANPoolPolicyType) {
        data.vlanMembers = (data.vlanMembers as string[]).join(',')
        return data
      },
      providesTags: [{ type: 'Policy', id: 'DETAIL' }]
    }),
    addVLANPoolPolicy: build.mutation<{ response: { [key:string]:string } }, RequestPayload>({
      query: ({ params, payload }:{ params:Params<string>, payload:VLANPoolPolicyType }) => {
        const req = createHttpRequest(VlanPoolUrls.addVLANPoolPolicy, params, RKS_NEW_UI)
        return {
          ...req,
          body: {
            ...payload,
            vlanMembers: (payload.vlanMembers as string).split(',')
          }
        }
      },
      invalidatesTags: [{ type: 'Policy', id: 'LIST' }]
    }),
    updateVLANPoolPolicy: build.mutation<VLANPoolPolicyType, RequestPayload>({
      query: ({ params, payload }:{ params:Params<string>, payload:VLANPoolPolicyType }) => {
        const req = createHttpRequest(VlanPoolUrls.updateVLANPoolPolicy, params, RKS_NEW_UI)
        return {
          ...req,
          body: {
            ...payload,
            vlanMembers: (payload.vlanMembers as string).split(',')
          }
        }
      },
      invalidatesTags: [{ type: 'Policy', id: 'LIST' }]
    }),
    delVLANPoolPolicy: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(VlanPoolUrls.deleteVLANPoolPolicy, params, RKS_NEW_UI)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'Policy', id: 'LIST' }]
    }),
    getVLANPoolVenues: build.query<TableResult<VLANPoolVenues>, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(VlanPoolUrls.getVLANPoolVenues, params, RKS_NEW_UI)
        return {
          ...req,
          body: payload
        }
      },
      providesTags: [{ type: 'Policy', id: 'LIST' }]
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
      invalidatesTags: [{ type: 'Policy', id: 'LIST' }]
    }),
    delSyslogPolicy: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(SyslogUrls.deleteSyslogPolicy, params)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'Policy', id: 'LIST' }]
    }),
    updateSyslogPolicy: build.mutation<SyslogContextType, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(SyslogUrls.updateSyslogPolicy, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Policy', id: 'LIST' }]
    }),
    venueSyslogPolicy: build.query<TableResult<VenueSyslogPolicyType>, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(SyslogUrls.getVenueSyslogList, params)
        return {
          ...req,
          body: payload
        }
      },
      providesTags: [{ type: 'Policy', id: 'DETAIL' }]
    }),
    getSyslogPolicy: build.query<SyslogPolicyDetailType, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(SyslogUrls.getSyslogPolicy, params)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'Policy', id: 'DETAIL' }]
    }),
    getVenueSyslogAp: build.query<VenueSyslogSettingType, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(SyslogUrls.getVenueSyslogAp, params)
        return{
          ...req
        }
      },
      providesTags: [{ type: 'Venue', id: 'Syslog' }]
    }),
    updateVenueSyslogAp: build.mutation<VenueSyslogSettingType, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(SyslogUrls.updateVenueSyslogAp, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Venue', id: 'Syslog' }]
    }),
    getSyslogPolicyList: build.query<SyslogPolicyDetailType[], RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(SyslogUrls.getSyslogPolicyList, params)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'Policy', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, [
            'Add Syslog Policy Profile',
            'Update Syslog Policy Profile'
          ], () => {
            api.dispatch(policyApi.util.invalidateTags([{ type: 'Policy', id: 'LIST' }]))
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
      providesTags: [{ type: 'Policy', id: 'LIST' }]
    }),
    getApSnmpPolicyList: build.query<ApSnmpProfile[], RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(ApSnmpUrls.getApSnmpPolicyList, params, RKS_NEW_UI)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'Policy', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, [
            'Add AP SNMP agent Profile',
            'Update AP SNMP agent Profile'
          ], () => {
            api.dispatch(policyApi.util.invalidateTags([{ type: 'Policy', id: 'LIST' }]))
          })
        })
      }
    }),
    getApSnmpPolicy: build.query<ApSnmpProfile, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(ApSnmpUrls.getApSnmpPolicy, params, RKS_NEW_UI)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'Policy', id: 'LIST' }]
    }),
    addApSnmpPolicy: build.mutation<ApSnmpProfile, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(ApSnmpUrls.addApSnmpPolicy, params, RKS_NEW_UI)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Policy', id: 'LIST' }]
    }),
    updateApSnmpPolicy: build.mutation<ApSnmpProfile, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(ApSnmpUrls.updateApSnmpPolicy, params, RKS_NEW_UI)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Policy', id: 'LIST' }]
    }),
    deleteApSnmpPolicy: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(ApSnmpUrls.deleteApSnmpPolicy, params, RKS_NEW_UI)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'Policy', id: 'LIST' }]
    }),
    deleteApSnmpPolicies: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(ApSnmpUrls.deleteApSnmpPolicies, params, RKS_NEW_UI)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'Policy', id: 'LIST' }]
    }),
    getApUsageByApSnmp: build.query<TableResult<ApSnmpApUsage>, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(ApSnmpUrls.getApUsageByApSnmpProfile, params, RKS_NEW_UI)
        return {
          ...req,
          body: payload
        }
      },
      providesTags: [{ type: 'Policy', id: 'LIST' }]
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
        { type: 'Policy', id: 'LIST' },
        { type: 'Venue', id: 'SNMP' },
        { type: 'Ap', id: 'SNMP' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, [
            'Add AP SNMP agent Profile',
            'Update AP SNMP agent Profile'
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
      providesTags: [{ type: 'Venue', id: 'SNMP' }]
    }),
    updateVenueApSnmpSettings: build.mutation<VenueApSnmpSettings, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(ApSnmpUrls.updateVenueApSnmpSettings, params, RKS_NEW_UI)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Venue', id: 'SNMP' }]
    }),
    getApSnmpSettings: build.query<ApSnmpSettings, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(ApSnmpUrls.getApSnmpSettings, params, RKS_NEW_UI)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'Ap', id: 'SNMP' }]
    }),
    updateApSnmpSettings: build.mutation<ApSnmpSettings, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(ApSnmpUrls.updateApSnmpSettings, params, RKS_NEW_UI)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Ap', id: 'SNMP' }]
    }),
    resetApSnmpSettings: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(ApSnmpUrls.deleteApSnmpPolicy, params, RKS_NEW_UI)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'Ap', id: 'SNMP' }]
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
  useAddAppPolicyMutation,
  useGetAppPolicyQuery,
  useDelAppPolicyMutation,
  useAddL3AclPolicyMutation,
  useGetL3AclPolicyQuery,
  useDelL3AclPolicyMutation,
  useAddAccessControlProfileMutation,
  useUpdateAccessControlProfileMutation,
  useDeleteAccessControlProfileMutation,
  useGetAccessControlProfileQuery,
  useL2AclPolicyListQuery,
  useL3AclPolicyListQuery,
  useAddDevicePolicyMutation,
  useGetDevicePolicyQuery,
  useDelDevicePolicyMutation,
  useDevicePolicyListQuery,
  useAppPolicyListQuery,
  useGetRoguePolicyListQuery,
  useGetAccessControlProfileListQuery,
  useUpdateRoguePolicyMutation,
  useRoguePolicyQuery,
  useVenueRoguePolicyQuery,
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
  useGetVLANPoolPolicyListQuery,
  useVlanPoolListQuery,
  useGetVLANPoolPolicyDetailQuery,
  useGetVLANPoolVenuesQuery,
  useAddClientIsolationMutation,
  useDeleteClientIsolationMutation,
  useGetClientIsolationListQuery,
  useLazyGetClientIsolationListQuery,
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
  useGetApSnmpPolicyListQuery,
  useGetApSnmpPolicyQuery,
  useAddApSnmpPolicyMutation,
  useUpdateApSnmpPolicyMutation,
  useDeleteApSnmpPolicyMutation,
  useDeleteApSnmpPoliciesMutation,
  useGetApUsageByApSnmpQuery,
  useGetApSnmpViewModelQuery,
  useGetVenueApSnmpSettingsQuery,
  useUpdateVenueApSnmpSettingsMutation,
  useGetApSnmpSettingsQuery,
  useUpdateApSnmpSettingsMutation,
  useResetApSnmpSettingsMutation
} = policyApi
