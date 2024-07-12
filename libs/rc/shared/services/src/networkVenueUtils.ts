import { FetchBaseQueryError }          from '@reduxjs/toolkit/query'
import { keys, every, get, uniq, omit } from 'lodash'

import {
  ApiVersionEnum,
  CommonRbacUrlsInfo,
  CommonUrlsInfo,
  ConfigTemplateUrlsInfo,
  FILTER,
  GetApiVersionHeader,
  Network,
  NetworkDetail,
  TableResult,
  Venue,
  VenueConfigTemplateUrlsInfo,
  WifiNetwork,
  WifiUrlsInfo
} from '@acx-ui/rc/utils'
import { createHttpRequest } from '@acx-ui/utils'

export const getApGroupNetworkVenueNewFieldFromOld = (oldFieldName: string) => {
  switch(oldFieldName) {
    case 'isAllApGroups':
      return 'venueApGroups.isAllApGroups'
    case 'venueId':
      return 'venueApGroups.venueId'
    case 'clients':
      return 'clientCount'
    default:
      return oldFieldName
  }
}

export const transformApGroupNetworkVenueListRbacPayload = (payload: Record<string, unknown>) => {
  const newPayload = { ...payload } as Record<string, unknown>
  if (payload.fields) {
    // eslint-disable-next-line max-len
    newPayload.fields = uniq((payload.fields as string[]).map(f => getApGroupNetworkVenueNewFieldFromOld(f)))
  }

  if (payload.filters) {
    const newFilters = {} as FILTER
    Object.entries(payload.filters as FILTER).map(([fieldId, val]) => {
      newFilters[getApGroupNetworkVenueNewFieldFromOld(fieldId as string)] = val
    })
    newPayload.filters = newFilters
  }

  return newPayload
}

export const getVenueApGroupFilters = (filters: FILTER | undefined): string[] => {
  return keys(filters).filter(k => k.startsWith('venueApGroups.'))
}

export const filterNetworksByVenueApGroupFilters =
(networkList: WifiNetwork[], filters: FILTER | undefined): WifiNetwork[] => {
  if (!filters) return networkList

  const venueApGroupFilterKeys = getVenueApGroupFilters(filters)

  return networkList.filter(item => item.venueApGroups
    ?.some(venueApGroup => every(venueApGroupFilterKeys, fKey => {
      const lastField = fKey.replace('venueApGroups.', '')

      switch(fKey) {
        case 'venueApGroups.apGroupIds':
          return filters[fKey]?.every(fVal => get(venueApGroup, lastField).includes(fVal))
        case 'venueApGroups.venueId':
        case 'venueApGroups.isAllApGroups':
          return get(venueApGroup, lastField) === filters[fKey]?.[0]
        default:
          return false
      }
    })))
}

export const calculateRbacNetworkActivated = (network: WifiNetwork, venueId?: string) => {
  // TODO: isDisabled, validation
  const activatedObj = { isActivated: false, isDisabled: false, errors: [] as string[] }

  if (network.venueApGroups) {
    activatedObj.isActivated = venueId
      ? network.venueApGroups.some(venue => venue.venueId === venueId)
      : Boolean(network.venueApGroups?.length)
  }

  return activatedObj
}

export const aggregatedRbacVenueNetworksData = (
  venueId: string,
  networkList: TableResult<WifiNetwork>,
  networkDeepListList:{ response: NetworkDetail[] },
  apCompatibilities:{ [key:string]: number } = {}) => {

  const data:Network[] = []
  networkList.data.forEach(item => {
    const deepNetwork = networkDeepListList?.response?.find(
      i => i.id === item.id
    )

    if (item?.dsaeOnboardNetwork) {
      item = { ...item,
        ...{ children: [{ ...item?.dsaeOnboardNetwork,
          isOnBoarded: true,
          activated: calculateRbacNetworkActivated(item, venueId) } as WifiNetwork] }
      }
    }

    data.push({
      ...(item as Network),
      activated: calculateRbacNetworkActivated(item, venueId),
      deepNetwork: deepNetwork,
      incompatible: apCompatibilities[item.id] ?? 0
    })
  })

  return {
    ...networkList,
    data
  }
}

export const aggregatedRbacNetworksVenueData = (
  venueList: TableResult<Venue>,
  networkViewmodel: WifiNetwork,
  networkDeep?: NetworkDetail,
  venueIdsToIncompatible:{ [key:string]: number } = {}
) => {
  const data:Venue[] = []
  venueList.data.forEach(item => {
    const deepVenue = networkDeep?.venues?.find(
      i => i.venueId === item.id
    )
    data.push({
      ...item,
      activated: calculateRbacNetworkActivated(networkViewmodel, item.id),
      deepVenue: deepVenue,
      incompatible: venueIdsToIncompatible[item.id] ?? 0
    })
  })
  return {
    ...venueList,
    data
  }
}

export const getNetworkDeepList =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async (networkIds: string[], fetchWithBQ:any, isTemplate: boolean = false) => {
    let networkDeepList: NetworkDetail[] = []

    if (networkIds.length === 1 && networkIds[0] === 'UNKNOWN-NETWORK-ID') {
      return { response: networkDeepList }
    }
    const reqs = []
    for (let i=0; i<networkIds.length; i++) {
      reqs.push(fetchWithBQ(createHttpRequest(
        isTemplate ? ConfigTemplateUrlsInfo.getNetworkTemplate : WifiUrlsInfo.getNetwork
        , { networkId: networkIds[i] })))
    }

    const results = await Promise.allSettled(reqs)
    networkDeepList = results.filter(isFulfilled).map(p => p.value.data)

    return { response: networkDeepList }
  }

export function isFulfilled <T,> (p: PromiseSettledResult<T>): p is PromiseFulfilledResult<T> {
  return p.status === 'fulfilled'
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const fetchRbacApGroupNetworkVenueList = async (arg:any, fetchWithBQ:any) => {
  const networkListResult = await fetchRbacNetworkList(arg, fetchWithBQ)
  const networkList = networkListResult.data

  let networkDeepListList = {} as { response: NetworkDetail[] }

  if (networkList?.data.length) {
    const networkIds = networkList.data.map(item => item.id)
    // `deepNetwork.venues` is deprecated in GET v1 /wifiNetworks/:networkId
    networkDeepListList = await getNetworkDeepList(networkIds, fetchWithBQ, arg.payload.isTemplate)
  }

  return {
    error: networkListResult.error,
    networkList: networkList ?? ([] as WifiNetwork[]),
    networkDeepListList
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const fetchRbacVenueNetworkList = async (arg: any, fetchWithBQ: any) => {
  const networkListResult = await fetchRbacNetworkList(arg, fetchWithBQ)
  const networkList = networkListResult.data

  let networkDeepListList = {} as { response: NetworkDetail[] }

  const networkIds = networkList?.data?.map(item => item.id) || []

  if (networkIds.length > 0) {
    networkDeepListList = await getNetworkDeepList(networkIds, fetchWithBQ, arg.payload.isTemplate)
  }
  return {
    error: networkListResult.error as FetchBaseQueryError,
    networkList,
    networkDeepListList,
    networkIds
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const fetchRbacNetworkVenueList = async (arg:any, fetchWithBQ:any) => {
  const networkVenuesListInfo = {
    ...createHttpRequest(arg.payload.isTemplate
      ? ConfigTemplateUrlsInfo.getVenuesTemplateList
      : CommonUrlsInfo.getVenuesList
    , arg.params),
    body: arg.payload
  }
  const networkVenuesListQuery = await fetchWithBQ(networkVenuesListInfo)
  const networkVenuesList = networkVenuesListQuery.data as TableResult<Venue>
  const venueIds:string[] = networkVenuesList.data?.filter(v => {
    if (v.aggregatedApStatus) {
      return Object.values(v.aggregatedApStatus || {}).reduce((a, b) => a + b, 0) > 0
    }
    return false
  }).map(v => v.id) || []

  // eslint-disable-next-line max-len
  const networkDeepList = await getNetworkDeepList([arg.params?.networkId], fetchWithBQ, arg.payload.isTemplate)
  const networkDeep = Array.isArray(networkDeepList?.response)
    ? networkDeepList?.response[0]
    : undefined
  let networkViewmodel = {} as WifiNetwork

  if (!arg.params?.networkId) {
    // eslint-disable-next-line no-console
    console.error('missing networkId', arg.params?.networkId)
  }

  if (networkDeep?.wlan?.ssid && arg.params?.networkId) {
    const networkListResult = await fetchRbacNetworkList({
      payload: {
        fields: ['id', 'name', 'venueApGroups'],
        filters: { id: [arg.params?.networkId] }
      }
    }, fetchWithBQ)
    networkViewmodel = networkListResult.data?.data[0]
  }

  return {
    error: networkVenuesListQuery.error,
    networkVenuesList,
    networkViewmodel,
    networkDeep,
    venueIds
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const fetchRbacNetworkList = async (arg:any, fetchWithBQ:any) => {
  const venueApGroupFilters = getVenueApGroupFilters(arg.payload.filters)
  const isFilterByIsAllApGroups = venueApGroupFilters.includes('venueApGroups.isAllApGroups')
  const networkListInfo = arg.payload.isTemplate
    ? {
      ...createHttpRequest(VenueConfigTemplateUrlsInfo.getApGroupNetworkList, arg.params),
      body: arg.payload
    }
    : {
      // eslint-disable-next-line max-len
      ...createHttpRequest(CommonRbacUrlsInfo.getWifiNetworksList, arg.params, GetApiVersionHeader(ApiVersionEnum.v1)),
      body: JSON.stringify({
        ...arg.payload,
        filters: isFilterByIsAllApGroups
          ? { ...omit(arg.payload.filters, 'venueApGroups.isAllApGroups') }
          : arg.payload.filters
      })
    }

  const networkListQuery = await fetchWithBQ(networkListInfo)
  const networkList = networkListQuery.data as TableResult<WifiNetwork>
  if (networkList.data?.length && venueApGroupFilters.length > 1) {
    networkList.data = filterNetworksByVenueApGroupFilters(networkList.data, arg.payload.filters)
    networkList.totalCount = networkList.data.length
  }
  return {
    data: networkList,
    error: networkListQuery.error
  }
}
