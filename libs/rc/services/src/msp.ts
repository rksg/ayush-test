import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import {
  MspUrlsInfo,
  createHttpRequest,
  RequestPayload,
  TableResult,
  CommonResult,
  MspAdministrator,
  MspAssignmentHistory,
  MspAssignmentSummary,
  MspEntitlement,
  MspEntitlementSummary,
  MspEc, EcDeviceInventory,
  TenantDetail,
  MspEcData,
  MspEcDelegatedAdmins,
  onSocketActivityChanged,
  onActivityMessageReceived,
  SupportDelegation,
  VarCustomer,
  MspProfile,
  EntitlementBanner,
  MspEcProfile
} from '@acx-ui/rc/utils'

export const baseMspApi = createApi({
  baseQuery: fetchBaseQuery(),
  reducerPath: 'mspApi',
  tagTypes: ['Msp'],
  refetchOnMountOrArgChange: true,
  endpoints: () => ({ })
})

export const mspApi = baseMspApi.injectEndpoints({
  endpoints: (build) => ({
    mspCustomerList: build.query<TableResult<MspEc>, RequestPayload>({
      query: ({ params, payload }) => {
        const mspCustomerListReq = createHttpRequest(MspUrlsInfo.getMspCustomersList, params)
        return {
          ...mspCustomerListReq,
          body: payload
        }
      },
      providesTags: [{ type: 'Msp', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'CreateMspEc',
            'UpdateMspEc'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(mspApi.util.invalidateTags([{ type: 'Msp', id: 'LIST' }]))
          })
        })
      }
    }),
    deleteMspEc: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(MspUrlsInfo.deleteMspEcAccount, params)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'Msp', id: 'LIST' }]
    }),
    varCustomerList: build.query<TableResult<VarCustomer>, RequestPayload>({
      query: ({ params, payload }) => {
        const varCustomerListReq = createHttpRequest(MspUrlsInfo.getVarDelegations, params)
        return {
          ...varCustomerListReq,
          body: payload
        }
      },
      providesTags: [{ type: 'Msp', id: 'LIST' }]
    }),
    inviteCustomerList: build.query<TableResult<VarCustomer>, RequestPayload>({
      query: ({ params, payload }) => {
        const inviteCustomerListReq = createHttpRequest(MspUrlsInfo.getVarDelegations, params)
        return {
          ...inviteCustomerListReq,
          body: payload
        }
      },
      providesTags: [{ type: 'Msp', id: 'LIST' }]
    }),
    deviceInventoryList: build.query<TableResult<EcDeviceInventory>, RequestPayload>({
      query: ({ params, payload }) => {
        const deviceInventoryListReq =
          createHttpRequest(MspUrlsInfo.getMspDeviceInventory, params)
        return {
          ...deviceInventoryListReq,
          body: payload
        }
      },
      providesTags: [{ type: 'Msp', id: 'LIST' }]
    }),
    mspAdminList: build.query<MspAdministrator[], RequestPayload>({
      query: ({ params }) => {
        const mspAdminListReq =
          createHttpRequest(MspUrlsInfo.getAdministrators, params)
        return {
          ...mspAdminListReq
        }
      },
      providesTags: [{ type: 'Msp', id: 'LIST' }]
    }),
    mspEntitlementList: build.query<MspEntitlement[], RequestPayload>({
      query: ({ params }) => {
        const mspEntitlementListReq =
          createHttpRequest(MspUrlsInfo.getMspEntitlement, params)
        return {
          ...mspEntitlementListReq
        }
      },
      providesTags: [{ type: 'Msp', id: 'LIST' }]
    }),
    mspEntitlementSummary: build.query<MspEntitlementSummary[], RequestPayload>({
      query: ({ params }) => {
        const mspEntitlementSummaryReq =
          createHttpRequest(MspUrlsInfo.getMspEntitlementSummary, params)
        return {
          ...mspEntitlementSummaryReq
        }
      },
      providesTags: [{ type: 'Msp', id: 'LIST' }]
    }),
    mspAssignmentSummary: build.query<MspAssignmentSummary[], RequestPayload>({
      query: ({ params }) => {
        const mspAssignmentSummaryReq =
          createHttpRequest(MspUrlsInfo.getMspAssignmentSummary, params)
        return {
          ...mspAssignmentSummaryReq
        }
      },
      providesTags: [{ type: 'Msp', id: 'LIST' }]
    }),
    resendEcInvitation: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(MspUrlsInfo.resendEcInvitation, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Msp', id: 'LIST' }]
    }),
    mspCustomerListDropdown: build.query<TableResult<MspEc>, RequestPayload>({
      query: ({ params, payload }) => {
        const mspCustomerListReq =
        createHttpRequest(MspUrlsInfo.getMspCustomersList, params, {}, true)
        return {
          ...mspCustomerListReq,
          body: payload
        }
      },
      providesTags: [{ type: 'Msp', id: 'LIST' }]
    }),
    varCustomerListDropdown: build.query<TableResult<VarCustomer>, RequestPayload>({
      query: ({ params, payload }) => {
        const varCustomerListReq =
        createHttpRequest(MspUrlsInfo.getVarDelegations, params, {}, true)
        return {
          ...varCustomerListReq,
          body: payload
        }
      },
      providesTags: [{ type: 'Msp', id: 'LIST' }]
    }),
    supportCustomerListDropdown: build.query<TableResult<MspEc>, RequestPayload>({
      query: ({ params, payload }) => {
        const supportMspCustomerListReq =
        createHttpRequest(MspUrlsInfo.getSupportMspCustomersList, params, {}, true)
        return {
          ...supportMspCustomerListReq,
          body: payload
        }
      },
      providesTags: [{ type: 'Msp', id: 'LIST' }]
    }),
    getTenantDetail: build.query<TenantDetail, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(
          MspUrlsInfo.getTenantDetail,
          params
        )
        return {
          ...req
        }
      }
    }),
    getMspProfile: build.query<MspProfile, RequestPayload>({
      query: ({ params }) => {
        const req =
          createHttpRequest(MspUrlsInfo.getMspProfile, params)
        return {
          ...req
        }
      }
    }),
    supportMspCustomerList: build.query<TableResult<MspEc>, RequestPayload>({
      query: ({ params, payload }) => {
        const supportMspCustomerListReq =
        createHttpRequest(MspUrlsInfo.getSupportMspCustomersList, params)
        return {
          ...supportMspCustomerListReq,
          body: payload
        }
      },
      providesTags: [{ type: 'Msp', id: 'LIST' }]
    }),
    getMspEcProfile: build.query<MspEcProfile, RequestPayload>({
      query: ({ params }) => {
        const req =
          createHttpRequest(MspUrlsInfo.getMspEcProfile, params)
        return {
          ...req
        }
      }
    }),
    getMspEcAdmin: build.query<MspEcProfile, RequestPayload>({
      query: ({ params }) => {
        const req =
          createHttpRequest(MspUrlsInfo.getMspEcAdmin, params)
        return {
          ...req
        }
      }
    }),
    updateMspEcAdmin: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(MspUrlsInfo.updateMspEcAdmin, params)
        return {
          ...req,
          body: payload
        }
      }
    }),
    mspEcAdminList: build.query<MspAdministrator[], RequestPayload>({
      query: ({ params }) => {
        const mspEcAdminListReq =
          createHttpRequest(MspUrlsInfo.getMspEcAdminList, params)
        return {
          ...mspEcAdminListReq
        }
      },
      providesTags: [{ type: 'Msp', id: 'LIST' }]
    }),
    mspAssignmentHistory: build.query<MspAssignmentHistory[], RequestPayload>({
      query: ({ params }) => {
        const mspAssignmentHistoryReq =
          createHttpRequest(MspUrlsInfo.getMspAssignmentHistory, params)
        return {
          ...mspAssignmentHistoryReq
        }
      },
      providesTags: [{ type: 'Msp', id: 'LIST' }]
    }),
    addCustomer: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(MspUrlsInfo.addMspEcAccount, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Msp', id: 'LIST' }]
    }),
    updateCustomer: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(MspUrlsInfo.updateMspEcAccount, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Msp', id: 'LIST' }]
    }),
    updateMspEcDelegatedAdmins: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(MspUrlsInfo.updateMspEcDelegatedAdmins, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Msp', id: 'LIST' }]
    }),
    getMspEcDelegatedAdmins: build.query<MspEcDelegatedAdmins[], RequestPayload>({
      query: ({ params }) => {
        const mspAdminListReq =
          createHttpRequest(MspUrlsInfo.getMspEcDelegatedAdmins, params)
        return {
          ...mspAdminListReq
        }
      },
      providesTags: [{ type: 'Msp', id: 'LIST' }]
    }),
    getMspEc: build.query<MspEcData, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(MspUrlsInfo.getMspEcAccount, params)
        return{
          ...req
        }
      },
      providesTags: [{ type: 'Msp', id: 'LIST' }]
    }),
    assignMspEcToIntegrator: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(MspUrlsInfo.assignMspEcToIntegrator, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Msp', id: 'LIST' }]
    }),
    deactivateMspEc: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(MspUrlsInfo.deactivateMspEcAccount, params)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'Msp', id: 'LIST' }]
    }),
    reactivateMspEc: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(MspUrlsInfo.reactivateMspEcAccount, params)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'Msp', id: 'LIST' }]
    }),
    getMspEcSupport: build.query<SupportDelegation[], RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(MspUrlsInfo.getMspEcSupport, params)
        return{
          ...req
        }
      },
      providesTags: [{ type: 'Msp', id: 'LIST' }]
    }),
    enableMspEcSupport: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(MspUrlsInfo.enableMspEcSupport, params)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'Msp', id: 'LIST' }]
    }),
    disableMspEcSupport: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(MspUrlsInfo.disableMspEcSupport, params)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'Msp', id: 'LIST' }]
    }),
    refreshMspEntitlement: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(MspUrlsInfo.refreshMspEntitlement, params)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'Msp', id: 'LIST' }]
    }),
    getMspEntitlementBanners: build.query<EntitlementBanner[], RequestPayload>({
      query: ({ params }) => {
        const EntitlementBannerReq =
          createHttpRequest(MspUrlsInfo.getMspEntitlementBanner, params)
        return {
          ...EntitlementBannerReq
        }
      },
      providesTags: [{ type: 'Msp', id: 'BANNERS' }]
    })
  })
})
export const {
  useMspCustomerListQuery,
  useDeleteMspEcMutation,
  useVarCustomerListQuery,
  useInviteCustomerListQuery,
  useDeviceInventoryListQuery,
  useMspAdminListQuery,
  useMspEntitlementListQuery,
  useMspEntitlementSummaryQuery,
  useMspAssignmentSummaryQuery,
  useResendEcInvitationMutation,
  useMspCustomerListDropdownQuery,
  useVarCustomerListDropdownQuery,
  useSupportCustomerListDropdownQuery,
  useGetTenantDetailQuery,
  useSupportMspCustomerListQuery,
  useGetMspProfileQuery,
  useGetMspEcProfileQuery,
  useGetMspEcAdminQuery,
  useUpdateMspEcAdminMutation,
  useMspEcAdminListQuery,
  useMspAssignmentHistoryQuery,
  useAddCustomerMutation,
  useUpdateCustomerMutation,
  useUpdateMspEcDelegatedAdminsMutation,
  useGetMspEcDelegatedAdminsQuery,
  useGetMspEcQuery,
  useAssignMspEcToIntegratorMutation,
  useDeactivateMspEcMutation,
  useReactivateMspEcMutation,
  useGetMspEcSupportQuery,
  useEnableMspEcSupportMutation,
  useDisableMspEcSupportMutation,
  useGetMspEntitlementBannersQuery,
  useRefreshMspEntitlementMutation
} = mspApi
