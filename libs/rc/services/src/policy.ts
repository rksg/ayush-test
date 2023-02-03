import {
  createApi,
  fetchBaseQuery
} from '@reduxjs/toolkit/query/react'


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
  TableResult,
  onSocketActivityChanged,
  showActivityMessage,
  CommonResult,
  NewTableResult,
  transferToTableResult,
  l3AclPolicyInfoType,
  l2AclPolicyInfoType,
  L2AclPolicy,
  AvcApp,
  AccessControlUrls, L3AclPolicy, AvcCat,
  ClientIsolationSaveData, ClientIsolationUrls,
  createNewTableHttpRequest, TableChangePayload, RequestFormData,
  ClientIsolationListUsageByVenue, VenueUsageByClientIsolation
} from '@acx-ui/rc/utils'

export const basePolicyApi = createApi({
  baseQuery: fetchBaseQuery(),
  reducerPath: 'policyApi',
  tagTypes: ['Policy', 'MacRegistrationPool', 'MacRegistration', 'ClientIsolation'],
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
    getL3AclPolicy: build.query<l3AclPolicyInfoType, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(AccessControlUrls.getL3AclPolicy, params)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'Policy', id: 'DETAIL' }]
    }),
    getRoguePolicyList: build.query<RogueAPDetectionTempType[], RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(RogueApUrls.getRoguePolicyList, params)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'Policy', id: 'DETAIL' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          showActivityMessage(msg, [
            'UpdateRogueApPolicyProfile'
          ], () => {
            api.dispatch(policyApi.util.invalidateTags([{ type: 'Policy', id: 'LIST' }]))
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
          showActivityMessage(msg, [
            'AddRogueApPolicyProfile',
            'UpdateRogueApPolicyProfile',
            'DeleteRogueApPolicyProfile',
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
            showActivityMessage(msg, [
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
            showActivityMessage(msg, [
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
      invalidatesTags: [{ type: 'Policy', id: 'LIST' }, { type: 'ClientIsolation', id: 'LIST' }]
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
          showActivityMessage(msg, [
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
      query: ({ params }) => {
        // eslint-disable-next-line max-len
        const req = createHttpRequest(ClientIsolationUrls.getClientIsolationListUsageByVenue, params)
        return {
          ...req
        }
      }
    }),
    // eslint-disable-next-line max-len
    getVenueUsageByClientIsolation: build.query<TableResult<VenueUsageByClientIsolation>, RequestPayload>({
      query: ({ params }) => {
        // eslint-disable-next-line max-len
        const req = createHttpRequest(ClientIsolationUrls.getVenueUsageByClientIsolation, params)
        return {
          ...req
        }
      }
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
        const req = createHttpRequest(SyslogUrls.getSyslogPolicyList, params)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'Policy', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          showActivityMessage(msg, [
            'Add Syslog Policy Profile',
            'Update Syslog Policy Profile'
          ], () => {
            api.dispatch(policyApi.util.invalidateTags([{ type: 'Policy', id: 'LIST' }]))
          })
        })
      }
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
  useGetSyslogPolicyListQuery
} = policyApi
