import {
  ConfigurationProfile,
  CliConfiguration,
  SwitchConfigTemplateUrlsInfo,
  SwitchProfileModel,
  onSocketActivityChanged,
  onActivityMessageReceived,
  SwitchProfile,
  CommonResult,
  CliFamilyModels,
  GetApiVersionHeader,
  ApiVersionEnum
} from '@acx-ui/rc/utils'
import { baseConfigTemplateApi } from '@acx-ui/store'
import { RequestPayload }        from '@acx-ui/types'
import { TableResult, batchApi } from '@acx-ui/utils'


import { commonQueryFn } from '../servicePolicy.utils'

import { useCasesToRefreshSwitchConfigProfileTemplateList } from './constants'

export const switchConfigTemplateApi = baseConfigTemplateApi.injectEndpoints({
  endpoints: (build) => ({
    getSwitchConfigProfileTemplate: build.query<ConfigurationProfile, RequestPayload>({
      // eslint-disable-next-line max-len
      query: commonQueryFn(SwitchConfigTemplateUrlsInfo.getSwitchConfigProfile, SwitchConfigTemplateUrlsInfo.getSwitchConfigProfileRbac),
      providesTags: [{ type: 'SwitchConfigProfileTemplate', id: 'DETAIL' }]
    }),
    addSwitchConfigProfileTemplate: build.mutation<CliConfiguration, RequestPayload>({
      // eslint-disable-next-line max-len
      query: commonQueryFn(SwitchConfigTemplateUrlsInfo.addSwitchConfigProfile, SwitchConfigTemplateUrlsInfo.addSwitchConfigProfileRbac),
      invalidatesTags: [{ type: 'SwitchConfigProfileTemplate', id: 'LIST' }]
    }),
    updateSwitchConfigProfileTemplate: build.mutation<CliConfiguration, RequestPayload>({
      // eslint-disable-next-line max-len
      query: commonQueryFn(SwitchConfigTemplateUrlsInfo.updateSwitchConfigProfile, SwitchConfigTemplateUrlsInfo.updateSwitchConfigProfileRbac),
      invalidatesTags: [
        { type: 'SwitchConfigProfileTemplate', id: 'LIST' },
        { type: 'SwitchConfigProfileTemplate', id: 'DETAIL' }
      ]
    }),
    deleteSwitchConfigProfileTemplate: build.mutation<CommonResult, RequestPayload>({
      // eslint-disable-next-line max-len
      query: commonQueryFn(SwitchConfigTemplateUrlsInfo.deleteSwitchConfigProfile, SwitchConfigTemplateUrlsInfo.deleteSwitchConfigProfileRbac),
      invalidatesTags: [{ type: 'SwitchConfigProfileTemplate', id: 'LIST' }]
    }),
    // eslint-disable-next-line max-len
    getSwitchConfigProfileTemplateList: build.query<TableResult<SwitchProfileModel>, RequestPayload>({
      // eslint-disable-next-line max-len
      query: commonQueryFn(SwitchConfigTemplateUrlsInfo.getSwitchConfigProfileList, SwitchConfigTemplateUrlsInfo.getSwitchConfigProfileListRbac),
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
      // eslint-disable-next-line max-len
      query: commonQueryFn(SwitchConfigTemplateUrlsInfo.getSwitchConfigProfileList, SwitchConfigTemplateUrlsInfo.getSwitchConfigProfileListRbac)
    }),
    getSwitchTemplateCliFamilyModels: build.query<CliFamilyModels[], RequestPayload>({
      query: commonQueryFn(SwitchConfigTemplateUrlsInfo.getCliFamilyModels)
    }),
    getSwitchConfigProfileTemplates: build.query<ConfigurationProfile[], RequestPayload>({
      // eslint-disable-next-line max-len
      query: commonQueryFn(SwitchConfigTemplateUrlsInfo.getSwitchConfigProfileList, SwitchConfigTemplateUrlsInfo.getSwitchConfigProfileListRbac),
      transformResponse (result: { data: ConfigurationProfile[] }) {
        return result?.data
      }
    }),
    batchAssociateSwitchConfigProfileTemplate: build.mutation<void, RequestPayload[]>({
      async queryFn (requests, _queryApi, _extraOptions, fetchWithBQ) {
        const header = GetApiVersionHeader(ApiVersionEnum.v1)
        return batchApi(
          SwitchConfigTemplateUrlsInfo.associateWithVenue, requests, fetchWithBQ, header
        )
      },
      invalidatesTags: [
        { type: 'SwitchConfigProfileTemplate', id: 'LIST' },
        { type: 'SwitchConfigProfileTemplate', id: 'DETAIL' }
      ]
    }),
    batchDisassociateSwitchConfigProfileTemplate: build.mutation<void, RequestPayload[]>({
      async queryFn (requests, _queryApi, _extraOptions, fetchWithBQ) {
        const header = GetApiVersionHeader(ApiVersionEnum.v1)
        return batchApi(
          SwitchConfigTemplateUrlsInfo.disassociateWithVenue, requests, fetchWithBQ, header
        )
      },
      invalidatesTags: [
        { type: 'SwitchConfigProfileTemplate', id: 'LIST' },
        { type: 'SwitchConfigProfileTemplate', id: 'DETAIL' }
      ]
    })
  })
})

export const {
  useGetSwitchConfigProfileTemplateQuery,
  useLazyGetSwitchConfigProfileTemplateQuery,
  useAddSwitchConfigProfileTemplateMutation,
  useUpdateSwitchConfigProfileTemplateMutation,
  useDeleteSwitchConfigProfileTemplateMutation,
  useGetSwitchConfigProfileTemplateListQuery,
  useLazyGetSwitchConfigProfileTemplateListQuery,
  useLazyValidateUniqueSwitchProfileTemplateNameQuery,
  useGetSwitchTemplateCliFamilyModelsQuery,
  useGetSwitchConfigProfileTemplatesQuery,
  useBatchAssociateSwitchConfigProfileTemplateMutation,
  useBatchDisassociateSwitchConfigProfileTemplateMutation
} = switchConfigTemplateApi
