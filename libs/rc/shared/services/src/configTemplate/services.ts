import { Params } from 'react-router-dom'

import {
  CommonResult, DHCPSaveData, DpskMutationResult, DpskSaveData,
  ServicesConfigTemplateUrlsInfo, TableResult, onActivityMessageReceived,
  onSocketActivityChanged, Portal, PortalSaveData, PortalDetail,
  WifiCallingFormContextType, WifiCallingSetting
} from '@acx-ui/rc/utils'
import { baseConfigTemplateApi }      from '@acx-ui/store'
import { RequestPayload }             from '@acx-ui/types'
import { ApiInfo, createHttpRequest } from '@acx-ui/utils'

import { createDpskHttpRequest, transformDhcpResponse } from '../service'

import {
  commonQueryFn,
  useCasesToRefreshDhcpTemplateList,
  useCasesToRefreshDpskTemplateList,
  useCasesToRefreshPortalTemplateList, useCasesToRefreshWifiCallingTemplateList
} from './common'

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
      query: commonQueryFn(ServicesConfigTemplateUrlsInfo.getDhcp),
      transformResponse: transformDhcpResponse,
      providesTags: [{ type: 'DhcpTemplate', id: 'DETAIL' }]
    }),
    createOrUpdateDhcpTemplate: build.mutation<DHCPSaveData, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(params?.serviceId
          ? ServicesConfigTemplateUrlsInfo.updateDhcp
          : ServicesConfigTemplateUrlsInfo.addDhcp
        , params)
        return {
          ...req,
          body: payload
        }
      },
      // eslint-disable-next-line max-len
      invalidatesTags: [{ type: 'ConfigTemplate', id: 'LIST' }, { type: 'DhcpTemplate', id: 'LIST' }]
    }),
    deleteDhcpTemplate: build.mutation<CommonResult, RequestPayload>({
      query: commonQueryFn(ServicesConfigTemplateUrlsInfo.deleteDhcp),
      // eslint-disable-next-line max-len
      invalidatesTags: [{ type: 'ConfigTemplate', id: 'LIST' }, { type: 'DhcpTemplate', id: 'LIST' }]
    }),
    getDhcpTemplateList: build.query<DHCPSaveData[], RequestPayload>({
      query: commonQueryFn(ServicesConfigTemplateUrlsInfo.getDhcpList),
      providesTags: [{ type: 'DhcpTemplate', id: 'LIST' }],
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
    getPortalTemplate: build.query<PortalSaveData, RequestPayload>({
      query: ({ params, payload }) => {
        // eslint-disable-next-line max-len
        const req = createPortalTemplateHttpRequest(ServicesConfigTemplateUrlsInfo.getPortal, params)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      providesTags: [{ type: 'PortalTemplate', id: 'DETAIL' }]
    }),
    createPortalTemplate: build.mutation<PortalSaveData, RequestPayload<Portal>>({
      query: ({ params, payload }) => {
        // eslint-disable-next-line max-len
        const req = createPortalTemplateHttpRequest(ServicesConfigTemplateUrlsInfo.addPortal, params)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      // eslint-disable-next-line max-len
      invalidatesTags: [{ type: 'ConfigTemplate', id: 'LIST' }, { type: 'PortalTemplate', id: 'LIST' }]
    }),
    updatePortalTemplate: build.mutation<CommonResult, RequestPayload<Portal>>({
      query: ({ params, payload }) => {
        // eslint-disable-next-line max-len
        const req = createPortalTemplateHttpRequest(ServicesConfigTemplateUrlsInfo.updatePortal, params)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      // eslint-disable-next-line max-len
      invalidatesTags: [{ type: 'ConfigTemplate', id: 'LIST' }, { type: 'PortalTemplate', id: 'LIST' }]
    }),
    deletePortalTemplate: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        // eslint-disable-next-line max-len
        const req = createPortalTemplateHttpRequest(ServicesConfigTemplateUrlsInfo.deletePortal, params)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      // eslint-disable-next-line max-len
      invalidatesTags: [{ type: 'ConfigTemplate', id: 'LIST' }, { type: 'PortalTemplate', id: 'LIST' }]
    }),
    getEnhancedPortalTemplateList: build.query<TableResult<PortalDetail>, RequestPayload>({
      query: ({ params, payload }) => {
        // eslint-disable-next-line max-len
        const req = createDpskTemplateHttpRequest(ServicesConfigTemplateUrlsInfo.getEnhancedPortalList, params)
        const defaultPayload = {
          page: 1,
          pageSize: 10,
          sortField: 'name',
          sortOrder: 'ASC'
        }
        return {
          ...req,
          body: JSON.stringify(payload ?? defaultPayload)
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
    createWifiCallingServiceTemplate: build.mutation<WifiCallingFormContextType, RequestPayload>({
      query: commonQueryFn(ServicesConfigTemplateUrlsInfo.addWifiCalling, true),
      invalidatesTags: [
        { type: 'ConfigTemplate', id: 'LIST' }, { type: 'WifiCallingTemplate', id: 'LIST' }
      ]
    }),
    getWifiCallingServiceTemplate: build.query<WifiCallingFormContextType, RequestPayload>({
      query: commonQueryFn(ServicesConfigTemplateUrlsInfo.getWifiCalling, true),
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
      query: commonQueryFn(ServicesConfigTemplateUrlsInfo.getEnhancedWifiCallingList, true),
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
      query: commonQueryFn(ServicesConfigTemplateUrlsInfo.updateWifiCalling, true),
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
