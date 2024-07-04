/* eslint-disable max-len */
import _          from 'lodash'
import { Params } from 'react-router-dom'

import {
  CommonResult, DHCPSaveData, DpskMutationResult, DpskSaveData,
  ServicesConfigTemplateUrlsInfo, TableResult, onActivityMessageReceived,
  onSocketActivityChanged, Portal, PortalSaveData,
  WifiCallingFormContextType, WifiCallingSetting, GetApiVersionHeader, ApiVersionEnum,
  DHCP_LIMIT_NUMBER
} from '@acx-ui/rc/utils'
import { baseConfigTemplateApi }      from '@acx-ui/store'
import { RequestPayload }             from '@acx-ui/types'
import { ApiInfo, createHttpRequest } from '@acx-ui/utils'

import { createDpskHttpRequest }           from '../service'
import { commonQueryFn, getDhcpProfileFn } from '../servicePolicy.utils'

import {
  useCasesToRefreshDhcpTemplateList,
  useCasesToRefreshDpskTemplateList,
  useCasesToRefreshPortalTemplateList,
  useCasesToRefreshWifiCallingTemplateList
} from './constants'

export const servicesConfigTemplateApi = baseConfigTemplateApi.injectEndpoints({
  endpoints: (build) => ({
    getDpskTemplate: build.query<DpskSaveData, RequestPayload>({
      query: ({ params, payload }) => {
        // eslint-disable-next-line max-len
        const getDpskReq = createDpskTemplateHttpRequest(ServicesConfigTemplateUrlsInfo.getDpsk, params)
        return {
          ...getDpskReq,
          body: JSON.stringify(payload)
        }
      },
      providesTags: [{ type: 'DpskTemplate', id: 'DETAIL' }]
    }),
    createDpskTemplate: build.mutation<DpskMutationResult, RequestPayload<DpskSaveData>>({
      query: ({ params, payload }) => {
        // eslint-disable-next-line max-len
        const createDpskReq = createDpskTemplateHttpRequest(ServicesConfigTemplateUrlsInfo.addDpsk, params)
        return {
          ...createDpskReq,
          body: JSON.stringify(payload)
        }
      },
      // eslint-disable-next-line max-len
      invalidatesTags: [{ type: 'ConfigTemplate', id: 'LIST' }, { type: 'DpskTemplate', id: 'LIST' }]
    }),
    updateDpskTemplate: build.mutation<DpskMutationResult, RequestPayload<DpskSaveData>>({
      query: ({ params, payload }) => {
        // eslint-disable-next-line max-len
        const updateDpskReq = createDpskTemplateHttpRequest(ServicesConfigTemplateUrlsInfo.updateDpsk, params)
        return {
          ...updateDpskReq,
          body: JSON.stringify(payload)
        }
      },
      // eslint-disable-next-line max-len
      invalidatesTags: [{ type: 'ConfigTemplate', id: 'LIST' }, { type: 'DpskTemplate', id: 'LIST' }]
    }),
    deleteDpskTemplate: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        // eslint-disable-next-line max-len
        const req = createDpskTemplateHttpRequest(ServicesConfigTemplateUrlsInfo.deleteDpsk, params)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      // eslint-disable-next-line max-len
      invalidatesTags: [{ type: 'ConfigTemplate', id: 'LIST' }, { type: 'DpskTemplate', id: 'LIST' }]
    }),
    getEnhancedDpskTemplateList: build.query<TableResult<DpskSaveData>, RequestPayload>({
      query: ({ params, payload }) => {
        // eslint-disable-next-line max-len
        const getDpskListReq = createDpskTemplateHttpRequest(ServicesConfigTemplateUrlsInfo.getEnhancedDpskList, params)
        const defaultPayload = {
          page: 1,
          pageSize: 10000,
          sortField: 'name',
          sortOrder: 'ASC'
        }
        return {
          ...getDpskListReq,
          body: JSON.stringify(payload ?? defaultPayload)
        }
      },
      providesTags: [{ type: 'DpskTemplate', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, useCasesToRefreshDpskTemplateList, () => {
            api.dispatch(servicesConfigTemplateApi.util.invalidateTags([
              { type: 'ConfigTemplate', id: 'LIST' }, { type: 'DpskTemplate', id: 'LIST' }
            ]))
          })
        })
      }
    }),
    getDhcpTemplate: build.query<DHCPSaveData | null, RequestPayload>({
      queryFn: getDhcpProfileFn(true),
      providesTags: [{ type: 'DhcpTemplate', id: 'DETAIL' }]
    }),
    createOrUpdateDhcpTemplate: build.mutation<DHCPSaveData, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const addDhcpUrl = enableRbac ? ServicesConfigTemplateUrlsInfo.addDhcpRbac : ServicesConfigTemplateUrlsInfo.addDhcp
        const updatedDhcpUrl = enableRbac ? ServicesConfigTemplateUrlsInfo.updateDhcpRbac : ServicesConfigTemplateUrlsInfo.updateDhcp
        const url = _.isEmpty(params?.serviceId) ? addDhcpUrl : updatedDhcpUrl
        const req = createHttpRequest(url, params)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'ConfigTemplate', id: 'LIST' }, { type: 'DhcpTemplate', id: 'LIST' }]
    }),
    deleteDhcpTemplate: build.mutation<CommonResult, RequestPayload>({
      query: commonQueryFn(ServicesConfigTemplateUrlsInfo.deleteDhcp, ServicesConfigTemplateUrlsInfo.deleteDhcpRbac),
      invalidatesTags: [{ type: 'ConfigTemplate', id: 'LIST' }, { type: 'DhcpTemplate', id: 'LIST' }]
    }),
    getDhcpTemplateList: build.query<DHCPSaveData[], RequestPayload>({
      query: ({ params, enableRbac }) => {
        const url = enableRbac ? ServicesConfigTemplateUrlsInfo.queryDHCPProfiles : ServicesConfigTemplateUrlsInfo.getDhcpList
        const req = createHttpRequest(url, params)
        return {
          ...req,
          ...(enableRbac ? { body: JSON.stringify({ pageSize: DHCP_LIMIT_NUMBER }) } : {})
        }
      },
      providesTags: [{ type: 'DhcpTemplate', id: 'LIST' }],
      transformResponse: (response: DHCPSaveData[] | TableResult<DHCPSaveData>, _meta, arg: RequestPayload) => {
        if(arg.enableRbac) {
          return (response as TableResult<DHCPSaveData>).data.map((item) => ({ ...item, serviceName: item.name || '' }))
        }
        return response as DHCPSaveData[]
      },
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, useCasesToRefreshDhcpTemplateList, () => {
            api.dispatch(servicesConfigTemplateApi.util.invalidateTags([
              { type: 'ConfigTemplate', id: 'LIST' }, { type: 'DhcpTemplate', id: 'LIST' }
            ]))
          })
        })
      }
    }),
    getPortalTemplate: build.query<Portal, RequestPayload>({
      query: ({ params, enableRbac }) => {
        const apiVersion = enableRbac? ApiVersionEnum.v1_1 : ApiVersionEnum.v1
        const customHeaders = GetApiVersionHeader(apiVersion)
        // eslint-disable-next-line max-len
        const req = createPortalTemplateHttpRequest(ServicesConfigTemplateUrlsInfo.getPortal,
          params, customHeaders)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'PortalTemplate', id: 'DETAIL' }]
    }),
    createPortalTemplate: build.mutation<PortalSaveData, RequestPayload<Portal>>({
      query: ({ params, payload }) => {
        // eslint-disable-next-line max-len
        const req = createPortalTemplateHttpRequest(ServicesConfigTemplateUrlsInfo.addPortal,
          params, GetApiVersionHeader(ApiVersionEnum.v1))
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      // eslint-disable-next-line max-len
      invalidatesTags: [{ type: 'ConfigTemplate', id: 'LIST' }, { type: 'PortalTemplate', id: 'LIST' }]
    }),
    updatePortalTemplate: build.mutation<CommonResult, RequestPayload<Portal>>({
      query: ({ params, payload, enableRbac }) => {
        const apiVersion = enableRbac? ApiVersionEnum.v1_1 : ApiVersionEnum.v1
        const customHeaders = GetApiVersionHeader(apiVersion)
        // eslint-disable-next-line max-len
        const req = createPortalTemplateHttpRequest(ServicesConfigTemplateUrlsInfo.updatePortal,
          params, customHeaders)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      // eslint-disable-next-line max-len
      invalidatesTags: [{ type: 'ConfigTemplate', id: 'LIST' }, { type: 'PortalTemplate', id: 'LIST' }]
    }),
    deletePortalTemplate: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        // eslint-disable-next-line max-len
        const req = createPortalTemplateHttpRequest(ServicesConfigTemplateUrlsInfo.deletePortal,
          params, GetApiVersionHeader(ApiVersionEnum.v1))
        return {
          ...req
        }
      },
      // eslint-disable-next-line max-len
      invalidatesTags: [{ type: 'ConfigTemplate', id: 'LIST' }, { type: 'PortalTemplate', id: 'LIST' }]
    }),
    getEnhancedPortalTemplateList: build.query<TableResult<Portal>, RequestPayload>({
      query: ({ params, payload }) => {
        // eslint-disable-next-line max-len
        const req = createPortalTemplateHttpRequest(ServicesConfigTemplateUrlsInfo.getEnhancedPortalList,
          params, GetApiVersionHeader(ApiVersionEnum.v1))
        return {
          ...req,
          body: JSON.stringify({
            ...(_.omit(payload as Portal, ['enableRbac']))
          })
        }
      },
      providesTags: [{ type: 'PortalTemplate', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, useCasesToRefreshPortalTemplateList, () => {
            api.dispatch(servicesConfigTemplateApi.util.invalidateTags([
              { type: 'ConfigTemplate', id: 'LIST' }, { type: 'PortalTemplate', id: 'LIST' }
            ]))
          })
        })
      }
    }),
    uploadPhotoTemplate: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(ServicesConfigTemplateUrlsInfo.uploadPhoto,
          params, GetApiVersionHeader(ApiVersionEnum.v1))
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      }
    }),
    uploadLogoTemplate: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(ServicesConfigTemplateUrlsInfo.uploadLogo,
          params, GetApiVersionHeader(ApiVersionEnum.v1))
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      }
    }),
    uploadBgImageTemplate: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(ServicesConfigTemplateUrlsInfo.uploadBgImage,
          params, GetApiVersionHeader(ApiVersionEnum.v1))
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      }
    }),
    uploadPoweredImgTemplate: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(ServicesConfigTemplateUrlsInfo.uploadPoweredImg,
          params, GetApiVersionHeader(ApiVersionEnum.v1))
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      }
    }),
    createWifiCallingServiceTemplate: build.mutation<WifiCallingFormContextType, RequestPayload>({
      query: commonQueryFn(ServicesConfigTemplateUrlsInfo.addWifiCalling),
      invalidatesTags: [
        { type: 'ConfigTemplate', id: 'LIST' }, { type: 'WifiCallingTemplate', id: 'LIST' }
      ]
    }),
    getWifiCallingServiceTemplate: build.query<WifiCallingFormContextType, RequestPayload>({
      query: commonQueryFn(ServicesConfigTemplateUrlsInfo.getWifiCalling),
      providesTags: [
        { type: 'ConfigTemplate', id: 'DETAIL' }, { type: 'WifiCallingTemplate', id: 'DETAIL' }
      ]
    }),
    getWifiCallingServiceTemplateList: build.query<WifiCallingSetting[], RequestPayload>({
      query: commonQueryFn(ServicesConfigTemplateUrlsInfo.getWifiCallingList),
      providesTags: [
        { type: 'ConfigTemplate', id: 'LIST' }, { type: 'WifiCallingTemplate', id: 'LIST' }
      ],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, useCasesToRefreshWifiCallingTemplateList, () => {
            api.dispatch(servicesConfigTemplateApi.util.invalidateTags([
              { type: 'ConfigTemplate', id: 'LIST' },
              { type: 'WifiCallingTemplate', id: 'LIST' }
            ]))
          })
        })
      }
    }),
    // eslint-disable-next-line max-len
    getEnhancedWifiCallingServiceTemplateList: build.query<TableResult<WifiCallingSetting>, RequestPayload>({
      query: commonQueryFn(ServicesConfigTemplateUrlsInfo.getEnhancedWifiCallingList),
      providesTags: [
        { type: 'ConfigTemplate', id: 'LIST' }, { type: 'WifiCallingTemplate', id: 'LIST' }
      ],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, useCasesToRefreshWifiCallingTemplateList, () => {
            api.dispatch(servicesConfigTemplateApi.util.invalidateTags([
              { type: 'ConfigTemplate', id: 'LIST' },
              { type: 'WifiCallingTemplate', id: 'LIST' }
            ]))
          })
        })
      },
      extraOptions: { maxRetries: 5 }
    }),
    updateWifiCallingServiceTemplate: build.mutation<WifiCallingFormContextType, RequestPayload>({
      query: commonQueryFn(ServicesConfigTemplateUrlsInfo.updateWifiCalling),
      invalidatesTags: [
        { type: 'ConfigTemplate', id: 'LIST' }, { type: 'WifiCallingTemplate', id: 'LIST' }
      ]
    }),
    deleteWifiCallingServiceTemplate: build.mutation<CommonResult, RequestPayload>({
      query: commonQueryFn(ServicesConfigTemplateUrlsInfo.deleteWifiCalling),
      invalidatesTags: [
        { type: 'ConfigTemplate', id: 'LIST' }, { type: 'WifiCallingTemplate', id: 'LIST' }
      ]
    })
  })
})

export const {
  useGetDpskTemplateQuery,
  useCreateDpskTemplateMutation,
  useUpdateDpskTemplateMutation,
  useGetEnhancedDpskTemplateListQuery,
  useLazyGetEnhancedDpskTemplateListQuery,
  useDeleteDpskTemplateMutation,
  useGetDhcpTemplateQuery,
  useLazyGetDhcpTemplateQuery,
  useCreateOrUpdateDhcpTemplateMutation,
  useDeleteDhcpTemplateMutation,
  useGetDhcpTemplateListQuery,
  useLazyGetDhcpTemplateListQuery,
  useGetPortalTemplateQuery,
  useLazyGetPortalTemplateQuery,
  useCreatePortalTemplateMutation,
  useUpdatePortalTemplateMutation,
  useDeletePortalTemplateMutation,
  useGetEnhancedPortalTemplateListQuery,
  useLazyGetEnhancedPortalTemplateListQuery,
  useUploadBgImageTemplateMutation,
  useUploadLogoTemplateMutation,
  useUploadPhotoTemplateMutation,
  useUploadPoweredImgTemplateMutation,
  useCreateWifiCallingServiceTemplateMutation,
  useGetWifiCallingServiceTemplateQuery,
  useGetWifiCallingServiceTemplateListQuery,
  useGetEnhancedWifiCallingServiceTemplateListQuery,
  useUpdateWifiCallingServiceTemplateMutation,
  useDeleteWifiCallingServiceTemplateMutation
} = servicesConfigTemplateApi


const v1TemplateHeaders = {
  'Content-Type': 'application/vnd.ruckus.v1+json',
  'Accept': 'application/vnd.ruckus.v1+json'
}
function createDpskTemplateHttpRequest (apiInfo: ApiInfo, params?: Params<string>) {
  return createDpskHttpRequest(apiInfo, params, v1TemplateHeaders)
}

const createPortalTemplateHttpRequest = (
  apiInfo: ApiInfo,
  params?: Params<string>,
  customHeaders?: Record<string, unknown>,
  ignoreDelegation?: boolean) => {
  return createHttpRequest(
    apiInfo,
    params,
    { ...v1TemplateHeaders, ...customHeaders },
    ignoreDelegation
  )
}
