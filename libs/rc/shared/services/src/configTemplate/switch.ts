import {
  ConfigurationProfile,
  CliConfiguration,
  SwitchConfigTemplateUrlsInfo,
  SwitchProfileModel,
  onSocketActivityChanged,
  onActivityMessageReceived,
  TableResult,
  SwitchProfile,
  CommonResult,
  CliFamilyModels
} from '@acx-ui/rc/utils'
import { baseConfigTemplateApi } from '@acx-ui/store'
import { RequestPayload }        from '@acx-ui/types'


import { commonQueryFn }                                    from './common'
import { useCasesToRefreshSwitchConfigProfileTemplateList } from './constants'

export const switchConfigTemplateApi = baseConfigTemplateApi.injectEndpoints({
  endpoints: (build) => ({
    getSwitchConfigProfileTemplate: build.query<ConfigurationProfile, RequestPayload>({
      query: commonQueryFn(SwitchConfigTemplateUrlsInfo.getSwitchConfigProfile),
      providesTags: [{ type: 'SwitchConfigProfileTemplate', id: 'DETAIL' }]
    }),
    addSwitchConfigProfileTemplate: build.mutation<CliConfiguration, RequestPayload>({
      query: commonQueryFn(SwitchConfigTemplateUrlsInfo.addSwitchConfigProfile),
      invalidatesTags: [{ type: 'SwitchConfigProfileTemplate', id: 'LIST' }]
    }),
    updateSwitchConfigProfileTemplate: build.mutation<CliConfiguration, RequestPayload>({
      query: commonQueryFn(SwitchConfigTemplateUrlsInfo.updateSwitchConfigProfile),
      invalidatesTags: [
        { type: 'SwitchConfigProfileTemplate', id: 'LIST' },
        { type: 'SwitchConfigProfileTemplate', id: 'DETAIL' }
      ]
    }),
    deleteSwitchConfigProfileTemplate: build.mutation<CommonResult, RequestPayload>({
      query: commonQueryFn(SwitchConfigTemplateUrlsInfo.deleteSwitchConfigProfile),
      invalidatesTags: [{ type: 'SwitchConfigProfileTemplate', id: 'LIST' }]
    }),
    // eslint-disable-next-line max-len
    getSwitchConfigProfileTemplateList: build.query<TableResult<SwitchProfileModel>, RequestPayload>({
      query: commonQueryFn(SwitchConfigTemplateUrlsInfo.getSwitchConfigProfileList),
      providesTags: [{ type: 'SwitchConfigProfileTemplate', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, useCasesToRefreshSwitchConfigProfileTemplateList, () => {
            api.dispatch(switchConfigTemplateApi.util.invalidateTags([
              { type: 'SwitchConfigProfileTemplate', id: 'LIST' },
              { type: 'SwitchConfigProfileTemplate', id: 'DETAIL' }
            ]))
          })
        })
      }
    }),
    // eslint-disable-next-line max-len
    validateUniqueSwitchProfileTemplateName: build.query<TableResult<SwitchProfile>, RequestPayload>({
      query: commonQueryFn(SwitchConfigTemplateUrlsInfo.getSwitchConfigProfileList)
    }),
    getSwitchTemplateCliFamilyModels: build.query<CliFamilyModels[], RequestPayload>({
      query: commonQueryFn(SwitchConfigTemplateUrlsInfo.getCliFamilyModels)
    }),
    getSwitchConfigProfileTemplates: build.query<ConfigurationProfile[], RequestPayload>({
      query: commonQueryFn(SwitchConfigTemplateUrlsInfo.getSwitchConfigProfileList),
      transformResponse (result: { data: ConfigurationProfile[] }) {
        return result?.data
      }
    })
  })
})

export const {
  useGetSwitchConfigProfileTemplateQuery,
  useAddSwitchConfigProfileTemplateMutation,
  useUpdateSwitchConfigProfileTemplateMutation,
  useDeleteSwitchConfigProfileTemplateMutation,
  useGetSwitchConfigProfileTemplateListQuery,
  useLazyValidateUniqueSwitchProfileTemplateNameQuery,
  useGetSwitchTemplateCliFamilyModelsQuery,
  useGetSwitchConfigProfileTemplatesQuery
} = switchConfigTemplateApi
