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
  SyslogPolicyType,
  VenueRoguePolicyType,
  VLANPoolPolicyType,
  VlanPoolUrls,
  VLANPoolDetailInstances,
  TableResult,
  onSocketActivityChanged,
  onActivityMessageReceived,
  CommonResult,
  NewTableResult,
  transferToTableResult,
  l3AclPolicyInfoType,
  l2AclPolicyInfoType,
  L2AclPolicy,
  AvcApp,
  VlanPool,
  WifiUrlsInfo,
  AccessControlUrls,
  L3AclPolicy,
  AvcCat,
  ClientIsolationSaveData,
  ClientIsolationUrls,
  createNewTableHttpRequest,
  TableChangePayload,
  RequestFormData,
  RadiusAttributeGroupUrlsInfo,
  RadiusAttributeGroup,
  // eslint-disable-next-line max-len
  RadiusAttribute,
  RadiusAttributeVendor,
  AdaptivePolicy,
  RulesManagementUrlsInfo,
  RuleTemplate,
  RuleAttribute,
  AccessCondition
} from '@acx-ui/rc/utils'


export const basePolicyApi = createApi({
  baseQuery: fetchBaseQuery(),
  reducerPath: 'policyApi',
  // eslint-disable-next-line max-len
  tagTypes: ['Policy', 'MacRegistrationPool', 'MacRegistration', 'ClientIsolation', 'RadiusAttributeGroup', 'RadiusAttribute'
    , 'AdaptivePolicy', 'AdaptivePolicySet', 'AdaptivePolicyCondition'],
  refetchOnMountOrArgChange: true,
  endpoints: () => ({ })
})

const RKS_NEW_UI = {
  'x-rks-new-ui': true
}

export const policyApi = basePolicyApi.injectEndpoints({
  endpoints: (build) => ({
    addRoguePolicy: build.mutation<RogueAPDetectionContextType, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(RogueApUrls.addRoguePolicy, params, RKS_NEW_UI)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Policy', id: 'LIST' }]
    }),
    delRoguePolicy: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(RogueApUrls.deleteRogueApPolicy, params, RKS_NEW_UI)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'Policy', id: 'LIST' }]
    }),
    addL2AclPolicy: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(AccessControlUrls.addL2AclPolicy, params, RKS_NEW_UI)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Policy', id: 'LIST' }]
    }),
    getL2AclPolicy: build.query<l2AclPolicyInfoType, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(AccessControlUrls.getL2AclPolicy, params, RKS_NEW_UI)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'Policy', id: 'DETAIL' }]
    }),
    addL3AclPolicy: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(AccessControlUrls.addL3AclPolicy, params, RKS_NEW_UI)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Policy', id: 'LIST' }]
    }),
    getL3AclPolicy: build.query<l3AclPolicyInfoType, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(AccessControlUrls.getL3AclPolicy, params, RKS_NEW_UI)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'Policy', id: 'DETAIL' }]
    }),
    getRoguePolicyList: build.query<RogueAPDetectionTempType[], RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(RogueApUrls.getRoguePolicyList, params, RKS_NEW_UI)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'Policy', id: 'DETAIL' }]
    }),
    delRoguePolicies: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(RogueApUrls.deleteRogueApPolicies, params, RKS_NEW_UI)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Policy', id: 'LIST' }]
    }),
    roguePolicy: build.query<RogueAPDetectionContextType, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(RogueApUrls.getRoguePolicy, params, RKS_NEW_UI)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'Policy', id: 'DETAIL' }]
    }),
    updateRoguePolicy: build.mutation<RogueAPDetectionTempType, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(RogueApUrls.updateRoguePolicy, params, RKS_NEW_UI)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Policy', id: 'LIST' }]
    }),
    venueRoguePolicy: build.query<TableResult<VenueRoguePolicyType>, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(RogueApUrls.getVenueRoguePolicy, params, RKS_NEW_UI)
        return {
          ...req,
          body: payload
        }
      },
      providesTags: [{ type: 'Policy', id: 'DETAIL' }]
    }),
    policyList: build.query<TableResult<Policy>, RequestPayload>({
      query: ({ params, payload }) => {
        const policyListReq = createHttpRequest(CommonUrlsInfo.getPoliciesList, params, RKS_NEW_UI)
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
    addVLANPoolPolicy: build.mutation<{ response: { [key:string]:string } }, RequestPayload>({
      query: ({ params, payload }:{ params:Params<string>, payload:VLANPoolPolicyType }) => {
        const req = createHttpRequest(VlanPoolUrls.addVLANPoolPolicy, params, RKS_NEW_UI)

        return {
          ...req,
          body: {
            ...payload,
            vlanMembers: payload.vlanMembers.split(',')
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
    addClientIsolation: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(ClientIsolationUrls.addClientIsolation, params, RKS_NEW_UI)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Policy', id: 'LIST' }, { type: 'ClientIsolation', id: 'LIST' }]
    }),
    deleteClientIsolation: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(ClientIsolationUrls.deleteClientIsolation, params, RKS_NEW_UI)
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
    getVLANPoolPolicyList: build.query<VLANPoolPolicyType[], RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(VlanPoolUrls.getVLANPoolPolicyList, params, RKS_NEW_UI)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'Policy', id: 'LIST' }]
    }),
    getClientIsolationList: build.query<ClientIsolationSaveData[], RequestPayload>({
      query: ({ params }) => {
        // eslint-disable-next-line max-len
        const req = createHttpRequest(ClientIsolationUrls.getClientIsolationList, params, RKS_NEW_UI)
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
    getVLANPoolPolicyDetail: build.query<VLANPoolPolicyType, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(VlanPoolUrls.getVLANPoolPolicy, params, RKS_NEW_UI)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'Policy', id: 'DETAIL' }]
    }),
    getClientIsolation: build.query<ClientIsolationSaveData, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(ClientIsolationUrls.getClientIsolation, params, RKS_NEW_UI)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'Policy', id: 'DETAIL' }, { type: 'ClientIsolation', id: 'LIST' }]
    }),
    updateVLANPoolPolicy: build.mutation<VLANPoolPolicyType, RequestPayload>({
      query: ({ params, payload }:{ params:Params<string>, payload:VLANPoolPolicyType }) => {
        const req = createHttpRequest(VlanPoolUrls.updateVLANPoolPolicy, params, RKS_NEW_UI)
        return {
          ...req,
          body: {
            ...payload,
            vlanMembers: payload.vlanMembers.split(',')
          }
        }
      },
      invalidatesTags: [{ type: 'Policy', id: 'LIST' }]
    }),
    vLANPoolNetworkInstances: build.query<TableResult<VLANPoolDetailInstances>, RequestPayload>({
      query: ({ params }) => {
        const instancesRes =
        createHttpRequest(VlanPoolUrls.getVLANPoolNetworkInstances, params, RKS_NEW_UI)
        return {
          ...instancesRes
	    }
      },
      providesTags: [{ type: 'Policy', id: 'LIST' }]
    }),
    updateClientIsolation: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(ClientIsolationUrls.updateClientIsolation, params, RKS_NEW_UI)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Policy', id: 'LIST' }, { type: 'ClientIsolation', id: 'LIST' }]
    }),
    uploadMacRegistration: build.mutation<{}, RequestFormData>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(MacRegListUrlsInfo.uploadMacRegistration, params, {
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
    avcCatList: build.query<AvcCat[], RequestPayload>({
      query: ({ params, payload }) => {
        const avcCatListReq = createHttpRequest(AccessControlUrls.getAvcCat, params)
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
    getSyslogPolicyList: build.query<SyslogPolicyType[], RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(SyslogUrls.getSyslogPolicyList, params, RKS_NEW_UI)
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
        const groupReq = createHttpRequest(RadiusAttributeGroupUrlsInfo.getAttributesWithQuery, params, RKS_NEW_UI)
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
    adaptivePolicyList: build.query<TableResult<AdaptivePolicy>, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createNewTableHttpRequest({
          apiInfo: RulesManagementUrlsInfo.getPolicies,
          params,
          payload: payload as TableChangePayload
        })
        return {
          ...req
        }
      },
      transformResponse (result: NewTableResult<AdaptivePolicy>) {
        return transferToTableResult<AdaptivePolicy>(result)
      },
      providesTags: [{ type: 'AdaptivePolicy', id: 'LIST' }]
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
    policyTemplateList: build.query<TableResult<RuleTemplate>, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createNewTableHttpRequest({
          apiInfo: RulesManagementUrlsInfo.getPolicyTemplateList,
          params,
          payload: payload as TableChangePayload
        })
        return {
          ...req
        }
      },
      transformResponse (result: NewTableResult<RuleTemplate>) {
        return transferToTableResult<RuleTemplate>(result)
      }
    }),
    attributesList: build.query<TableResult<RuleAttribute>, RequestPayload>({
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
        const req = createHttpRequest(RulesManagementUrlsInfo.createPolicy, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'AdaptivePolicy', id: 'LIST' }]
    }),
    addPolicyConditions: build.mutation<AdaptivePolicy, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(RulesManagementUrlsInfo.addConditions, params)
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
      transformResponse (result: NewTableResult<AccessCondition>) {
        return transferToTableResult<AccessCondition>(result)
      }
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
  useAvcCatListQuery,
  useAvcAppListQuery,
  useAddRoguePolicyMutation,
  useDelRoguePolicyMutation,
  useDelRoguePoliciesMutation,
  useAddL2AclPolicyMutation,
  useGetL2AclPolicyQuery,
  useAddL3AclPolicyMutation,
  useGetL3AclPolicyQuery,
  useL2AclPolicyListQuery,
  useL3AclPolicyListQuery,
  useGetRoguePolicyListQuery,
  useUpdateRoguePolicyMutation,
  useRoguePolicyQuery,
  useVenueRoguePolicyQuery,
  useLazyMacRegListsQuery,
  useLazyMacRegistrationsQuery,
  useAddVLANPoolPolicyMutation,
  useDelVLANPoolPolicyMutation,
  useUpdateVLANPoolPolicyMutation,
  useGetVLANPoolPolicyListQuery,
  useVlanPoolListQuery,
  useGetVLANPoolPolicyDetailQuery,
  useVLANPoolNetworkInstancesQuery,
  useAddClientIsolationMutation,
  useDeleteClientIsolationMutation,
  useGetClientIsolationListQuery,
  useLazyGetClientIsolationListQuery,
  useGetClientIsolationQuery,
  useUpdateClientIsolationMutation,
  useLazyGetMacRegListQuery,
  useUploadMacRegistrationMutation,
  useGetSyslogPolicyListQuery,
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
  useAdaptivePolicyListQuery,
  useLazyAdaptivePolicyListQuery,
  useGetAdaptivePolicyQuery,
  useLazyGetAdaptivePolicyQuery,
  useDeleteAdaptivePolicyMutation,
  usePolicyTemplateListQuery,
  useAttributesListQuery,
  useLazyAttributesListQuery,
  useAddAdaptivePolicyMutation,
  useGetConditionsInPolicyQuery,
  useLazyGetConditionsInPolicyQuery,
  useUpdateAdaptivePolicyMutation,
  useAddPolicyConditionsMutation
} = policyApi
