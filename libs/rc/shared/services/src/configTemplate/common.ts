/* eslint-disable max-len */
import { QueryReturnValue }                        from '@reduxjs/toolkit/dist/query/baseQueryTypes'
import { FetchBaseQueryError, FetchBaseQueryMeta } from '@reduxjs/toolkit/dist/query/react'
import { cloneDeep, find }                         from 'lodash'

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
  WifiNetwork,
  onActivityMessageReceived,
  onSocketActivityChanged,
  transformNetwork,
  NetworkRadiusSettings,
  GetApiVersionHeader,
  ApiVersionEnum,
  NetworkVenue,
  NetworkApGroup
} from '@acx-ui/rc/utils'
import { baseConfigTemplateApi } from '@acx-ui/store'
import { RequestPayload }        from '@acx-ui/types'
import { createHttpRequest }     from '@acx-ui/utils'

import { networkApi }                                from '../network'
import { fetchRbacNetworkVenueList }                 from '../networkVenueUtils'
import { ActionItem, commonQueryFn, comparePayload } from '../servicePolicy.utils'
import { addNetworkVenueFn }                         from '../servicePolicy.utils/network'

import {
  useCasesToRefreshRadiusServerTemplateList, useCasesToRefreshTemplateList,
  useCasesToRefreshNetworkTemplateList
} from './constants'

export const configTemplateApi = baseConfigTemplateApi.injectEndpoints({
  endpoints: (build) => ({
    getConfigTemplateList: build.query<TableResult<ConfigTemplate>, RequestPayload>({
      query: commonQueryFn(
        ConfigTemplateUrlsInfo.getConfigTemplates,
        ConfigTemplateUrlsInfo.getConfigTemplatesRbac
      ),
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
      query: commonQueryFn(
        ConfigTemplateUrlsInfo.applyConfigTemplate,
        ConfigTemplateUrlsInfo.applyConfigTemplateRbac
      ),
      invalidatesTags: [{ type: 'ConfigTemplate', id: 'LIST' }]
    }),
    addNetworkTemplate: build.mutation<CommonResult, RequestPayload>({
      query: commonQueryFn(
        ConfigTemplateUrlsInfo.addNetworkTemplate,
        ConfigTemplateUrlsInfo.addNetworkTemplateRbac
      ),
      // eslint-disable-next-line max-len
      invalidatesTags: [{ type: 'ConfigTemplate', id: 'LIST' }, { type: 'NetworkTemplate', id: 'LIST' }]
    }),
    updateNetworkTemplate: build.mutation<CommonResult, RequestPayload>({
      query: commonQueryFn(
        ConfigTemplateUrlsInfo.updateNetworkTemplate,
        ConfigTemplateUrlsInfo.updateNetworkTemplateRbac
      ),
      // eslint-disable-next-line max-len
      invalidatesTags: [{ type: 'ConfigTemplate', id: 'LIST' }, { type: 'NetworkTemplate', id: 'LIST' }]
    }),
    getNetworkTemplate: build.query<NetworkSaveData, RequestPayload>({
      query: commonQueryFn(
        ConfigTemplateUrlsInfo.getNetworkTemplate,
        ConfigTemplateUrlsInfo.getNetworkTemplateRbac
      ),
      providesTags: [{ type: 'NetworkTemplate', id: 'DETAIL' }]
    }),
    getNetworkDeepTemplate: build.query<NetworkSaveData | null, RequestPayload>({
      async queryFn ({ params }, _queryApi, _extraOptions, fetchWithBQ) {
        if (!params?.networkId) return Promise.resolve({ data: null } as QueryReturnValue<
          null,
          FetchBaseQueryError,
          FetchBaseQueryMeta
        >)

        const networkQuery = await fetchWithBQ(
          createHttpRequest(
            ConfigTemplateUrlsInfo.getNetworkTemplateRbac,
            params,
            GetApiVersionHeader(ApiVersionEnum.v1)
          )
        )
        const networkDeepData = networkQuery.data as NetworkSaveData

        if (networkDeepData) {
          const arg = {
            params,
            payload: { isTemplate: true }
          }

          const {
            error: networkVenuesListQueryError,
            networkDeep
          } = await fetchRbacNetworkVenueList(arg, fetchWithBQ)

          if (networkVenuesListQueryError)
            return { error: networkVenuesListQueryError }

          if (networkDeep?.venues) {
            networkDeepData.venues = cloneDeep(networkDeep.venues)
          }
        }

        return networkQuery as QueryReturnValue<NetworkSaveData,
          FetchBaseQueryError,
          FetchBaseQueryMeta>
      }
    }),
    deleteNetworkTemplate: build.mutation<CommonResult, RequestPayload>({
      query: commonQueryFn(
        ConfigTemplateUrlsInfo.deleteNetworkTemplate,
        ConfigTemplateUrlsInfo.deleteNetworkTemplateRbac
      ),
      // eslint-disable-next-line max-len
      invalidatesTags: [{ type: 'ConfigTemplate', id: 'LIST' }, { type: 'NetworkTemplate', id: 'LIST' }]
    }),
    getNetworkTemplateList: build.query<TableResult<Network>, RequestPayload>({
      query: (queryArgs: RequestPayload<{ fields?: string[] }>) => {
        const query = commonQueryFn(
          ConfigTemplateUrlsInfo.getNetworkTemplateList,
          ConfigTemplateUrlsInfo.getNetworkTemplateListRbac
        )

        const { payload, enableRbac = false } = queryArgs
        if (enableRbac && payload?.fields?.includes('venues')) {
          return query({
            ...queryArgs,
            payload: {
              ...payload,
              fields: [...payload.fields, 'venueApGroups']
            }
          })
        }

        return query(queryArgs)
      },
      providesTags: [{ type: 'NetworkTemplate', id: 'LIST' }],
      transformResponse (result: TableResult<Network | WifiNetwork>) {
        result.data = result.data.map(item => transformNetwork(item)) as Network[]
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
      query: commonQueryFn(ConfigTemplateUrlsInfo.addAAAPolicyTemplate, ConfigTemplateUrlsInfo.addAAAPolicyTemplateRbac),
      invalidatesTags: [{ type: 'ConfigTemplate', id: 'LIST' }, { type: 'AAATemplate', id: 'LIST' }]
    }),
    getAAAPolicyTemplate: build.query<AAAPolicyType, RequestPayload>({
      query: commonQueryFn(ConfigTemplateUrlsInfo.getAAAPolicyTemplate, ConfigTemplateUrlsInfo.getAAAPolicyTemplateRbac),
      providesTags: [{ type: 'AAATemplate', id: 'DETAIL' }]
    }),
    deleteAAAPolicyTemplate: build.mutation<CommonResult, RequestPayload>({
      query: commonQueryFn(ConfigTemplateUrlsInfo.deleteAAAPolicyTemplate, ConfigTemplateUrlsInfo.deleteAAAPolicyTemplateRbac),
      invalidatesTags: [{ type: 'ConfigTemplate', id: 'LIST' }, { type: 'AAATemplate', id: 'LIST' }]
    }),
    updateAAAPolicyTemplate: build.mutation<AAAPolicyType, RequestPayload>({
      query: commonQueryFn(ConfigTemplateUrlsInfo.updateAAAPolicyTemplate, ConfigTemplateUrlsInfo.updateAAAPolicyTemplateRbac),
      invalidatesTags: [{ type: 'ConfigTemplate', id: 'LIST' }, { type: 'AAATemplate', id: 'LIST' }]
    }),
    getAAAPolicyTemplateList: build.query<TableResult<AAAViewModalType>, RequestPayload>({
      query: commonQueryFn(ConfigTemplateUrlsInfo.getAAAPolicyTemplateList, ConfigTemplateUrlsInfo.queryAAAPolicyTemplateList),
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
    activateRadiusServerTemplate: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        return {
          ...createHttpRequest(ConfigTemplateUrlsInfo.activateRadiusServer, params)
        }
      },
      invalidatesTags: [{ type: 'NetworkTemplate', id: 'DETAIL' }, { type: 'NetworkRadiusServerTemplate', id: 'DETAIL' }]
    }),
    deactivateRadiusServerTemplate: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        return {
          ...createHttpRequest(ConfigTemplateUrlsInfo.deactivateRadiusServer, params)
        }
      },
      invalidatesTags: [{ type: 'NetworkTemplate', id: 'DETAIL' }, { type: 'NetworkRadiusServerTemplate', id: 'DETAIL' }]
    }),
    updateRadiusServerTemplateSettings: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        return {
          ...createHttpRequest(ConfigTemplateUrlsInfo.updateRadiusServerSettings, params),
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'NetworkTemplate', id: 'DETAIL' }, { type: 'NetworkRadiusServerTemplate', id: 'DETAIL' }]
    }),
    getRadiusServerTemplateSettings: build.query<NetworkRadiusSettings, RequestPayload>({
      query: ({ params }) => {
        return {
          ...createHttpRequest(ConfigTemplateUrlsInfo.getRadiusServerSettings, params)
        }
      },
      providesTags: [{ type: 'NetworkRadiusServerTemplate', id: 'DETAIL' }]
    }),
    addNetworkVenueTemplate: build.mutation<CommonResult, RequestPayload>({
      queryFn: addNetworkVenueFn(),
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'AddNetworkVenueTemplate',
            'UpdateVenueWifiNetworkTemplateSettings'
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
      query: commonQueryFn(ConfigTemplateUrlsInfo.deleteNetworkVenueTemplate, ConfigTemplateUrlsInfo.deleteNetworkVenueTemplateRbac),
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          const activities = [
            'DeleteNetworkVenueTemplate',
            'DeactivateWifiNetworkTemplateOnVenue'
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
      async queryFn ({ params, payload, enableRbac }, _queryApi, _extraOptions, fetchWithBQ) {
        const { oldPayload, newPayload } = payload as { oldPayload: NetworkVenue, newPayload: NetworkVenue }

        const updateNetworkVenueInfo = {
          ...createHttpRequest(
            enableRbac ? ConfigTemplateUrlsInfo.updateNetworkVenueTemplateRbac : ConfigTemplateUrlsInfo.updateNetworkVenue,
            params),
          body: JSON.stringify(newPayload)
        }
        const updateNetworkVenueQuery = await fetchWithBQ(updateNetworkVenueInfo)

        const itemProcessFn = (currentPayload: Record<string, unknown>, oldPayload: Record<string, unknown> | null, key: string, id: string) => {
          return {
            [key]: { new: currentPayload[key], old: oldPayload?.[key], id: id }
          } as ActionItem
        }

        const newApGroups = newPayload.apGroups as NetworkApGroup[]
        const oldApGroups = oldPayload.apGroups as NetworkApGroup[]

        const updateApGroups = [] as NetworkApGroup[]

        newApGroups.forEach((newApGroup: NetworkApGroup) => {
          const apGroupId = newApGroup.apGroupId as string
          const oldApGroup = find(oldApGroups, { apGroupId })
          const comparisonResult = comparePayload(
            newApGroup as unknown as Record<string, unknown>,
            oldApGroup as unknown as Record<string, unknown>,
            apGroupId,
            itemProcessFn
          )
          if (comparisonResult.updated.length) updateApGroups.push(newApGroup)
        })

        if (newApGroups.length > 0) {
          await Promise.all(newApGroups.map(apGroup => {
            const apGroupSettingReq = {
              ...createHttpRequest(
                ConfigTemplateUrlsInfo.activateVenueApGroupRbac, {
                  venueId: apGroup.venueId,
                  networkId: apGroup.networkId,
                  apGroupId: apGroup.apGroupId
                })
            }
            return fetchWithBQ(apGroupSettingReq)
          }))
        }

        if (updateApGroups.length > 0) {
          await Promise.all(updateApGroups.map(apGroup => {
            const apGroupSettingReq = {
              ...createHttpRequest(
                ConfigTemplateUrlsInfo.updateVenueApGroupsRbac, {
                  venueId: apGroup.venueId,
                  networkId: apGroup.networkId,
                  apGroupId: apGroup.apGroupId
                }),
              body: JSON.stringify(apGroup)
            }
            return fetchWithBQ(apGroupSettingReq)
          }))
        }

        return updateNetworkVenueQuery.data
          ? { data: updateNetworkVenueQuery.data as CommonResult }
          : { error: updateNetworkVenueQuery.error as FetchBaseQueryError }
      },
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
  useGetNetworkDeepTemplateQuery,
  useDeleteNetworkTemplateMutation,
  useGetNetworkTemplateListQuery,
  useLazyGetNetworkTemplateListQuery,
  useAddAAAPolicyTemplateMutation,
  useGetAAAPolicyTemplateQuery,
  useDeleteAAAPolicyTemplateMutation,
  useLazyGetAAAPolicyTemplateQuery,
  useUpdateAAAPolicyTemplateMutation,
  useGetAAAPolicyTemplateListQuery,
  useActivateRadiusServerTemplateMutation,
  useDeactivateRadiusServerTemplateMutation,
  useGetRadiusServerTemplateSettingsQuery,
  useUpdateRadiusServerTemplateSettingsMutation,
  useAddNetworkVenueTemplateMutation,
  useDeleteNetworkVenueTemplateMutation,
  useDeleteNetworkVenuesTemplateMutation,
  useUpdateNetworkVenueTemplateMutation,
  useAddNetworkVenueTemplatesMutation
} = configTemplateApi
