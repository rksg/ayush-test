import { QueryReturnValue }                        from '@reduxjs/toolkit/dist/query/baseQueryTypes'
import { FetchBaseQueryError, FetchBaseQueryMeta } from '@reduxjs/toolkit/query/react'

import {
  CommonUrlsInfo,
  NetworkVenue,
  NetworkSaveData,
  onSocketActivityChanged,
  onActivityMessageReceived,
  TableResult,
  Dashboard,
  Network,
  Venue,
  NetworkDetailHeader,
  CommonResult,
  NetworkDetail,
  RadiusValidate,
  WifiUrlsInfo,
  ExternalProviders,
  enableNewApi
} from '@acx-ui/rc/utils'
import { baseNetworkApi }    from '@acx-ui/store'
import { RequestPayload }    from '@acx-ui/types'
import { createHttpRequest } from '@acx-ui/utils'

const RKS_NEW_UI = {
  'x-rks-new-ui': true
}

export const networkApi = baseNetworkApi.injectEndpoints({
  endpoints: (build) => ({
    networkList: build.query<TableResult<Network>, RequestPayload>({
      query: ({ params, payload }) => {
        const networkListReq = createHttpRequest(CommonUrlsInfo.getVMNetworksList, params)
        return {
          ...networkListReq,
          body: payload
        }
      },
      transformResponse (result: TableResult<Network>) {
        result.data = result.data.map(item => ({
          ...item,
          activated: item.activated ?? { isActivated: false },
          ...(item?.dsaeOnboardNetwork &&
            { children: [{ ...item?.dsaeOnboardNetwork,
              isOnBoarded: true,
              id: item?.name + 'onboard' } as Network] })
        })) as Network[]
        return result
      },
      keepUnusedDataFor: 0,
      providesTags: [{ type: 'Network', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg,
            ['AddNetwork', 'UpdateNetwork', 'DeleteNetwork'], () => {
              api.dispatch(networkApi.util.invalidateTags([{ type: 'Network', id: 'LIST' }]))
            })
        })
      }
    }),
    addNetwork: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const createNetworkReq = createHttpRequest(WifiUrlsInfo.addNetworkDeep, params, RKS_NEW_UI)
        return {
          ...createNetworkReq,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Network', id: 'LIST' }]
    }),
    updateNetwork: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(WifiUrlsInfo.updateNetworkDeep, params, RKS_NEW_UI)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Network', id: 'LIST' }, { type: 'Network', id: 'DETAIL' }]
    }),
    deleteNetwork: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(WifiUrlsInfo.deleteNetwork, params)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'Network', id: 'LIST' }]
    }),
    addNetworkVenue: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(WifiUrlsInfo.addNetworkVenue, params, RKS_NEW_UI)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Venue', id: 'LIST' }, { type: 'Network', id: 'DETAIL' }]
    }),
    addNetworkVenues: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(WifiUrlsInfo.addNetworkVenues, params, RKS_NEW_UI)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Venue', id: 'LIST' }, { type: 'Network', id: 'DETAIL' }]
    }),
    updateNetworkVenue: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(WifiUrlsInfo.updateNetworkVenue, params, RKS_NEW_UI)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Venue', id: 'LIST' }, { type: 'Network', id: 'DETAIL' }]
    }),
    deleteNetworkVenue: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(WifiUrlsInfo.deleteNetworkVenue, params, RKS_NEW_UI)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'Venue', id: 'LIST' }, { type: 'Network', id: 'DETAIL' }]
    }),
    deleteNetworkVenues: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(WifiUrlsInfo.deleteNetworkVenues, params, RKS_NEW_UI)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Venue', id: 'LIST' }, { type: 'Network', id: 'DETAIL' }]
    }),
    getNetwork: build.query<NetworkSaveData | null, RequestPayload>({
      async queryFn ({ params }, _queryApi, _extraOptions, fetchWithBQ) {
        if (!params?.networkId) return Promise.resolve({ data: null } as QueryReturnValue<
          null,
          FetchBaseQueryError,
          FetchBaseQueryMeta
        >)
        const networkQuery = await fetchWithBQ(
          createHttpRequest(WifiUrlsInfo.getNetwork, params, RKS_NEW_UI)
        )
        return networkQuery as QueryReturnValue<NetworkSaveData,
        FetchBaseQueryError,
        FetchBaseQueryMeta>
      },
      providesTags: [{ type: 'Network', id: 'DETAIL' }]
    }),
    networkDetailHeader: build.query<NetworkDetailHeader, RequestPayload>({
      query: ({ params }) => {
        const networkDetailReq = createHttpRequest(CommonUrlsInfo.getNetworksDetailHeader, params)
        return {
          ...networkDetailReq
        }
      },
      providesTags: [{ type: 'Network', id: 'DETAIL' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg,
            [
              'AddNetworkVenue',
              'DeleteNetworkVenue',
              'UpdateNetworkDeep',
              'UpdateNetworkVenue'
            ], () => {
              api.dispatch(networkApi.util.invalidateTags([{ type: 'Network', id: 'DETAIL' }]))
            })
        })
      }
    }),
    getVenueNetworkApGroup: build.query<TableResult<NetworkVenue>, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(CommonUrlsInfo.venueNetworkApGroup, params)
        return {
          ...req,
          body: payload
        }
      }
    }),
    apNetworkList: build.query<TableResult<Network>, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(CommonUrlsInfo.getApNetworkList, params)
        return {
          ...req,
          body: payload
        }
      },
      providesTags: [{ type: 'Network', id: 'LIST' }]
    }),
    networkVenueList: build.query<TableResult<Venue>, RequestPayload>({
      async queryFn (arg, _queryApi, _extraOptions, fetchWithBQ) {
        const networkVenuesListInfo = {
          ...createHttpRequest(CommonUrlsInfo.getNetworksVenuesList, arg.params),
          body: arg.payload
        }
        const networkVenuesListQuery = await fetchWithBQ(networkVenuesListInfo)
        const networkVenuesList = networkVenuesListQuery.data as TableResult<Venue>

        const networkDeepListInfo = {
          ...createHttpRequest(CommonUrlsInfo.getNetworkDeepList, arg.params),
          body: [arg.params?.networkId]
        }
        const networkDeepListQuery = await fetchWithBQ(networkDeepListInfo)
        const networkDeepList = networkDeepListQuery.data as { response: NetworkDetail[] }
        const networkDeep = Array.isArray(networkDeepList?.response) ?
          networkDeepList?.response[0] : undefined

        let networkVenuesApGroupList = {} as { response: NetworkVenue[] }

        if (networkDeep?.wlan?.ssid && arg.params?.networkId) {
          const networkVenuesApGroupInfo = {
            ...createHttpRequest(CommonUrlsInfo.venueNetworkApGroup, arg.params),
            body: networkVenuesList.data.map(item => ({
              venueId: item.id,
              ssids: [networkDeep?.wlan?.ssid],
              networkId: arg.params?.networkId
            }))
          }
          const networkVenuesApGroupQuery = await fetchWithBQ(networkVenuesApGroupInfo)
          networkVenuesApGroupList = networkVenuesApGroupQuery.data as { response: NetworkVenue[] }
        }

        const aggregatedList = aggregatedNetworksVenueData(
          networkVenuesList, networkVenuesApGroupList, networkDeep)

        return networkVenuesListQuery.data
          ? { data: aggregatedList }
          : { error: networkVenuesListQuery.error as FetchBaseQueryError }
      },
      providesTags: [{ type: 'Venue', id: 'LIST' }],
      async onCacheEntryAdded (requestArgs, api) {
        await onSocketActivityChanged(requestArgs, api, (msg) => {
          onActivityMessageReceived(msg, ['UpdateNetworkDeep'], () => {
            api.dispatch(networkApi.util.invalidateTags([{ type: 'Venue', id: 'LIST' }]))
          })
        })
      }
    }),
    venueNetworkList: build.query<TableResult<Network>, RequestPayload>({
      async queryFn (arg, _queryApi, _extraOptions, fetchWithBQ) {
        const venueNetworkListInfo = {
          ...createHttpRequest(CommonUrlsInfo.getVenueNetworkList, arg.params),
          body: arg.payload
        }
        const venueNetworkListQuery = await fetchWithBQ(venueNetworkListInfo)
        const networkList = venueNetworkListQuery.data as TableResult<Network>

        let venueNetworkApGroupList = {} as { response: NetworkVenue[] }
        let networkDeepListList = {} as { response: NetworkDetail[] }

        if (networkList && networkList.data.length > 0) {
          const venueNetworkApGroupInfo = {
            ...createHttpRequest(CommonUrlsInfo.venueNetworkApGroup, arg.params),
            body: networkList.data.map(item => ({
              networkId: item.id,
              ssids: [item.ssid],
              venueId: arg.params?.venueId
            }))
          }
          const venueNetworkApGroupQuery = await fetchWithBQ(venueNetworkApGroupInfo)
          venueNetworkApGroupList = venueNetworkApGroupQuery.data as { response: NetworkVenue[] }

          const networkDeepListInfo = {
            ...createHttpRequest(CommonUrlsInfo.getNetworkDeepList, arg.params),
            body: networkList.data.map(item => item.id)
          }
          const networkDeepListQuery = await fetchWithBQ(networkDeepListInfo)
          networkDeepListList = networkDeepListQuery.data as { response: NetworkDetail[] }
        }

        const aggregatedList = aggregatedVenueNetworksData(
          networkList, venueNetworkApGroupList, networkDeepListList)

        return venueNetworkListQuery.data
          ? { data: aggregatedList }
          : { error: venueNetworkListQuery.error as FetchBaseQueryError }
      },
      providesTags: [{ type: 'Network', id: 'DETAIL' }]
    }),
    venueNetworkActivationsDataList: build.query<NetworkSaveData[], RequestPayload>({
      async queryFn (arg, _queryApi, _extraOptions, fetchWithBQ) {
        const networkActivations = {
          ...createHttpRequest(CommonUrlsInfo.networkActivations, arg.params),
          body: arg.payload
        }
        const networkActivationsQuery = await fetchWithBQ(networkActivations)
        const networkVenueList = networkActivationsQuery.data as TableResult<NetworkVenue>

        let networkDeepList = { response: [] } as { response: NetworkSaveData[] }

        if (networkVenueList && networkVenueList.data && networkVenueList.data.length > 0) {
          const networkDeepListInfo = {
            ...createHttpRequest(CommonUrlsInfo.getNetworkDeepList, arg.params),
            body: networkVenueList.data.map(item => item.networkId)
          }
          const networkDeepListQuery = await fetchWithBQ(networkDeepListInfo)
          networkDeepList = networkDeepListQuery.data as { response: NetworkSaveData[] }
        }

        return { data: networkDeepList.response }
      },
      providesTags: [{ type: 'Network', id: 'DETAIL' }]
    }),
    dashboardOverview: build.query<Dashboard, RequestPayload>({
      query: ({ params }) => {
        const dashboardOverviewReq = createHttpRequest(CommonUrlsInfo.getDashboardOverview, params)
        return {
          ...dashboardOverviewReq
        }
      },
      providesTags: [{ type: 'Network', id: 'Overview' }]
    }),
    dashboardV2Overview: build.query<Dashboard, RequestPayload>({
      query: ({ params, payload }) => {
        if(enableNewApi(CommonUrlsInfo.getDashboardV2Overview)) {
          return {
            ...createHttpRequest(CommonUrlsInfo.getDashboardV2Overview, params),
            body: payload
          }
        } else {
          return {
            ...createHttpRequest(CommonUrlsInfo.getDashboardOverview, params)
          }
        }
      },
      providesTags: [{ type: 'Network', id: 'Overview' }]
    }),
    validateRadius: build.query<RadiusValidate, RequestPayload>({
      query: ({ params, payload }) => {
        const validateRadiusReq = createHttpRequest(CommonUrlsInfo.validateRadius, params)
        return {
          ...validateRadiusReq,
          body: payload
        }
      }
    }),
    externalProviders: build.query<ExternalProviders, RequestPayload>({
      query: ({ params }) => {
        const externalProvidersReq = createHttpRequest(CommonUrlsInfo.getExternalProviders, params)
        return {
          ...externalProvidersReq
        }
      }
    })
  })
})

export const aggregatedNetworksVenueData = (venueList: TableResult<Venue>,
  venueNetworkApGroupList:{ response: NetworkVenue[] },
  networkDeep?: NetworkDetail
) => {
  const data:Venue[] = []
  venueList.data.forEach(item => {
    const networkApGroup = venueNetworkApGroupList?.response?.find(
      i => i.venueId === item.id
    )
    const deepVenue = networkDeep?.venues?.find(
      i => i.venueId === item.id
    )
    data.push({
      ...item,
      activated: calculateNetworkActivated(networkApGroup),
      deepVenue: deepVenue
    })
  })
  return {
    ...venueList,
    data
  }
}

export const aggregatedVenueNetworksData = (networkList: TableResult<Network>,
  venueNetworkApGroupList:{ response: NetworkVenue[] },
  networkDeepListList:{ response: NetworkDetail[] }) => {
  const data:Network[] = []
  networkList.data.forEach(item => {
    const networkApGroup = venueNetworkApGroupList?.response?.find(
      i => i.networkId === item.id
    )
    const deepNetwork = networkDeepListList?.response?.find(
      i => i.id === item.id
    )
    if (networkApGroup) {
      data.push({
        ...item,
        activated: calculateNetworkActivated(networkApGroup),
        deepNetwork: deepNetwork
      })
    }
  })

  return {
    ...networkList,
    data
  }
}

const calculateNetworkActivated = (res?: NetworkVenue) => {
  const activatedObj = { isActivated: false, isDisabled: false, errors: [] as string[] }
  let errorsCounter = 0
  if (res && !res.isAllApGroups) {
    if (res.apGroups && res.apGroups.length) {
      res.apGroups.forEach(group => {
        if (group.id) {
          activatedObj.isActivated = true
        }
        if (group.validationError) {
          ++errorsCounter
          if (group.validationErrorReachedMaxConnectedNetworksLimit) {
            activatedObj.errors.push('validationErrorReachedMaxConnectedNetworksLimit')
          }
          if (group.validationErrorSsidAlreadyActivated) {
            activatedObj.errors.push('validationErrorSsidAlreadyActivated')
          }
          if (group.validationErrorReachedMaxConnectedCaptiveNetworksLimit) {
            activatedObj.errors.push('validationErrorReachedMaxConnectedCaptiveNetworksLimit')
          }
        }
      })
      if (errorsCounter === res.apGroups.length) {
        activatedObj.isDisabled = true
      }
    }
  } else if (res && res.isAllApGroups) {
    activatedObj.isActivated = true
  } else {
    activatedObj.isActivated = false
  }
  return activatedObj
}

export const {
  useNetworkListQuery,
  useLazyNetworkListQuery,
  useGetNetworkQuery,
  useLazyGetNetworkQuery,
  useGetVenueNetworkApGroupQuery,
  useLazyGetVenueNetworkApGroupQuery,
  useNetworkDetailHeaderQuery,
  useNetworkVenueListQuery,
  useVenueNetworkActivationsDataListQuery,
  useAddNetworkMutation,
  useUpdateNetworkMutation,
  useDeleteNetworkMutation,
  useAddNetworkVenueMutation,
  useAddNetworkVenuesMutation,
  useUpdateNetworkVenueMutation,
  useDeleteNetworkVenueMutation,
  useDeleteNetworkVenuesMutation,
  useApNetworkListQuery,
  useVenueNetworkListQuery,
  useDashboardOverviewQuery,
  useDashboardV2OverviewQuery,
  useValidateRadiusQuery,
  useLazyValidateRadiusQuery,
  useExternalProvidersQuery
} = networkApi

export { baseNetworkApi }
