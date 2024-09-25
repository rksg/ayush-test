import { QueryReturnValue }                        from '@reduxjs/toolkit/dist/query/baseQueryTypes'
import { FetchBaseQueryError, FetchBaseQueryMeta } from '@reduxjs/toolkit/dist/query/react'
/* eslint-disable max-len */
import { cloneDeep } from 'lodash'

import { MspEc, MspUrlsInfo }     from '@acx-ui/msp/utils'
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
  TemplateInstanceDriftResponse
} from '@acx-ui/rc/utils'
import { baseConfigTemplateApi } from '@acx-ui/store'
import { RequestPayload }        from '@acx-ui/types'
import { createHttpRequest }     from '@acx-ui/utils'

import { networkApi }                                      from '../network'
import { fetchRbacNetworkVenueList, updateNetworkVenueFn } from '../networkVenueUtils'
import { commonQueryFn }                                   from '../servicePolicy.utils'
import { addNetworkVenueFn }                               from '../servicePolicy.utils/network'

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
      invalidatesTags: [{ type: 'ConfigTemplate', id: 'LIST' }, { type: 'ConfigTemplate', id: 'DRIFT' }]
    }),
    addNetworkTemplate: build.mutation<CommonResult, RequestPayload>({
      query: commonQueryFn(
        ConfigTemplateUrlsInfo.addNetworkTemplate,
        ConfigTemplateUrlsInfo.addNetworkTemplateRbac
      ),
      invalidatesTags: [{ type: 'ConfigTemplate', id: 'LIST' }, { type: 'NetworkTemplate', id: 'LIST' }]
    }),
    updateNetworkTemplate: build.mutation<CommonResult, RequestPayload>({
      query: commonQueryFn(
        ConfigTemplateUrlsInfo.updateNetworkTemplate,
        ConfigTemplateUrlsInfo.updateNetworkTemplateRbac
      ),
      invalidatesTags: [{ type: 'ConfigTemplate', id: 'LIST' }, { type: 'NetworkTemplate', id: 'LIST' }]
    }),
    getNetworkDeepTemplate: build.query<NetworkSaveData | null, RequestPayload>({
      async queryFn ({ params, enableRbac }, _queryApi, _extraOptions, fetchWithBQ) {
        if (!params?.networkId) return Promise.resolve({ data: null } as QueryReturnValue<
          null,
          FetchBaseQueryError,
          FetchBaseQueryMeta
        >)

        const networkQuery = await fetchWithBQ(
          createHttpRequest(
            enableRbac ? ConfigTemplateUrlsInfo.getNetworkTemplateRbac : ConfigTemplateUrlsInfo.getNetworkTemplate,
            params
          )
        )
        const networkDeepData = networkQuery.data as NetworkSaveData

        if (networkDeepData && enableRbac) {
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
      },
      providesTags: [{ type: 'NetworkTemplate', id: 'DETAIL' }]
    }),
    deleteNetworkTemplate: build.mutation<CommonResult, RequestPayload>({
      query: commonQueryFn(
        ConfigTemplateUrlsInfo.deleteNetworkTemplate,
        ConfigTemplateUrlsInfo.deleteNetworkTemplateRbac
      ),
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
            api.dispatch(configTemplateApi.util.invalidateTags([{ type: 'NetworkTemplate', id: 'LIST' }]))
          })
        })
      },
      extraOptions: { maxRetries: 5 }
    }),
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
    }),
    getDriftInstances: build.query<Array<{ id: string, name: string }>, RequestPayload>({
      async queryFn ({ params, payload }, _queryApi, _extraOptions, fetchWithBQ) {
        const resolvedPayload = payload as { filters?: Record<string, string[]> }

        // const driftInstanceIdsRes = await fetchWithBQ({
        //   ...createHttpRequest(MspUrlsInfo.getMspCustomersList, params),
        //   body: JSON.stringify({
        //     fields: ['id'],
        //     filters: {
        //       ...resolvedPayload.filters,
        //       id: [
        //         'a48e45a0331b4c7cac85965e3a72021e',
        //         '20bbe08b90124a26983e6ef811127e6f',
        //         '1969e24ce9af4348833968096ff6cb47',
        //         '12a7eb7ac51444ed944c5c8f53526cd5',
        //         '2c89c84b71ad49398f2ef03ce16c410f',
        //         'a80624a0549440868a846626084f57c9',
        //         'd50450cf66824aaeb45a14e0e594e2de',
        //         'df9d828032274e8f8f6af84736bca3f8',
        //         'ed956445cbcf4db0b032ebf88ac4bf34',
        //         '884b986f9dfe4f8598bd5b2c463c1620'
        //       ]
        //     }
        //   })
        // })

        // if (driftInstanceIdsRes.error) {
        //   return { error: driftInstanceIdsRes.error as FetchBaseQueryError }
        // }

        // const instanceIds = (driftInstanceIdsRes.data as TableResult<MspEc>).data.map(i => i.id)
        const instanceIds = [
          'a48e45a0331b4c7cac85965e3a72021e',
          '20bbe08b90124a26983e6ef811127e6f',
          '1969e24ce9af4348833968096ff6cb47',
          '12a7eb7ac51444ed944c5c8f53526cd5',
          '2c89c84b71ad49398f2ef03ce16c410f',
          'a80624a0549440868a846626084f57c9',
          'd50450cf66824aaeb45a14e0e594e2de',
          'df9d828032274e8f8f6af84736bca3f8',
          'ed956445cbcf4db0b032ebf88ac4bf34',
          '884b986f9dfe4f8598bd5b2c463c1620'
        ]

        const driftInstancesRes = await fetchWithBQ({
          ...createHttpRequest(MspUrlsInfo.getMspCustomersList, params),
          body: JSON.stringify({
            fields: ['id', 'name'],
            sortField: 'name',
            sortOrder: 'ASC',
            filters: {
              ...resolvedPayload.filters,
              id: instanceIds
            },
            page: 1,
            pageSize: 1000
          })
        })

        if (driftInstancesRes.error) {
          return { error: driftInstancesRes.error as FetchBaseQueryError }
        }

        return { data: (driftInstancesRes.data as TableResult<MspEc>).data }
      },
      providesTags: [{ type: 'ConfigTemplate', id: 'DRIFT' }]
    }),
    getDriftData: build.query<TemplateInstanceDriftResponse, RequestPayload>({
      // async queryFn ({ params, payload }, _queryApi, _extraOptions, fetchWithBQ) {
      async queryFn () {
        const result = await new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              WifiNetwork: {
                '/wlan/advancedCustomization/qosMirroringEnabled': {
                  template: true,
                  instance: false
                },
                '/wlan/ssid': {
                  template: 'raymond-test-int',
                  instance: 'nms-raymond-test-int.'
                },
                '/name': {
                  template: 'raymond-test-int',
                  instance: 'nms-raymond-test-int.'
                }
              },
              RadiusOnWifiNetwork: {
                '/id': {
                  template: 'ef3644beccdf48ccb4e8cf3ed296070f',
                  instance: 'dc2146381a874d04a824bdd8c7bb991d'
                },
                '/idName': {
                  template: 'radius-template-name',
                  instance: 'radius-server-name'
                }
              }
            })
          }, 1500)
        })

        return { data: result as TemplateInstanceDriftResponse }
      },
      providesTags: [{ type: 'ConfigTemplate', id: 'DRIFT' }]
    })
  })
})
export const {
  useGetConfigTemplateListQuery,
  useApplyConfigTemplateMutation,
  useAddNetworkTemplateMutation,
  useUpdateNetworkTemplateMutation,
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
  useAddNetworkVenueTemplatesMutation,
  useGetDriftInstancesQuery,
  useLazyGetDriftDataQuery
} = configTemplateApi
