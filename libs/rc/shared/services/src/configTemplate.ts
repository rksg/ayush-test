import {
  TableResult,
  CommonResult,
  onSocketActivityChanged,
  onActivityMessageReceived,
  AAAPolicyType,
  CommonResultWithEntityResponse,
  NetworkSaveData,
  AAAViewModalType,
  transformNetworkListResponse,
  Network,
  ConfigTemplate,
  ConfigTemplateUrlsInfo,
  VenueExtended,
  Venue
} from '@acx-ui/rc/utils'
import { baseConfigTemplateApi }      from '@acx-ui/store'
import { RequestPayload }             from '@acx-ui/types'
import { ApiInfo, createHttpRequest } from '@acx-ui/utils'


export const configTemplateApi = baseConfigTemplateApi.injectEndpoints({
  endpoints: (build) => ({
    getConfigTemplateList: build.query<TableResult<ConfigTemplate>, RequestPayload>({
      query: commonQueryFn(ConfigTemplateUrlsInfo.getConfigTemplates),
      providesTags: [{ type: 'ConfigTemplate', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'AddRadiusServerProfileTemplateRecord',
            'UpdateRadiusServerProfileTemplateRecord',
            'DeleteRadiusServerProfileTemplateRecord',
            'AddNetworkTemplateRecord',
            'UpdateNetworkTemplateRecord',
            'DeleteNetworkTemplateRecord',
            'ApplyTemplate'
          ]
          onActivityMessageReceived(msg, activities, () => {
            // eslint-disable-next-line max-len
            api.dispatch(configTemplateApi.util.invalidateTags([{ type: 'ConfigTemplate', id: 'LIST' }]))
          })
        })
      },
      extraOptions: { maxRetries: 5 }
    }),
    applyConfigTemplate: build.mutation<CommonResult, RequestPayload>({
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
      query: commonQueryFn(ConfigTemplateUrlsInfo.getNetworkTemplate),
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
      transformResponse: transformNetworkListResponse,
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'AddNetworkTemplateRecord',
            'UpdateNetworkTemplateRecord',
            'DeleteNetworkTemplateRecord'
          ]
          onActivityMessageReceived(msg, activities, () => {
            // eslint-disable-next-line max-len
            api.dispatch(configTemplateApi.util.invalidateTags([{ type: 'NetworkTemplate', id: 'LIST' }]))
          })
        })
      },
      extraOptions: { maxRetries: 5 }
    }),
    // eslint-disable-next-line max-len
    addAAAPolicyTemplate: build.mutation<CommonResultWithEntityResponse<AAAPolicyType>, RequestPayload>({
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
          const activities = [
            'AddRadiusServerProfileTemplateRecord',
            'UpdateRadiusServerProfileTemplateRecord',
            'DeleteRadiusServerProfileTemplateRecord'
          ]
          onActivityMessageReceived(msg, activities, () => {
            // eslint-disable-next-line max-len
            api.dispatch(configTemplateApi.util.invalidateTags([{ type: 'AAATemplate', id: 'LIST' }]))
          })
        })
      },
      extraOptions: { maxRetries: 5 }
    }),
    addVenueTemplate: build.mutation<VenueExtended, RequestPayload>({
      query: commonQueryFn(ConfigTemplateUrlsInfo.addVenueTemplate),
      // eslint-disable-next-line max-len
      invalidatesTags: [{ type: 'ConfigTemplate', id: 'LIST' }, { type: 'VenueTemplate', id: 'LIST' }]
    }),
    deleteVenueTemplate: build.mutation<Venue, RequestPayload>({
      query: commonQueryFn(ConfigTemplateUrlsInfo.deleteVenueTemplate),
      // eslint-disable-next-line max-len
      invalidatesTags: [{ type: 'ConfigTemplate', id: 'LIST' }, { type: 'VenueTemplate', id: 'LIST' }]
    }),
    updateVenueTemplate: build.mutation<VenueExtended, RequestPayload>({
      query: commonQueryFn(ConfigTemplateUrlsInfo.updateVenueTemplate),
      // eslint-disable-next-line max-len
      invalidatesTags: [{ type: 'ConfigTemplate', id: 'LIST' }, { type: 'VenueTemplate', id: 'LIST' }]
    }),
    getVenueTemplate: build.query<VenueExtended, RequestPayload>({
      query: commonQueryFn(ConfigTemplateUrlsInfo.getVenueTemplate),
      providesTags: [{ type: 'VenueTemplate', id: 'DETAIL' }]
    }),
    getVenuesTemplateList: build.query<TableResult<Venue>, RequestPayload>({
      query: commonQueryFn(ConfigTemplateUrlsInfo.getVenuesTemplateList),
      keepUnusedDataFor: 0,
      providesTags: [{ type: 'VenueTemplate', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'AddVenueTemplateRecord',
            'UpdateVenueTemplateRecord',
            'DeleteVenueTemplateRecord'
          ]
          onActivityMessageReceived(msg, activities, () => {
            // eslint-disable-next-line max-len
            api.dispatch(configTemplateApi.util.invalidateTags([{ type: 'VenueTemplate', id: 'LIST' }]))
          })
        })
      },
      extraOptions: { maxRetries: 5 }
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
  useLazyGetNetworkTemplateListQuery,
  useAddAAAPolicyTemplateMutation,
  useGetAAAPolicyTemplateQuery,
  useDeleteAAAPolicyTemplateMutation,
  useLazyGetAAAPolicyTemplateQuery,
  useUpdateAAAPolicyTemplateMutation,
  useGetAAAPolicyTemplateListQuery,
  useAddVenueTemplateMutation,
  useDeleteVenueTemplateMutation,
  useUpdateVenueTemplateMutation,
  useGetVenueTemplateQuery,
  useLazyGetVenuesTemplateListQuery
} = configTemplateApi

const requestMethodWithPayload = ['post', 'put', 'PATCH']

function commonQueryFn (apiInfo: ApiInfo, withPayload?: boolean) {
  return ({ params, payload }: RequestPayload) => {
    const req = createHttpRequest(apiInfo, params)
    const needPayload = withPayload ?? requestMethodWithPayload.includes(apiInfo.method)
    return {
      ...req,
      ...(needPayload ? { body: payload } : {})
    }
  }
}
