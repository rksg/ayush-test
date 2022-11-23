import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import {
  MspUrlsInfo,
  createHttpRequest,
  RequestPayload,
  TableResult,
  CommonResult,
  MspAdministrator,
  MspAssignmentSummary,
  MspEntitlement,
  MspEntitlementSummary,
  MspEc, EcDeviceInventory,
  VarCustomer
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
      providesTags: [{ type: 'Msp', id: 'LIST' }]
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
  useResendEcInvitationMutation
} = mspApi