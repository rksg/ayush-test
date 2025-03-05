import { QueryReturnValue }                        from '@reduxjs/toolkit/query'
import { FetchBaseQueryError, FetchBaseQueryMeta } from '@reduxjs/toolkit/query/react'
/* eslint-disable max-len */
import { cloneDeep } from 'lodash'

import { MspEc, MspUrlsInfo } from '@acx-ui/msp/utils'
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
  ConfigTemplateDriftsResponse,
  transformWifiNetwork,
  ConfigTemplateCloneUrlsInfo,
  AllowedCloneTemplateTypes,
  VlanPool,
  EnforceableFields
} from '@acx-ui/rc/utils'
import { baseConfigTemplateApi }       from '@acx-ui/store'
import { RequestPayload }              from '@acx-ui/types'
import { batchApi, createHttpRequest } from '@acx-ui/utils'

import { networkApi }    from '../network'
import {
  fetchEnhanceRbacNetworkVenueList,
  fetchNetworkVlanPoolList,
  fetchRbacAccessControlPolicyNetwork,
  fetchRbacNetworkVenueList,
  updateNetworkVenueFn
} from '../networkVenueUtils'
import { commonQueryFn }                  from '../servicePolicy.utils'
import { addNetworkVenueFn }              from '../servicePolicy.utils/network'
import { handleCallbackWhenActivityDone } from '../utils'

import {
  useCasesToRefreshRadiusServerTemplateList, useCasesToRefreshTemplateList,
  useCasesToRefreshNetworkTemplateList
} from './constants'
import { AllowedEnforcedConfigTemplateTypes, configTemplateInstanceEnforcedApiMap } from './utils'

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
      invalidatesTags: [{ type: 'ConfigTemplate', id: 'LIST' }]
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
            payload: { isTemplate: true, page: 1, pageSize: 10000 }
          }

          const {
            error: networkVenuesListQueryError,
            networkDeep
          } = await fetchRbacNetworkVenueList(arg, fetchWithBQ)

          const {
            error: accessControlPolicyNetworkError,
            data: accessControlPolicyNetwork
          } = await fetchRbacAccessControlPolicyNetwork(arg, fetchWithBQ)

          if (networkVenuesListQueryError)
            return { error: networkVenuesListQueryError }

          if (accessControlPolicyNetworkError)
            return { error: accessControlPolicyNetworkError }

          if (networkDeep?.venues) {
            networkDeepData.venues = cloneDeep(networkDeep.venues)
          }

          if (accessControlPolicyNetwork?.data.length > 0 && networkDeepData.wlan?.advancedCustomization) {
            networkDeepData.wlan.advancedCustomization.accessControlEnable = true
            networkDeepData.wlan.advancedCustomization.accessControlProfileId = accessControlPolicyNetwork.data[0].id
          }
        }

        return networkQuery as QueryReturnValue<NetworkSaveData,
          FetchBaseQueryError,
          FetchBaseQueryMeta>
      },
      providesTags: [{ type: 'NetworkTemplate', id: 'DETAIL' }]
    }),
    // replace getNetworkDeepTemplate
    getNetworkDeepTemplateV2: build.query<NetworkSaveData | null, RequestPayload>({
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
            payload: { isTemplate: true, page: 1, pageSize: 10000 }
          }

          const { networkId } = params
          // fetch network vlan pool info
          const networkVlanPoolList = await fetchNetworkVlanPoolList([networkId], true, fetchWithBQ)
          const networkVlanPool = networkVlanPoolList?.data?.find(vlanPool => vlanPool.wifiNetworkIds?.includes(networkId))

          const {
            error: networkVenuesListQueryError,
            networkDeep
          } = await fetchEnhanceRbacNetworkVenueList(arg, fetchWithBQ)

          const {
            error: accessControlPolicyNetworkError,
            data: accessControlPolicyNetwork
          } = await fetchRbacAccessControlPolicyNetwork(arg, fetchWithBQ)

          if (networkVenuesListQueryError)
            return { error: networkVenuesListQueryError }

          if (accessControlPolicyNetworkError)
            return { error: accessControlPolicyNetworkError }

          if (networkDeep?.venues) {
            networkDeepData.venues = cloneDeep(networkDeep.venues)
          }

          if (networkVlanPool && networkDeepData.wlan?.advancedCustomization) {
            const { id , name } = networkVlanPool
            networkDeepData.wlan.advancedCustomization.vlanPool = { id , name } as VlanPool
          }

          if (accessControlPolicyNetwork?.data.length > 0 && networkDeepData.wlan?.advancedCustomization) {
            networkDeepData.wlan.advancedCustomization.accessControlEnable = true
            networkDeepData.wlan.advancedCustomization.accessControlProfileId = accessControlPolicyNetwork.data[0].id
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
      transformResponse (result: TableResult<Network | WifiNetwork>, _, args) {
        result.data = result.data.map(item => {
          return args?.enableRbac ? transformWifiNetwork(item as WifiNetwork) : transformNetwork(item)
        }) as Network[]
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
        await onSocketActivityChanged(requestArgs, api, async (msg) => {
          if (requestArgs.enableRbac) {
            const targetUseCase = 'ActivateWifiNetworkTemplateOnVenue'
            await handleCallbackWhenActivityDone({
              api,
              activityData: msg,
              useCase: targetUseCase,
              callback: requestArgs.callback,
              failedCallback: requestArgs.failedCallback
            })
          } else {
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
          }
        })
      },
      invalidatesTags: [{ type: 'VenueTemplate', id: 'DETAIL' }, { type: 'VenueTemplate', id: 'LIST' }]
    }),
    deleteNetworkVenueTemplate: build.mutation<CommonResult, RequestPayload>({
      query: commonQueryFn(ConfigTemplateUrlsInfo.deleteNetworkVenueTemplate, ConfigTemplateUrlsInfo.deleteNetworkVenueTemplateRbac),
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, async (msg) => {
          if (requestArgs.enableRbac) {
            const targetUseCase = 'DeactivateWifiNetworkTemplateOnVenue'
            await handleCallbackWhenActivityDone({
              api,
              activityData: msg,
              useCase: targetUseCase,
              callback: requestArgs.callback,
              failedCallback: requestArgs.failedCallback
            })
          } else {
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
          }
        })
      },
      invalidatesTags: [{ type: 'VenueTemplate', id: 'DETAIL' }, { type: 'VenueTemplate', id: 'LIST' }]
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
            'UpdateNetworkVenueTemplate',
            'UpdateVenueWifiNetworkTemplateSettings'
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
      invalidatesTags: [{ type: 'VenueTemplate', id: 'DETAIL' }, { type: 'VenueTemplate', id: 'LIST' }]
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

        const driftInstanceIdsRes = await fetchWithBQ({
          ...createHttpRequest(ConfigTemplateUrlsInfo.getDriftTenants, params)
        })

        if (driftInstanceIdsRes.error) {
          return { error: driftInstanceIdsRes.error as FetchBaseQueryError }
        }

        const instanceIds = (driftInstanceIdsRes.data as TableResult<{ tenantId: string }>).data.map(item => item.tenantId)

        if (instanceIds.length === 0) {
          return { data: [] }
        }

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
      }
    }),
    getDriftReport: build.query<ConfigTemplateDriftsResponse, RequestPayload>({
      query: commonQueryFn(ConfigTemplateUrlsInfo.getDriftReport)
    }),
    patchDriftReport: build.mutation<CommonResult, RequestPayload<{ templateId: string, tenantIds: string[] }>>({
      async queryFn (args, _queryApi, _extraOptions, fetchWithBQ) {
        const { payload } = args
        const requests = payload!.tenantIds.map(tenantId => ({
          params: { templateId: payload!.templateId, tenantId }
        }))
        return batchApi(ConfigTemplateUrlsInfo.patchDriftReport, requests, fetchWithBQ)
      }
    }),
    cloneTemplate: build.mutation<CommonResult, RequestPayload<{ type: AllowedCloneTemplateTypes, templateId: string, name: string }>>({
      query: (queryArgs) => {
        const { payload } = queryArgs
        const { type, templateId, name } = payload!
        const apiInfo = ConfigTemplateCloneUrlsInfo[type]
        return {
          ...createHttpRequest(apiInfo, { templateId }),
          body: JSON.stringify({ name })
        }
      },
      invalidatesTags: [{ type: 'ConfigTemplate', id: 'LIST' }]
    }),
    updateEnforcementStatus: build.mutation<CommonResult, RequestPayload<{ enabled: boolean }>>({
      query: ({ params, payload }) => {
        return {
          ...createHttpRequest(ConfigTemplateUrlsInfo.updateEnforcement, params),
          body: JSON.stringify({ isEnforced: payload?.enabled })
        }
      }
    }),
    getConfigTemplateInstanceEnforced: build.query<EnforceableFields, RequestPayload<{ instanceId: string, type: AllowedEnforcedConfigTemplateTypes }>>({
      query: ({ params, payload }) => {
        const { instanceId, type } = payload!
        const apiInfo = configTemplateInstanceEnforcedApiMap[type]
        return {
          ...createHttpRequest(apiInfo, params),
          body: JSON.stringify({
            fields: ['id', 'isEnforced'],
            filters: { id: [instanceId] }
          })
        }
      },
      transformResponse (result: TableResult<EnforceableFields>) {
        return {
          isEnforced: result.data[0]?.isEnforced ?? false
        }
      }
    })
  })
})
export const {
  useGetConfigTemplateListQuery,
  useApplyConfigTemplateMutation,
  useAddNetworkTemplateMutation,
  useUpdateNetworkTemplateMutation,
  useGetNetworkDeepTemplateQuery,
  useGetNetworkDeepTemplateV2Query,
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
  useLazyGetDriftReportQuery,
  usePatchDriftReportMutation,
  useCloneTemplateMutation,
  useUpdateEnforcementStatusMutation,
  useGetConfigTemplateInstanceEnforcedQuery
} = configTemplateApi
