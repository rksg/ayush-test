/* eslint-disable max-len */
import { FetchBaseQueryError } from '@reduxjs/toolkit/query/react'
import { uniq }                from 'lodash'

import {
  AccessSwitch,
  CommonResult,
  DistributionSwitch,
  PersonalIdentityNetworks,
  PersonalIdentityNetworksViewData,
  NetworkSegmentationUrls,
  NetworkSegmentationRbacUrls,
  NewTableResult,
  onActivityMessageReceived,
  onSocketActivityChanged,
  SwitchLite,
  TableResult,
  transferToTableResult,
  WebAuthTemplate,
  WebAuthTemplateTableData,
  EdgeClusterStatus,
  EdgeUrlsInfo,
  PropertyUrlsInfo,
  PropertyConfigs
} from '@acx-ui/rc/utils'
import { baseNsgApi }                          from '@acx-ui/store'
import { RequestPayload }                      from '@acx-ui/types'
import { createHttpRequest, ignoreErrorModal } from '@acx-ui/utils'

import { serviceApi }                                        from './service'
import { handleCallbackWhenActivityDone, isPayloadHasField } from './utils'

const customHeaders = {
  v1: {
    'Content-Type': 'application/vnd.ruckus.v1+json',
    'Accept': 'application/vnd.ruckus.v1+json'
  },
  v1001: {
    'Content-Type': 'application/vnd.ruckus.v1.1+json',
    'Accept': 'application/vnd.ruckus.v1.1+json'
  }
}

enum EdgePinActivityEnum {
  ADD = 'Create PIN',
  UPDATE = 'Update PIN',
  DELETE = 'Delete PIN',
  ACTIVATE_NETWORK = 'Activate network',
  DEACTIVATE_NETWORK = 'Deactivate network',
}

const getNsgUrls = (enableRbac?: boolean | unknown) => {
  return enableRbac ? NetworkSegmentationRbacUrls : NetworkSegmentationUrls
}

export const nsgApi = baseNsgApi.injectEndpoints({
  endpoints: (build) => ({
    createNetworkSegmentationGroup: build.mutation<CommonResult, RequestPayload>({
      query: ({ payload }) => {
        const req = createHttpRequest(NetworkSegmentationUrls.createNetworkSegmentationGroup, undefined, {
          ...ignoreErrorModal
        })
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Networksegmentation', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, async (msg) => {
          await handleCallbackWhenActivityDone({
            api,
            activityData: msg,
            useCase: EdgePinActivityEnum.ADD,
            stepName: 'Add PIN',
            callback: requestArgs.callback,
            failedCallback: requestArgs.failedCallback
          })
        })
      }
    }),
    getNetworkSegmentationViewDataList: build.query<TableResult<PersonalIdentityNetworksViewData>, RequestPayload>({
      async queryFn ({ params, payload }, _queryApi, _extraOptions, fetchWithBQ) {
        const pinRequest = createHttpRequest(NetworkSegmentationUrls.getNetworkSegmentationStatsList, params)
        const pinQuery = await fetchWithBQ({
          ...pinRequest,
          body: payload
        })
        const pinList = pinQuery.data as TableResult<PersonalIdentityNetworksViewData>

        // fetch venue id & name
        if (isPayloadHasField(payload, 'venueId')) {
          const edgeClusterIds = uniq(pinList.data.flatMap(item => item.edgeClusterInfos?.map(edge => edge.edgeClusterId)))
            .filter(i => i)
          if (edgeClusterIds.length) {
            const clusterReq = createHttpRequest(EdgeUrlsInfo.getEdgeClusterStatusList)
            const edgeClusterQuery = await fetchWithBQ({
              ...clusterReq,
              body: {
                fields: [
                  'name',
                  'clusterId',
                  'venueId'
                ],
                filters: { clusterId: edgeClusterIds }
              }
            })

            const clusterList = edgeClusterQuery.data as TableResult<EdgeClusterStatus>
            aggregateVenueInfo(pinList, clusterList)

            const venueIds = clusterList.data.map(cluster => cluster.venueId)
            const personaReq = createHttpRequest(PropertyUrlsInfo.getPropertyConfigsQuery, params,
              { Accept: 'application/hal+json' })
            const personaQuery = await fetchWithBQ({
              ...personaReq,
              body: {
                filters: { venueId: venueIds },
                sortField: 'venueName',
                sortOrder: 'ASC',
                page: 1,
                pageSize: 10000
              }
            })

            const personaList = personaQuery.data as TableResult<PropertyConfigs>
            aggregatePersonaId(pinList, personaList)
          }
        }

        return pinQuery.data
          ? { data: pinList }
          : { error: pinQuery.error as FetchBaseQueryError }
      },
      providesTags: [{ type: 'Networksegmentation', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, [
            EdgePinActivityEnum.ADD,
            EdgePinActivityEnum.UPDATE,
            EdgePinActivityEnum.DELETE,
            EdgePinActivityEnum.ACTIVATE_NETWORK,
            EdgePinActivityEnum.DEACTIVATE_NETWORK
          ], () => {
            api.dispatch(serviceApi.util.invalidateTags([
              { type: 'Service', id: 'LIST' }
            ]))
            api.dispatch(nsgApi.util.invalidateTags([
              { type: 'Networksegmentation', id: 'LIST' }
            ]))
          })
        })
      },
      extraOptions: { maxRetries: 5 }
    }),
    deleteNetworkSegmentationGroup: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(NetworkSegmentationUrls.deleteNetworkSegmentationGroup, params)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'Networksegmentation', id: 'LIST' }]
    }),
    updateNetworkSegmentationGroup: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(
          NetworkSegmentationUrls.updateNetworkSegmentationGroup,
          params,
          {
            ...ignoreErrorModal
          }
        )
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Networksegmentation', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, async (msg) => {
          await handleCallbackWhenActivityDone({
            api,
            activityData: msg,
            useCase: EdgePinActivityEnum.UPDATE,
            callback: requestArgs.callback,
            failedCallback: requestArgs.failedCallback
          })
        })
      }
    }),
    getNetworkSegmentationGroupById: build.query<PersonalIdentityNetworks, RequestPayload>({
      async queryFn ({ params }, _queryApi, _extraOptions, fetchWithBQ) {
        const pinRequest = createHttpRequest(NetworkSegmentationUrls.getNetworkSegmentationGroupById, params)
        const pinQuery = await fetchWithBQ(pinRequest)
        const pinData = pinQuery.data as PersonalIdentityNetworks

        // append network data
        const pinViewmodelReq = createHttpRequest(NetworkSegmentationUrls.getNetworkSegmentationStatsList)
        const pinViewmodelQuery = await fetchWithBQ({
          ...pinViewmodelReq,
          body: {
            fields: ['id', 'networkIds'],
            filters: { id: [params?.serviceId!] }
          }
        })

        const pinViewmodel = pinViewmodelQuery.data as TableResult<PersonalIdentityNetworksViewData>
        if (pinViewmodel)
          pinData.networkIds = pinViewmodel.data[0]?.networkIds

        let pinSwitch
        // fetch venue id & name
        const edgeClusterId = pinData?.edgeClusterInfos?.map(edge => edge.edgeClusterId)
        if (edgeClusterId) {
          const clusterReq = createHttpRequest(EdgeUrlsInfo.getEdgeClusterStatusList)
          const edgeClusterQuery = await fetchWithBQ({
            ...clusterReq,
            body: {
              fields: [
                'clusterId',
                'venueId'
              ],
              filters: { clusterId: edgeClusterId }
            }
          })

          const clusterList = edgeClusterQuery.data as TableResult<EdgeClusterStatus>
          const venueId = clusterList.data[0].venueId

          const personaReq = createHttpRequest(
            PropertyUrlsInfo.getPropertyConfigs,
            { venueId },
            { Accept: 'application/hal+json' }
          )
          const personaQuery = await fetchWithBQ(personaReq)
          const personaList = personaQuery.data as PropertyConfigs

          pinData.venueInfos = [{
            venueId: venueId ?? '',
            venueName: clusterList.data[0]?.venueName ?? '',
            personaGroupId: personaList?.personaGroupId ?? ''
          }]

          const pinSwitchRequest = createHttpRequest(
            NetworkSegmentationUrls.getSwitchInfoByNSGId, {
              ...params,
              venueId
            })
          const pinSwitchQuery = await fetchWithBQ(pinSwitchRequest)
          pinSwitch = pinSwitchQuery.data as {
            distributionSwitches: DistributionSwitch[]
            accessSwitches: AccessSwitch[]
          }
        }

        return pinData
          ? { data: pinSwitch ? aggregatedNSGData(pinData, pinSwitch) : pinData }
          : { error: pinQuery.error as FetchBaseQueryError }
      }
    }),
    // eslint-disable-next-line max-len
    getNetworkSegmentationGroupList: build.query<TableResult<PersonalIdentityNetworks>, RequestPayload>({
      query: ({ params }) => {
        const req =
          createHttpRequest(NetworkSegmentationUrls.getNetworkSegmentationGroupList, params)
        return {
          ...req
        }
      },
      transformResponse (result: NewTableResult<PersonalIdentityNetworks>) {
        return transferToTableResult<PersonalIdentityNetworks>(result)
      }
    }),

    getWebAuthTemplate: build.query<WebAuthTemplate, RequestPayload>({
      query: ({ params, enableRbac }) => {
        const headers = enableRbac ? customHeaders.v1001 : {}
        const nsgUrls = getNsgUrls(enableRbac)
        const req = createHttpRequest( nsgUrls.getWebAuthTemplate, params, headers)
        return {
          ...req
        }
      }
    }),
    getWebAuthTemplateSwitches: build.query<{
      switchVenueInfos?: SwitchLite[]
    }, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const headers = enableRbac ? customHeaders.v1001 : {}
        const nsgUrls = getNsgUrls(enableRbac)
        const req = createHttpRequest( nsgUrls.getWebAuthTemplateSwitches, params, headers)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      }
    }),
    webAuthTemplateList: build.query<TableResult<WebAuthTemplateTableData>, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const headers = enableRbac ? customHeaders.v1001 : {}
        const nsgUrls = getNsgUrls(enableRbac)
        const req = createHttpRequest( nsgUrls.getWebAuthTemplateList, params, headers)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      providesTags: [{ type: 'WebAuthNSG', id: 'LIST' }],
      extraOptions: { maxRetries: 5 }
    }),
    createWebAuthTemplate: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const headers = enableRbac ? customHeaders.v1001 : {}
        const nsgUrls = getNsgUrls(enableRbac)
        const req = createHttpRequest( nsgUrls.addWebAuthTemplate, params, headers)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'WebAuthNSG', id: 'LIST' }]
    }),
    updateWebAuthTemplate: build.mutation<WebAuthTemplate, RequestPayload<WebAuthTemplate>>({
      query: ({ params, payload, enableRbac }) => {
        const headers = enableRbac ? customHeaders.v1001 : {}
        const nsgUrls = getNsgUrls(enableRbac)
        const req = createHttpRequest( nsgUrls.updateWebAuthTemplate, params, headers)
        return {
          ...req,
          body: JSON.stringify(payload)
        }
      },
      invalidatesTags: [{ type: 'WebAuthNSG', id: 'LIST' }]
    }),
    deleteWebAuthTemplate: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, enableRbac }) => {
        const headers = enableRbac ? customHeaders.v1001 : {}
        const nsgUrls = getNsgUrls(enableRbac)
        const req = createHttpRequest( nsgUrls.deleteWebAuthTemplate, params, headers)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'WebAuthNSG', id: 'LIST' }]
    }),
    getAvailableSwitches: build.query<{
      switchViewList: SwitchLite[]
    }, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest( NetworkSegmentationUrls.getAvailableSwitches, params)
        return {
          ...req
        }
      }
    }),
    validateDistributionSwitchInfo: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(NetworkSegmentationUrls.validateDistributionSwitchInfo,params)
        return {
          ...req,
          body: payload
        }
      }
    }),
    validateAccessSwitchInfo: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(NetworkSegmentationUrls.validateAccessSwitchInfo, params)
        return {
          ...req,
          body: payload
        }
      }
    }),
    activatePinNetwork: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(NetworkSegmentationUrls.activatePinNetwork, params)
        return {
          ...req,
          body: payload
        }
      }
    }),
    deactivatePinNetwork: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(NetworkSegmentationUrls.deactivatePinNetwork, params)
        return {
          ...req,
          body: payload
        }
      }
    })
  })
})

const aggregatedNSGData = (
  nsg: PersonalIdentityNetworks,
  nsgSwitch: {
    distributionSwitches: DistributionSwitch[]
    accessSwitches: AccessSwitch[]
  }
) => {
  let distributionSwitchInfos: DistributionSwitch[]
  let accessSwitchInfos: AccessSwitch[]
  let dsMap: { [key: string]: AccessSwitch[] } = {}

  accessSwitchInfos = nsg.accessSwitchInfos?.map(as=>{
    const asDetail = nsgSwitch.accessSwitches.find(item=>item.id === as.id)
    const dsId = asDetail!.distributionSwitchId
    const ret: AccessSwitch = { ...as, ...asDetail }
    if (!dsMap.hasOwnProperty(dsId)) {
      dsMap[dsId] = []
    }
    dsMap[dsId].push(ret)
    return ret
  }) || []
  distributionSwitchInfos = nsg.distributionSwitchInfos?.map(ds=>{
    const dsDetail = nsgSwitch.distributionSwitches.find(item=>item.id === ds.id)
    const ret: DistributionSwitch = { ...ds, ...dsDetail, accessSwitches: dsMap[ds.id] }
    return ret
  }) || []

  return { ...nsg, distributionSwitchInfos, accessSwitchInfos } as PersonalIdentityNetworks
}

export const aggregateVenueInfo = (
  pinList?: TableResult<PersonalIdentityNetworksViewData>,
  clusterList?: TableResult<EdgeClusterStatus>
) => {
  const clusterListData = clusterList?.data
  pinList?.data?.forEach(item => {
    const target = clusterListData?.find(clusterItem =>
      clusterItem.clusterId === item.edgeClusterInfos[0].edgeClusterId)

    item.venueInfos = [{
      venueId: target?.venueId ?? '',
      venueName: target?.venueName ?? ''
    }]
  })
}

export const aggregatePersonaId = (
  pinList?: TableResult<PersonalIdentityNetworksViewData>,
  personaList?: TableResult<PropertyConfigs>
) => {
  const personaListData = personaList?.data
  pinList?.data?.forEach(item => {
    const target = personaListData?.find(persona =>
      persona.venueId === item.venueInfos[0].venueId)

    item.venueInfos[0].personaGroupId = target?.personaGroupId
  })
}

export const {
  useCreateNetworkSegmentationGroupMutation,
  useGetNetworkSegmentationViewDataListQuery,
  useDeleteNetworkSegmentationGroupMutation,
  useUpdateNetworkSegmentationGroupMutation,
  useLazyGetNetworkSegmentationGroupByIdQuery,
  useGetNetworkSegmentationGroupByIdQuery,
  useGetNetworkSegmentationGroupListQuery,
  useGetWebAuthTemplateQuery,
  useGetWebAuthTemplateSwitchesQuery,
  useLazyGetWebAuthTemplateQuery,
  useWebAuthTemplateListQuery,
  useCreateWebAuthTemplateMutation,
  useUpdateWebAuthTemplateMutation,
  useDeleteWebAuthTemplateMutation,
  useGetAvailableSwitchesQuery,
  useValidateDistributionSwitchInfoMutation,
  useValidateAccessSwitchInfoMutation,
  useActivatePinNetworkMutation,
  useDeactivatePinNetworkMutation
} = nsgApi
