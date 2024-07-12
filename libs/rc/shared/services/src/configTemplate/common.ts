/* eslint-disable max-len */
import {
  AAAPolicyType,
  AAAViewModalType,
  ApplyConfigTemplatePaylod,
  CommonResult,
  ConfigTemplate,
  ConfigTemplateUrlsInfo,
  Network,
  NetworkSaveData,
  TableResult,
  onActivityMessageReceived,
  onSocketActivityChanged,
  transformNetwork
} from '@acx-ui/rc/utils'
import { baseConfigTemplateApi } from '@acx-ui/store'
import { RequestPayload }        from '@acx-ui/types'

import { networkApi }           from '../network'
import { addNetworkVenueFn }    from '../networkUtils'
import { commonQueryFn }        from '../servicePolicy.utils'
import { updateNetworkVenueFn } from '../servicePolicy.utils/network'

import {
  useCasesToRefreshRadiusServerTemplateList, useCasesToRefreshTemplateList,
  useCasesToRefreshNetworkTemplateList
} from './constants'

export const configTemplateApi = baseConfigTemplateApi.injectEndpoints({
  endpoints: (build) => ({
    getConfigTemplateList: build.query<TableResult<ConfigTemplate>, RequestPayload>({
      query: commonQueryFn(ConfigTemplateUrlsInfo.getConfigTemplates),
      providesTags: [{ type: 'ConfigTemplate', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, useCasesToRefreshTemplateList, () => {
            // eslint-disable-next-line max-len
            api.dispatch(configTemplateApi.util.invalidateTags([{ type: 'ConfigTemplate', id: 'LIST' }]))
          })
        })
      },
      extraOptions: { maxRetries: 5 }
    }),
    applyConfigTemplate: build.mutation<CommonResult, RequestPayload<ApplyConfigTemplatePaylod>>({
      query: commonQueryFn(ConfigTemplateUrlsInfo.applyConfigTemplate),
      invalidatesTags: [{ type: 'ConfigTemplate', id: 'LIST' }]
    }),
    addNetworkTemplate: build.mutation<CommonResult, RequestPayload>({
      query: commonQueryFn(ConfigTemplateUrlsInfo.addNetworkTemplate),
      // eslint-disable-next-line max-len
      invalidatesTags: [{ type: 'ConfigTemplate', id: 'LIST' }, { type: 'NetworkTemplate', id: 'LIST' }]
    }),
    updateNetworkTemplate: build.mutation<CommonResult, RequestPayload>({
      query: commonQueryFn(ConfigTemplateUrlsInfo.updateNetworkTemplate),
      // eslint-disable-next-line max-len
      invalidatesTags: [{ type: 'ConfigTemplate', id: 'LIST' }, { type: 'NetworkTemplate', id: 'LIST' }]
    }),
    getNetworkTemplate: build.query<NetworkSaveData, RequestPayload>({
      query: commonQueryFn(ConfigTemplateUrlsInfo.getNetworkTemplate, ConfigTemplateUrlsInfo.getNetworkTemplateRbac),
      providesTags: [{ type: 'NetworkTemplate', id: 'DETAIL' }]
    }),
    deleteNetworkTemplate: build.mutation<CommonResult, RequestPayload>({
      query: commonQueryFn(ConfigTemplateUrlsInfo.deleteNetworkTemplate),
      // eslint-disable-next-line max-len
      invalidatesTags: [{ type: 'ConfigTemplate', id: 'LIST' }, { type: 'NetworkTemplate', id: 'LIST' }]
    }),
    getNetworkTemplateList: build.query<TableResult<Network>, RequestPayload>({
      query: commonQueryFn(ConfigTemplateUrlsInfo.getNetworkTemplateList),
      providesTags: [{ type: 'NetworkTemplate', id: 'LIST' }],
      transformResponse (result: TableResult<Network>) {
        result.data = result.data.map(item => ({
          ...transformNetwork(item)
        })) as Network[]
        return result
      },
      keepUnusedDataFor: 0,
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, useCasesToRefreshNetworkTemplateList, () => {
            // eslint-disable-next-line max-len
            api.dispatch(configTemplateApi.util.invalidateTags([{ type: 'NetworkTemplate', id: 'LIST' }]))
          })
        })
      },
      extraOptions: { maxRetries: 5 }
    }),
    // eslint-disable-next-line max-len
    addAAAPolicyTemplate: build.mutation<CommonResult, RequestPayload>({
      query: commonQueryFn(ConfigTemplateUrlsInfo.addAAAPolicyTemplate),
      invalidatesTags: [{ type: 'ConfigTemplate', id: 'LIST' }, { type: 'AAATemplate', id: 'LIST' }]
    }),
    getAAAPolicyTemplate: build.query<AAAPolicyType, RequestPayload>({
      query: commonQueryFn(ConfigTemplateUrlsInfo.getAAAPolicyTemplate),
      providesTags: [{ type: 'AAATemplate', id: 'DETAIL' }]
    }),
    deleteAAAPolicyTemplate: build.mutation<CommonResult, RequestPayload>({
      query: commonQueryFn(ConfigTemplateUrlsInfo.deleteAAAPolicyTemplate),
      invalidatesTags: [{ type: 'ConfigTemplate', id: 'LIST' }, { type: 'AAATemplate', id: 'LIST' }]
    }),
    updateAAAPolicyTemplate: build.mutation<AAAPolicyType, RequestPayload>({
      query: commonQueryFn(ConfigTemplateUrlsInfo.updateAAAPolicyTemplate),
      invalidatesTags: [{ type: 'ConfigTemplate', id: 'LIST' }, { type: 'AAATemplate', id: 'LIST' }]
    }),
    getAAAPolicyTemplateList: build.query<TableResult<AAAViewModalType>, RequestPayload>({
      query: commonQueryFn(ConfigTemplateUrlsInfo.getAAAPolicyTemplateList),
      providesTags: [{ type: 'AAATemplate', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, useCasesToRefreshRadiusServerTemplateList, () => {
            // eslint-disable-next-line max-len
            api.dispatch(configTemplateApi.util.invalidateTags([{ type: 'AAATemplate', id: 'LIST' }]))
          })
        })
      },
      extraOptions: { maxRetries: 5 }
    }),
    addNetworkVenueTemplate: build.mutation<CommonResult, RequestPayload>({
      queryFn: addNetworkVenueFn(true),
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'AddNetworkVenueTemplate'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(networkApi.util.invalidateTags([
              { type: 'Venue', id: 'LIST' },
              { type: 'Network', id: 'DETAIL' } // venueNetwork
            ]))
            api.dispatch(configTemplateApi.util.invalidateTags([
              { type: 'NetworkTemplate', id: 'LIST' } // networkVenue
            ]))
          })
        })
      },
      invalidatesTags: [{ type: 'VenueTemplate', id: 'DETAIL' }]
    }),
    deleteNetworkVenueTemplate: build.mutation<CommonResult, RequestPayload>({
      query: commonQueryFn(ConfigTemplateUrlsInfo.deleteNetworkVenueTemplate),
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'DeleteNetworkVenueTemplate'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(networkApi.util.invalidateTags([
              { type: 'Venue', id: 'LIST' },
              { type: 'Network', id: 'DETAIL' } // venueNetwork
            ]))
            api.dispatch(configTemplateApi.util.invalidateTags([
              { type: 'NetworkTemplate', id: 'LIST' },
              { type: 'NetworkTemplate', id: 'DETAIL' }
            ]))
          })
        })
      },
      invalidatesTags: [{ type: 'VenueTemplate', id: 'DETAIL' }]
    }),
    deleteNetworkVenuesTemplate: build.mutation<CommonResult, RequestPayload>({
      query: commonQueryFn(ConfigTemplateUrlsInfo.deleteNetworkVenuesTemplate),
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'DeleteNetworkVenueTemplates'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(networkApi.util.invalidateTags([
              { type: 'Venue', id: 'LIST' }
            ]))
            api.dispatch(configTemplateApi.util.invalidateTags([
              { type: 'NetworkTemplate', id: 'LIST' },
              { type: 'NetworkTemplate', id: 'DETAIL' }
            ]))
          })
        })
      },
      invalidatesTags: [{ type: 'VenueTemplate', id: 'DETAIL' }]
    }),
    updateNetworkVenueTemplate: build.mutation<CommonResult, RequestPayload>({
      queryFn: updateNetworkVenueFn(true),
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'UpdateNetworkVenueTemplate'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(networkApi.util.invalidateTags([
              { type: 'Venue', id: 'LIST' },
              { type: 'Network', id: 'DETAIL' } // venueNetwork
            ]))
            api.dispatch(configTemplateApi.util.invalidateTags([
              { type: 'NetworkTemplate', id: 'LIST' }
            ]))
          })
        })
      },
      invalidatesTags: [{ type: 'VenueTemplate', id: 'DETAIL' }]
    }),
    addNetworkVenueTemplates: build.mutation<CommonResult, RequestPayload>({
      query: commonQueryFn(ConfigTemplateUrlsInfo.addNetworkVenuesTemplate),
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'AddNetworkVenueTemplateMappings'
          ]
          onActivityMessageReceived(msg, activities, () => {
            api.dispatch(networkApi.util.invalidateTags([
              { type: 'Venue', id: 'LIST' }
            ]))
            api.dispatch(configTemplateApi.util.invalidateTags([
              { type: 'NetworkTemplate', id: 'LIST' }
            ]))
          })
        })
      },
      invalidatesTags: [{ type: 'VenueTemplate', id: 'DETAIL' }]
    })
  })
})
export const {
  useGetConfigTemplateListQuery,
  useApplyConfigTemplateMutation,
  useAddNetworkTemplateMutation,
  useUpdateNetworkTemplateMutation,
  useGetNetworkTemplateQuery,
  useDeleteNetworkTemplateMutation,
  useGetNetworkTemplateListQuery,
  useLazyGetNetworkTemplateListQuery,
  useAddAAAPolicyTemplateMutation,
  useGetAAAPolicyTemplateQuery,
  useDeleteAAAPolicyTemplateMutation,
  useLazyGetAAAPolicyTemplateQuery,
  useUpdateAAAPolicyTemplateMutation,
  useGetAAAPolicyTemplateListQuery,
  useAddNetworkVenueTemplateMutation,
  useDeleteNetworkVenueTemplateMutation,
  useDeleteNetworkVenuesTemplateMutation,
  useUpdateNetworkVenueTemplateMutation,
  useAddNetworkVenueTemplatesMutation
} = configTemplateApi
