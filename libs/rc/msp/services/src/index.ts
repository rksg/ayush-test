import { FetchBaseQueryError, FetchBaseQueryMeta } from '@reduxjs/toolkit/query/react'
import { QueryReturnValue }                        from '@rtk-query/graphql-request-base-query/dist/GraphqlBaseQueryTypes'
import { ResultType }                              from 'antd/lib/result'
import _                                           from 'lodash'
import moment                                      from 'moment-timezone'
import { useIntl }                                 from 'react-intl'

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
  ParentLogoUrl,
  NewMspEntitlementSummary,
  MspAggregations,
  MspEcAlarmList,
  RecommendFirmwareUpgrade,
  AvailableMspRecCustomers,
  MspEcWithVenue,
  MspRbacUrlsInfo,
  MspCompliances,
  LicenseAttentionNotes,
  RecommendFirmwareUpgradeByApModel,
  LicenseCalculatorDataResponse,
  MileageReportsResponse,
  SolutionTokenSettings
} from '@acx-ui/msp/utils'
import {
  TableResult,
  CommonResult,
  onSocketActivityChanged,
  onActivityMessageReceived,
  EntitlementBanner,
  MspEntitlement,
  downloadFile,
  Venue,
  CommonUrlsInfo,
  UploadUrlResponse
} from '@acx-ui/rc/utils'
import { baseMspApi }                          from '@acx-ui/store'
import { RequestPayload }                      from '@acx-ui/types'
import { UserUrlsInfo, UserProfile }           from '@acx-ui/user'
import { createHttpRequest, ignoreErrorModal } from '@acx-ui/utils'

const getMspUrls = (enableRbac?: boolean | unknown) => {
  return enableRbac ? MspRbacUrlsInfo : MspUrlsInfo
}

export function useCheckDelegateAdmin (isRbacEnabled: boolean) {
  const { $t } = useIntl()
  const [getDelegatedAdmins] = useLazyGetMspEcDelegatedAdminsQuery()
  const { delegateToMspEcPath } = useDelegateToMspEcPath()
  const checkDelegateAdmin = async (ecTenantId: string, adminId: string) => {
    try {
      const admins = await getDelegatedAdmins({ params: { mspEcTenantId: ecTenantId },
        enableRbac: isRbacEnabled } ).unwrap()
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
  const delegateToMspEcPath = async (ecTenantId: string) => {
    try {
      window.location.href = `/${ecTenantId}/t/`
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
            'DeleteMspEc',
            'UpdateMspEc',
            'Deactivate MspEc',
            'Reactivate MspEc',
            'Update MSP Admin list',
            'assign MspEc List To delegate',
            'MspAdminAssociation',
            'AP_FIRMWARE_UPGRADE'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(mspApi.util.invalidateTags([{ type: 'Msp', id: 'LIST' }]))
          })
        })
      },
      extraOptions: { maxRetries: 5 }
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
            'DeleteMspEc',
            'UpdateMspEc',
            'Deactivate MspEc',
            'Reactivate MspEc',
            'Update MSP Admin list',
            'assign MspEc List To delegate',
            'MspAdminAssociation',
            'AP_FIRMWARE_UPGRADE'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(mspApi.util.invalidateTags([{ type: 'Msp', id: 'LIST' }]))
          })
        })
      },
      extraOptions: { maxRetries: 5 }
    }),
    deleteMspEc: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, enableRbac }) => {
        const mspUrlsInfo = getMspUrls(enableRbac)
        const req = createHttpRequest(mspUrlsInfo.deleteMspEcAccount, params)
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
      },
      extraOptions: { maxRetries: 5 }
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
      },
      extraOptions: { maxRetries: 5 }
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
      providesTags: [{ type: 'Msp', id: 'LIST' }],
      extraOptions: { maxRetries: 5 }
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
      },
      transformResponse: (response) => {
        return MspUrlsInfo.getMspEntitlementSummary.newApi ?
          (response as NewMspEntitlementSummary).mspEntitlementSummaries
          : response as MspEntitlementSummary[]
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
      providesTags: [{ type: 'Msp', id: 'LIST' }],
      extraOptions: { maxRetries: 5 }
    }),
    mspECList: build.query<TableResult<MspEc>, RequestPayload>({
      query: ({ params, payload }) => {
        const req =
        createHttpRequest(MspUrlsInfo.getMspECList, params, {}, true)
        return {
          ...req,
          body: payload
        }
      },
      providesTags: [{ type: 'Msp', id: 'EC_LIST' }],
      extraOptions: { maxRetries: 5 }
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
      providesTags: [{ type: 'Msp', id: 'LIST' }],
      extraOptions: { maxRetries: 5 }
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
      providesTags: [{ type: 'Msp', id: 'LIST' }],
      extraOptions: { maxRetries: 5 }
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
      providesTags: [{ type: 'Msp', id: 'LIST' }],
      extraOptions: { maxRetries: 5 }
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
      query: ({ params, enableRbac }) => {
        const mspUrlsInfo = getMspUrls(enableRbac)
        const req = createHttpRequest(mspUrlsInfo.getMspProfile, params)
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
      providesTags: [{ type: 'Msp', id: 'LIST' }],
      extraOptions: { maxRetries: 5 }
    }),
    getMspEcProfile: build.query<MspEcProfile, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(MspUrlsInfo.getMspEcProfile, params)
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
      query: ({ params, enableRbac }) => {
        const mspUrlsInfo = getMspUrls(enableRbac)
        const mspEcAdminListReq =
          createHttpRequest(mspUrlsInfo.getMspEcAdminList, params)
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
    mspRbacAssignmentHistory: build.query<TableResult<MspAssignmentHistory>, RequestPayload>({
      query: ({ params, payload }) => {
        const mspAssignmentHistoryReq =
          createHttpRequest(MspRbacUrlsInfo.getMspAssignmentHistory, params)
        return {
          ...mspAssignmentHistoryReq,
          body: payload
        }
      },
      providesTags: [{ type: 'Msp', id: 'LIST' }]
    }),
    mspRbacEcAssignmentHistory: build.query<TableResult<MspAssignmentHistory>, RequestPayload>({
      query: ({ params, payload }) => {
        const mspecAssignmentHistoryReq =
          createHttpRequest(MspRbacUrlsInfo.getMspEcAssignmentHistory, params)
        return {
          ...mspecAssignmentHistoryReq,
          body: payload
        }
      },
      providesTags: [{ type: 'Msp', id: 'LIST' }]
    }),
    addCustomer: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const mspUrlsInfo = getMspUrls(enableRbac)
        const req = createHttpRequest(mspUrlsInfo.addMspEcAccount, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Msp', id: 'LIST' }]
    }),
    updateCustomer: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const mspUrlsInfo = getMspUrls(enableRbac)
        const req = createHttpRequest(mspUrlsInfo.updateMspEcAccount, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Msp', id: 'LIST' }]
    }),
    updateMspEcDelegatedAdmins: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const mspUrlsInfo = getMspUrls(enableRbac)
        const req = createHttpRequest(mspUrlsInfo.updateMspEcDelegatedAdmins, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Msp', id: 'LIST' }]
    }),
    getMspEcDelegatedAdmins: build.query<MspEcDelegatedAdmins[], RequestPayload>({
      query: ({ params, enableRbac }) => {
        const mspUrlsInfo = getMspUrls(enableRbac)
        const mspAdminListReq =
          createHttpRequest(mspUrlsInfo.getMspEcDelegatedAdmins, params)
        return {
          ...mspAdminListReq
        }
      },
      providesTags: [{ type: 'Msp', id: 'LIST' }]
    }),
    getMspEc: build.query<MspEcData, RequestPayload>({
      query: ({ params, enableRbac }) => {
        const mspUrlsInfo = getMspUrls(enableRbac)
        const req = createHttpRequest(mspUrlsInfo.getMspEcAccount, params)
        return{
          ...req
        }
      },
      providesTags: [{ type: 'Msp', id: 'LIST' }]
    }),
    getAssignedMspEcToIntegrator: build.query<AssignedEc, RequestPayload>({
      query: ({ params, enableRbac }) => {
        const mspUrlsInfo = getMspUrls(enableRbac)
        const mspAssignedEcListReq =
          createHttpRequest(mspUrlsInfo.getAssignedMspEcToIntegrator, params)
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
    assignMspEcToIntegrator_v1: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const mspUrlsInfo = getMspUrls(enableRbac)
        const req = createHttpRequest(mspUrlsInfo.assignMspEcToIntegrator, params)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'Msp', id: 'LIST' }]
    }),
    deactivateMspEc: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, enableRbac }) => {
        const mspUrlsInfo = getMspUrls(enableRbac)
        const req = createHttpRequest(mspUrlsInfo.deactivateMspEcAccount, params)
        // const payload = { status: 'deactivate' }
        return {
          ...req
          // body: payload
        }
      },
      invalidatesTags: [{ type: 'Msp', id: 'LIST' }]
    }),
    reactivateMspEc: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, enableRbac }) => {
        const mspUrlsInfo = getMspUrls(enableRbac)
        const req = createHttpRequest(mspUrlsInfo.reactivateMspEcAccount, params)
        // const payload = { status: 'reactivate' }
        return {
          ...req
          // body: payload
        }
      },
      invalidatesTags: [{ type: 'Msp', id: 'LIST' }]
    }),
    getMspEcSupport: build.query<SupportDelegation[], RequestPayload>({
      query: ({ params, enableRbac }) => {
        const mspUrlsInfo = getMspUrls(enableRbac)
        const req = createHttpRequest(mspUrlsInfo.getMspEcSupport, params)
        return{
          ...req
        }
      },
      providesTags: [{ type: 'Msp', id: 'LIST' }]
    }),
    enableMspEcSupport: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, enableRbac }) => {
        const mspUrlsInfo = getMspUrls(enableRbac)
        const req = createHttpRequest(mspUrlsInfo.enableMspEcSupport, params)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'Msp', id: 'LIST' }]
    }),
    disableMspEcSupport: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, enableRbac }) => {
        const mspUrlsInfo = getMspUrls(enableRbac)
        const req = createHttpRequest(mspUrlsInfo.disableMspEcSupport, params)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'Msp', id: 'LIST' }]
    }),
    refreshMspEntitlement: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const mspUrlsInfo = getMspUrls(enableRbac)
        const req = createHttpRequest(mspUrlsInfo.refreshMspEntitlement, params)
        return {
          ...req,
          body: payload
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
      query: ({ params, enableRbac }) => {
        const mspUrlsInfo = getMspUrls(enableRbac)
        const req = createHttpRequest(mspUrlsInfo.getMspBaseURL, params)
        return{
          ...req
        }
      },
      providesTags: [{ type: 'Msp', id: 'LIST' }]
    }),
    getMspLabel: build.query<MspPortal, RequestPayload>({
      query: ({ params, enableRbac }) => {
        const mspUrlsInfo = getMspUrls(enableRbac)
        const req = createHttpRequest(mspUrlsInfo.getMspLabel, params)
        return{
          ...req
        }
      },
      providesTags: [{ type: 'Msp', id: 'LIST' }]
    }),
    addMspLabel: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const mspUrlsInfo = getMspUrls(enableRbac)
        const req = createHttpRequest(mspUrlsInfo.addMspLabel, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Msp', id: 'LIST' }]
    }),
    updateMspLabel: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const mspUrlsInfo = getMspUrls(enableRbac)
        const req = createHttpRequest(mspUrlsInfo.updateMspLabel, params)
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
          {}
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
      query: ({ params, enableRbac }) => {
        const mspUrlsInfo = getMspUrls(enableRbac)
        const req = createHttpRequest(
          mspUrlsInfo.getParentLogoUrl,
          params
        )
        return {
          ...req
        }
      }
    }),
    getBrandingData: build.query<MspProfile, RequestPayload>({
      query: ({ params, enableRbac }) => {
        const mspUrlsInfo = getMspUrls(enableRbac)
        const req =
          createHttpRequest(mspUrlsInfo.getBrandingData, params)
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
      query: ({ params, payload, enableRbac }) => {
        const mspUrlsInfo = getMspUrls(enableRbac)
        const req = createHttpRequest(mspUrlsInfo.assignMultiMspEcDelegatedAdmins, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Msp', id: 'LIST' }]
    }),
    addMspAssignment: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const mspUrlsInfo = getMspUrls(enableRbac)
        const req = createHttpRequest(mspUrlsInfo.addMspAssignment, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Msp', id: 'LIST' }]
    }),
    updateMspAssignment: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const mspUrlsInfo = getMspUrls(enableRbac)
        const req = createHttpRequest(mspUrlsInfo.updateMspAssignment, params, {
          ...ignoreErrorModal
        })
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Msp', id: 'LIST' }]
    }),
    deleteMspAssignment: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const mspUrlsInfo = getMspUrls(enableRbac)
        const req = createHttpRequest(mspUrlsInfo.deleteMspAssignment, params, {
          ...ignoreErrorModal
        })
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Msp', id: 'LIST' }]
    }),
    getMspAggregations: build.query<MspAggregations, RequestPayload>({
      query: ({ params, enableRbac }) => {
        const mspUrlsInfo = getMspUrls(enableRbac)
        const req = createHttpRequest(mspUrlsInfo.getMspAggregations, params)
        return {
          ...req
        }
      }
    }),
    addMspAggregations: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(MspUrlsInfo.addMspAggregations, params)
        return {
          ...req,
          body: payload
        }
      }
    }),
    updateMspAggregations: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const mspUrlsInfo = getMspUrls(enableRbac)
        const req = createHttpRequest(mspUrlsInfo.updateMspAggregations, params)
        return {
          ...req,
          body: payload
        }
      }
    }),
    deleteMspAggregations: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(MspUrlsInfo.deleteMspAggregations, params)
        return {
          ...req
        }
      }
    }),
    getMspEcAlarmList: build.query<MspEcAlarmList, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest( MspUrlsInfo.getMspEcAlarmList, params )
        return { ...req, body: payload }
      }
    }),
    getRecommandFirmwareUpgrade: build.query<RecommendFirmwareUpgrade, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const mspUrlsInfo = getMspUrls(enableRbac)
        const req = createHttpRequest(enableRbac
          ? mspUrlsInfo.getRecommandFirmwareUpgrade
          : mspUrlsInfo.getRecommandFirmwareUpgrade, params)
        return {
          ...req,
          body: payload
        }
      }
    }),
    getFirmwareUpgradeByApModel: build.query<RecommendFirmwareUpgradeByApModel[],
      RequestPayload>({
        query: ({ params, payload }) => {
          const req = createHttpRequest(MspRbacUrlsInfo.getFirmwareUpgradeByApModel,
            params)
          return {
            ...req,
            body: payload
          }
        }
      }),
    mspEcFirmwareUpgradeSchedules: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const mspUrlsInfo = getMspUrls(enableRbac)
        const req = createHttpRequest(mspUrlsInfo.mspEcFirmwareUpgradeSchedules, params)
        return {
          ...req,
          body: payload
        }
      }
    }),
    getAvailableMspRecCustomers: build.query<AvailableMspRecCustomers, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const mspUrlsInfo = getMspUrls(enableRbac)
        const req = createHttpRequest(mspUrlsInfo.getAvailableMspRecCustomers, params)
        return {
          ...req,
          body: payload
        }
      }
    }),
    addRecCustomer: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(MspUrlsInfo.addMspRecCustomer, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Msp', id: 'LIST' }]
    }),
    assignMspEcToMultiIntegrators: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const mspUrlsInfo = getMspUrls(enableRbac)
        const req = createHttpRequest(mspUrlsInfo.assignMspEcToMultiIntegrators, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Msp', id: 'LIST' }]
    }),
    getMspEcWithVenuesList: build.query<TableResult<MspEcWithVenue>, RequestPayload>({
      async queryFn (arg, _queryApi, _extraOptions, fetchWithBQ) {
        const listInfo = {
          ...createHttpRequest(MspUrlsInfo.getMspCustomersList, arg.params),
          body: arg.payload
        }
        const listQuery = await fetchWithBQ(listInfo)
        const list = listQuery.data as TableResult<MspEcWithVenue>
        const ecVenues:{ [index:string]: Venue[] } = {}
        if(!list) return { error: listQuery.error as FetchBaseQueryError }

        const ecTenantId: string[] = []

        list.data.forEach(async (item:MspEcWithVenue) => {
          ecTenantId.push(item.id)
        })

        const invalidCustomers: string[] = []

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const allEcVenues:any = await Promise.all(ecTenantId.map(id => {
          // eslint-disable-next-line max-len
          const venuesQuery = fetchWithBQ(genVenuePayload(arg,id)) as PromiseLike<QueryReturnValue<ResultType, FetchBaseQueryError, FetchBaseQueryMeta>>
          return venuesQuery.then((value) => {
            if (value.error) {
              invalidCustomers.push(id)
              return { ...value, data: {}, error: undefined }
            }
            return value
          })
        }
        ))
        list.data.forEach((item) => {
          if (invalidCustomers.includes(item.id)) {
            item.isUnauthorizedAccess = true
          }
        })
        ecTenantId.forEach((id:string, index:number) => {
          ecVenues[id] = allEcVenues[index]?.data.data
        })
        const aggregatedList = aggregatedMspEcListData(list, ecVenues)

        return { data: aggregatedList }
      },
      providesTags: [{ type: 'Msp', id: 'LIST' }]
    }),
    addBrandCustomers: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(MspUrlsInfo.addBrandCustomers, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Msp', id: 'LIST' }]
    }),
    patchCustomer: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(MspUrlsInfo.patchCustomer, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Msp', id: 'LIST' }]
    }),
    getMspUploadURL: build.mutation<UploadUrlResponse, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const mspUrlsInfo = getMspUrls(enableRbac)
        const request = createHttpRequest(mspUrlsInfo.getUploadURL, params)
        return {
          ...request,
          body: payload
        }
      }
    }),
    getEntitlementsCompliances: build.query<MspCompliances, RequestPayload>({
      query: ({ params, payload }) => {
        const request = createHttpRequest(MspRbacUrlsInfo.getEntitlementsCompliances, params)
        return {
          ...request,
          body: payload
        }
      }
    }),
    getSolutionTokenSettings: build.query<SolutionTokenSettings[], RequestPayload>({
      query: ({ params }) => {
        const request = createHttpRequest(MspRbacUrlsInfo.getSolutionTokenSettings, params)
        return {
          ...request
        }
      },
      providesTags: [{ type: 'SolutionTokenSettings', id: 'LIST' }]
    }),
    updateSolutionTokenSettings: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(MspRbacUrlsInfo.updateSolutionTokenSettings, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'SolutionTokenSettings', id: 'LIST' }]
    }),
    getEntitlementsAttentionNotes: build.query<LicenseAttentionNotes, RequestPayload>({
      query: ({ params, payload }) => {
        const request = createHttpRequest(MspRbacUrlsInfo.getEntitlementsAttentionNotes, params)
        return {
          ...request,
          body: payload
        }
      }
    }),
    getCalculatedLicences: build.mutation<LicenseCalculatorDataResponse, RequestPayload>({
      query: ({ payload }) => {
        const request = createHttpRequest(MspRbacUrlsInfo.getCalculatedLicences)
        return {
          ...request,
          body: payload
        }
      }
    }),
    updateMspEcDelegations: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(MspRbacUrlsInfo.updateMspEcDelegations, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Msp', id: 'LIST' }]
    }),
    updateMspMultipleEcDelegations: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(MspRbacUrlsInfo.updateMspMultipleEcDelegations, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Msp', id: 'LIST' }]
    }),
    getLicenseMileageReports: build.query<MileageReportsResponse, RequestPayload>({
      query: ({ payload }) => {
        const request = createHttpRequest(MspRbacUrlsInfo.getLicenseMileageReports)
        return {
          ...request,
          body: payload
        }
      }
    }),
    customerNamesFilterList: build.query<{
      data: string[]
    }, RequestPayload>({
      query: ({ params, payload }) => {
        const customerListReq =
          createHttpRequest(MspUrlsInfo.getCustomerNamesFilter, params)
        return {
          ...customerListReq,
          body: payload
        }
      },
      providesTags: [{ type: 'Msp', id: 'LIST' }],
      extraOptions: { maxRetries: 5 }
    }),
    venueNamesFilterList: build.query<{
      data: string[]
    }, RequestPayload>({
      query: ({ params, payload }) => {
        const venuesListReq =
          createHttpRequest(MspUrlsInfo.getVenuesFilter, params)
        return {
          ...venuesListReq,
          body: payload
        }
      },
      providesTags: [{ type: 'Msp', id: 'LIST' }],
      extraOptions: { maxRetries: 5 }
    }),
    deviceModelFilterList: build.query<{
      data: string[]
    }, RequestPayload>({
      query: ({ params, payload }) => {
        const deviceModelsListReq =
          createHttpRequest(MspUrlsInfo.getdeviceModelsFilter, params)
        return {
          ...deviceModelsListReq,
          body: payload
        }
      },
      providesTags: [{ type: 'Msp', id: 'LIST' }],
      extraOptions: { maxRetries: 5 }
    })
  })
})

const genVenuePayload = (arg:RequestPayload<unknown>, ecTenantId:string) => {
  const CUSTOM_HEADER = {
    'x-rks-tenantid': ecTenantId
  }
  return {
    ...createHttpRequest(CommonUrlsInfo.getVenuesList, arg.params, CUSTOM_HEADER, true),
    body: {
      fields: ['name', 'country', 'id'],
      pageSize: 10000,
      sortField: 'name',
      sortOrder: 'ASC'
    }
  }
}

const aggregatedMspEcListData = (ecList: TableResult<MspEcWithVenue>,
  ecVenues:{ [index:string]: Venue[] }) => {
  const data:MspEcWithVenue[] = []
  ecList.data.forEach(item => {
    const tmp = {
      ...item,
      isFirstLevel: true
    }
    if (ecVenues[item.id]) {
      const tmpV = _.cloneDeep(ecVenues[item.id])
      tmp.children = tmpV.map(venue => {
        return { ...venue, selected: false }
      })
    }
    data.push(tmp)
  })
  return {
    ...ecList,
    data
  }
}

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
  useMspECListQuery,
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
  useMspRbacAssignmentHistoryQuery,
  useMspRbacEcAssignmentHistoryQuery,
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
  useGetBrandingDataQuery,
  useLazyGetUserProfilePverQuery,
  useAssignMultiMspEcDelegatedAdminsMutation,
  useAddMspAssignmentMutation,
  useUpdateMspAssignmentMutation,
  useDeleteMspAssignmentMutation,
  useGetMspAggregationsQuery,
  useAddMspAggregationsMutation,
  useUpdateMspAggregationsMutation,
  useDeleteMspAggregationsMutation,
  useGetMspEcAlarmListQuery,
  useGetRecommandFirmwareUpgradeQuery,
  useGetFirmwareUpgradeByApModelQuery,
  useMspEcFirmwareUpgradeSchedulesMutation,
  useGetAvailableMspRecCustomersQuery,
  useAddRecCustomerMutation,
  useAssignMspEcToMultiIntegratorsMutation,
  useAssignMspEcToIntegrator_v1Mutation,
  useGetMspEcWithVenuesListQuery,
  useAddBrandCustomersMutation,
  usePatchCustomerMutation,
  useGetMspUploadURLMutation,
  useGetEntitlementsCompliancesQuery,
  useGetSolutionTokenSettingsQuery,
  useUpdateSolutionTokenSettingsMutation,
  useGetEntitlementsAttentionNotesQuery,
  useGetCalculatedLicencesMutation,
  useUpdateMspEcDelegationsMutation,
  useUpdateMspMultipleEcDelegationsMutation,
  useGetLicenseMileageReportsQuery,
  useCustomerNamesFilterListQuery,
  useDeviceModelFilterListQuery,
  useVenueNamesFilterListQuery
} = mspApi

export * from './hospitalityVerticalFFCheck'
