import _           from 'lodash'
import moment      from 'moment-timezone'
import { useIntl } from 'react-intl'

import {
  showActionModal
} from '@acx-ui/components'
import {
  AssignedEc,
  BaseUrl,
  MspUrlsInfo,
  MspAdministrator,
  MspAssignmentHistory,
  MspAssignmentSummary,
  MspEntitlementSummary,
  MspEc, EcDeviceInventory,
  TenantDetail,
  MspEcData,
  MspEcDelegatedAdmins,
  SupportDelegation,
  VarCustomer,
  MspProfile,
  MspEcProfile,
  MspPortal,
  ParentLogoUrl
} from '@acx-ui/msp/utils'
import {
  TableResult,
  CommonResult,
  onSocketActivityChanged,
  onActivityMessageReceived,
  EntitlementBanner,
  MspEntitlement,
  downloadFile
} from '@acx-ui/rc/utils'
import { baseMspApi }                  from '@acx-ui/store'
import { RequestPayload }              from '@acx-ui/types'
import { UserUrlsInfo, UserProfile }   from '@acx-ui/user'
import { createHttpRequest, PverName } from '@acx-ui/utils'

export function useCheckDelegateAdmin () {
  const { $t } = useIntl()
  const [getDelegatedAdmins] = useLazyGetMspEcDelegatedAdminsQuery()
  const { delegateToMspEcPath } = useDelegateToMspEcPath()
  const checkDelegateAdmin = async (ecTenantId: string, adminId: string) => {
    try {
      const admins = await getDelegatedAdmins({ params: { mspEcTenantId: ecTenantId } } ).unwrap()
      const allowDelegate = admins.find( admin => admin.msp_admin_id === adminId )
      if (allowDelegate) {
        delegateToMspEcPath(ecTenantId)
      } else {
        showActionModal({
          type: 'error',
          title: $t({ defaultMessage: 'Error' }),
          content:
            $t({ defaultMessage: 'You are not authorized to manage this customer' })
        })
      }
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }
  return { checkDelegateAdmin }
}

export function useDelegateToMspEcPath () {
  const [getTenantPver] = useLazyGetUserProfilePverQuery()
  const delegateToMspEcPath = async (ecTenantId: string) => {
    try {
      const user = await getTenantPver({ params: { includeTenantId: ecTenantId } } ).unwrap()
      window.location.href = (user?.pver === PverName.R1)
        ? `/${ecTenantId}/t/dashboard`
        : `/api/ui/t/${ecTenantId}/dashboard`
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }
  return { delegateToMspEcPath }
}

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
            'UpdateMspEc',
            'Deactivate MspEc',
            'Reactivate MspEc',
            'Update MSP Admin list',
            'assign MspEc List To delegate',
            'MspAdminAssociation'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(mspApi.util.invalidateTags([{ type: 'Msp', id: 'LIST' }]))
          })
        })
      }
    }),
    integratorCustomerList: build.query<TableResult<MspEc>, RequestPayload>({
      query: ({ params, payload }) => {
        const mspCustomerListReq = createHttpRequest(MspUrlsInfo.getIntegratorCustomersList, params)
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
            'UpdateMspEc',
            'Deactivate MspEc',
            'Reactivate MspEc',
            'Update MSP Admin list',
            'assign MspEc List To delegate'
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
      providesTags: [{ type: 'Msp', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'AcceptOrRejectDelegation'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(mspApi.util.invalidateTags([{ type: 'Msp', id: 'LIST' }]))
          })
        })
      }
    }),
    inviteCustomerList: build.query<TableResult<VarCustomer>, RequestPayload>({
      query: ({ params, payload }) => {
        const inviteCustomerListReq = createHttpRequest(MspUrlsInfo.getVarDelegations, params)
        return {
          ...inviteCustomerListReq,
          body: payload
        }
      },
      providesTags: [{ type: 'Msp', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'AcceptOrRejectDelegation'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(mspApi.util.invalidateTags([{ type: 'Msp', id: 'LIST' }]))
          })
        })
      }
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
    integratorDeviceInventoryList: build.query<TableResult<EcDeviceInventory>, RequestPayload>({
      query: ({ params, payload }) => {
        const deviceInventoryListReq =
          createHttpRequest(MspUrlsInfo.getIntegratorDeviceInventory, params)
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
      providesTags: [{ type: 'Msp', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'MSP license refresh flow'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(mspApi.util.invalidateTags([{ type: 'Msp', id: 'LIST' }]))
          })
        })
      }
    }),
    mspEntitlementSummary: build.query<MspEntitlementSummary[], RequestPayload>({
      query: ({ params }) => {
        const mspEntitlementSummaryReq =
          createHttpRequest(MspUrlsInfo.getMspEntitlementSummary, params)
        return {
          ...mspEntitlementSummaryReq
        }
      },
      providesTags: [{ type: 'Msp', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'MSP license refresh flow'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(mspApi.util.invalidateTags([{ type: 'Msp', id: 'LIST' }]))
          })
        })
      }
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
    integratorCustomerListDropdown: build.query<TableResult<MspEc>, RequestPayload>({
      query: ({ params, payload }) => {
        const integratorCustomerListReq =
        createHttpRequest(MspUrlsInfo.getIntegratorCustomersList, params, {}, true)
        return {
          ...integratorCustomerListReq,
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
    getAssignedMspEcToIntegrator: build.query<AssignedEc, RequestPayload>({
      query: ({ params }) => {
        const mspAssignedEcListReq =
          createHttpRequest(MspUrlsInfo.getAssignedMspEcToIntegrator, params)
        return {
          ...mspAssignedEcListReq
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
        // const payload = { status: 'deactivate' }
        return {
          ...req
          // body: payload
        }
      },
      invalidatesTags: [{ type: 'Msp', id: 'LIST' }]
    }),
    reactivateMspEc: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(MspUrlsInfo.reactivateMspEcAccount, params)
        // const payload = { status: 'reactivate' }
        return {
          ...req
          // body: payload
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
    }),
    getMspBaseURL: build.query<BaseUrl, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(MspUrlsInfo.getMspBaseURL, params)
        return{
          ...req
        }
      },
      providesTags: [{ type: 'Msp', id: 'LIST' }]
    }),
    getMspLabel: build.query<MspPortal, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(MspUrlsInfo.getMspLabel, params)
        return{
          ...req
        }
      },
      providesTags: [{ type: 'Msp', id: 'LIST' }]
    }),
    addMspLabel: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(MspUrlsInfo.addMspLabel, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Msp', id: 'LIST' }]
    }),
    updateMspLabel: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(MspUrlsInfo.updateMspLabel, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Msp', id: 'LIST' }]
    }),
    exportDeviceInventory: build.mutation<{ data: BlobPart }, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(
          MspUrlsInfo.exportMspEcDeviceInventory,
          { ...params },
          {},
          true
        )
        return {
          ...req,
          responseHandler: async (response) => {
            const headerContent = response.headers.get('content-disposition')
            const fileName = headerContent
              ? headerContent.split('filename=')[1]
              : 'MSP Device Inventory_' + moment().format('YYYYMMDDHHmmss') + '.csv'
            downloadFile(response, fileName)
            return {}
          },
          body: payload,
          headers: {
            ...req.headers,
            Accept: 'application/json,text/plain,*/*'
          }
        }
      }
    }),
    acceptRejectInvitation: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(MspUrlsInfo.acceptRejectInvitation, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Msp', id: 'LIST' }]
    }),
    getGenerateLicenseUsageRpt: build.query<{ status: number }, RequestPayload>({
      query: ({ params, payload, selectedFormat }) => {
        const contentType: string = selectedFormat === 'csv'
          ? 'text/csv'
          : selectedFormat === 'json'
            ? 'text/json'
            : selectedFormat === 'pdf'
              ? 'application/pdf'
              : ''

        const licenseUsageRptReq = createHttpRequest(
          MspUrlsInfo.getGenerateLicenseUsageRpt,
          { ...params },
          {},
          true
        )
        licenseUsageRptReq.url += '/' + payload
        return {
          ...licenseUsageRptReq,
          responseHandler: async (response) => {
            const fileName =
            `License Usage Report ${moment().format('YYYYMMDDHHmmss')}.${selectedFormat}`
            downloadFile(response, fileName)
            return { status: response.status }
          },
          headers: {
            ..._.omit(licenseUsageRptReq.headers, 'Accept'),
            'Content-Type': contentType
          }
        }
      }
    }),
    getParentLogoUrl: build.query<ParentLogoUrl, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(
          MspUrlsInfo.getParentLogoUrl,
          params
        )
        return {
          ...req
        }
      }
    }),
    getUserProfilePver: build.query<UserProfile, RequestPayload>({
      query: ({ params }) => {
        const CUSTOM_HEADER = {
          'x-rks-tenantid': params?.includeTenantId
        }
        const req = createHttpRequest(
          UserUrlsInfo.getUserProfile,
          params, CUSTOM_HEADER, true
        )
        return {
          ...req
        }
      }
    }),
    assignMultiMspEcDelegatedAdmins: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(MspUrlsInfo.assignMultiMspEcDelegatedAdmins, params)
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
  useIntegratorCustomerListQuery,
  useDeleteMspEcMutation,
  useVarCustomerListQuery,
  useInviteCustomerListQuery,
  useDeviceInventoryListQuery,
  useIntegratorDeviceInventoryListQuery,
  useMspAdminListQuery,
  useMspEntitlementListQuery,
  useMspEntitlementSummaryQuery,
  useMspAssignmentSummaryQuery,
  useResendEcInvitationMutation,
  useMspCustomerListDropdownQuery,
  useVarCustomerListDropdownQuery,
  useSupportCustomerListDropdownQuery,
  useIntegratorCustomerListDropdownQuery,
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
  useLazyGetMspEcDelegatedAdminsQuery,
  useGetMspEcQuery,
  useGetAssignedMspEcToIntegratorQuery,
  useLazyGetAssignedMspEcToIntegratorQuery,
  useAssignMspEcToIntegratorMutation,
  useDeactivateMspEcMutation,
  useReactivateMspEcMutation,
  useGetMspEcSupportQuery,
  useEnableMspEcSupportMutation,
  useDisableMspEcSupportMutation,
  useGetMspEntitlementBannersQuery,
  useRefreshMspEntitlementMutation,
  useGetMspBaseURLQuery,
  useGetMspLabelQuery,
  useAddMspLabelMutation,
  useUpdateMspLabelMutation,
  useExportDeviceInventoryMutation,
  useAcceptRejectInvitationMutation,
  useGetGenerateLicenseUsageRptQuery,
  useGetParentLogoUrlQuery,
  useLazyGetUserProfilePverQuery,
  useAssignMultiMspEcDelegatedAdminsMutation
} = mspApi
