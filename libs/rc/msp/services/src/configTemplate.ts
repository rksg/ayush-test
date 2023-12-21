
import {
  ConfigTemplateUrlsInfo,
  ConfigTemplate
} from '@acx-ui/msp/utils'
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
  Network
} from '@acx-ui/rc/utils'
import { baseConfigTemplateApi }      from '@acx-ui/store'
import { RequestPayload }             from '@acx-ui/types'
import { ApiInfo, createHttpRequest } from '@acx-ui/utils'

export const configTemplateApi = baseConfigTemplateApi.injectEndpoints({
  endpoints: (build) => ({
    getConfigTemplateList: build.query<TableResult<ConfigTemplate>, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(ConfigTemplateUrlsInfo.getConfigTemplates, params)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'ConfigTemplate', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          // XXX: These are mocked activity messages
          const activities = [
            'CreateConfigTemplate',
            'DeleteConfigTemplate',
            'UpdateConfigTemplate'
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
      invalidatesTags: [{ type: 'ConfigTemplate', id: 'LIST' }, { type: 'NetworkTemplate', id: '' }]
    }),
    updateNetworkTemplate: build.mutation<CommonResult, RequestPayload>({
      query: commonQueryFn(ConfigTemplateUrlsInfo.updateNetworkTemplate),
      invalidatesTags: [{ type: 'ConfigTemplate', id: 'LIST' }, { type: 'NetworkTemplate', id: '' }]
    }),
    getNetworkTemplate: build.query<NetworkSaveData, RequestPayload>({
      query: commonQueryFn(ConfigTemplateUrlsInfo.getNetworkTemplate, false),
      providesTags: [{ type: 'NetworkTemplate', id: 'DETAIL' }]
    }),
    getNetworkTemplateList: build.query<TableResult<Network>, RequestPayload>({
      query: commonQueryFn(ConfigTemplateUrlsInfo.getNetworkTemplateList, true),
      providesTags: [{ type: 'NetworkTemplate', id: 'LIST' }],
      transformResponse: transformNetworkListResponse,
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          // XXX: These are mocked activity messages
          const activities = [
            'CreateNetworkConfigTemplate',
            'DeleteNetworkConfigTemplate',
            'UpdateNetworkConfigTemplate'
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
      query: commonQueryFn(ConfigTemplateUrlsInfo.getAAAPolicyTemplate, false),
      providesTags: [{ type: 'AAATemplate', id: 'DETAIL' }]
    }),
    updateAAAPolicyTemplate: build.mutation<AAAPolicyType, RequestPayload>({
      query: commonQueryFn(ConfigTemplateUrlsInfo.updateAAAPolicyTemplate),
      invalidatesTags: [{ type: 'ConfigTemplate', id: 'LIST' }, { type: 'AAATemplate', id: 'LIST' }]
    }),
    getAAAPolicyTemplateList: build.query<TableResult<AAAViewModalType>, RequestPayload>({
      query: commonQueryFn(ConfigTemplateUrlsInfo.getAAAPolicyTemplateList, false),
      providesTags: [{ type: 'AAATemplate', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          // XXX: These are mocked activity messages
          const activities = [
            'CreateAAAConfigTemplate',
            'DeleteAAAConfigTemplate',
            'UpdateAAAConfigTemplate'
          ]
          onActivityMessageReceived(msg, activities, () => {
            // eslint-disable-next-line max-len
            api.dispatch(configTemplateApi.util.invalidateTags([{ type: 'AAATemplate', id: 'LIST' }]))
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
  useLazyGetNetworkTemplateListQuery,
  useAddAAAPolicyTemplateMutation,
  useGetAAAPolicyTemplateQuery,
  useUpdateAAAPolicyTemplateMutation,
  useGetAAAPolicyTemplateListQuery
} = configTemplateApi

function commonQueryFn (apiInfo: ApiInfo, withPayload = true) {
  return ({ params, payload }: RequestPayload) => {
    const req = createHttpRequest(apiInfo, params)
    return {
      ...req,
      ...(withPayload ? { body: payload } : {})
    }
  }
}
