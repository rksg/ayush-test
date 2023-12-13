
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
  CommonResultWithEntityResponse
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
      }
    }),
    applyConfigTemplate: build.mutation<CommonResult, RequestPayload>({
      query: commonQueryFn(ConfigTemplateUrlsInfo.applyConfigTemplate),
      invalidatesTags: [{ type: 'ConfigTemplate', id: 'LIST' }]
    }),
    // eslint-disable-next-line max-len
    addAAAPolicyTemplate: build.mutation<CommonResultWithEntityResponse<AAAPolicyType>, RequestPayload>({
      query: commonQueryFn(ConfigTemplateUrlsInfo.addAAAPolicyTemplate),
      invalidatesTags: [{ type: 'ConfigTemplate', id: 'LIST' }]
    }),
    getAAAPolicyTemplate: build.query<AAAPolicyType, RequestPayload>({
      query: commonQueryFn(ConfigTemplateUrlsInfo.getAAAPolicyTemplate, false),
      providesTags: [{ type: 'ConfigTemplate', id: 'DETAIL' }]
    }),
    updateAAAPolicyTemplate: build.mutation<AAAPolicyType, RequestPayload>({
      query: commonQueryFn(ConfigTemplateUrlsInfo.updateAAAPolicyTemplate),
      invalidatesTags: [{ type: 'ConfigTemplate', id: 'LIST' }]
    })
  })
})
export const {
  useGetConfigTemplateListQuery,
  useApplyConfigTemplateMutation,
  useAddAAAPolicyTemplateMutation,
  useGetAAAPolicyTemplateQuery,
  useUpdateAAAPolicyTemplateMutation
} = configTemplateApi

function commonQueryFn (apiInfo: ApiInfo, withPayload= true) {
  return ({ params, payload }: RequestPayload) => {
    const req = createHttpRequest(apiInfo, params)
    return {
      ...req,
      ...(withPayload ? { body: payload } : {})
    }
  }
}
