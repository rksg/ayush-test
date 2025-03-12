/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-len */
import { FetchArgs, FetchBaseQueryError }                   from '@reduxjs/toolkit/query'
import { keys, every, get, uniq, omit, findIndex, isEqual } from 'lodash'

import {
  AccessControlUrls,
  ApGroupConfigTemplateUrlsInfo,
  ApiVersionEnum,
  CommonRbacUrlsInfo, CommonResult,
  CommonUrlsInfo,
  ConfigTemplateUrlsInfo,
  FILTER,
  GetApiVersionHeader,
  KeyValue,
  Network,
  NetworkDetail, NetworkVenue,
  NewApGroupViewModelResponseType,
  PoliciesConfigTemplateUrlsInfo, RadioEnum,
  TableResult,
  Venue,
  VlanPoolRbacUrls,
  VLANPoolViewModelRbacType,
  WifiNetwork,
  WifiRbacUrlsInfo,
  WifiUrlsInfo,
  NetworkApGroup,
  VlanPool
} from '@acx-ui/rc/utils'
import { RequestPayload }             from '@acx-ui/types'
import { ApiInfo, createHttpRequest } from '@acx-ui/utils'

import { QueryFn }                        from './servicePolicy.utils'
import { apGroupsChangeSet, isFulfilled } from './utils'

const defaultNetworkVenue = {
  dual5gEnabled: true,
  tripleBandEnabled: true,
  allApGroupsRadio: 'Both',
  isAllApGroups: true,
  allApGroupsRadioTypes: ['2.4-GHz', '5-GHz']
}

type NetworkApGroupParams = { venueId: string, networkId: string, apGroupId: string }



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
      ? network.venueApGroups?.some(venue => venue.venueId === venueId)
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
      clients: item.clientCount ?? 0,
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

export const getNetworkDeepList = async (networkIds: string[], fetchWithBQ: any, isTemplate: boolean = false, enableRbac: boolean = false) => {
  let networkDeepList: NetworkDetail[] = []

  if (networkIds.length === 1 && networkIds[0] === 'UNKNOWN-NETWORK-ID') {
    return { response: networkDeepList }
  }
  const reqs = networkIds.map(networkId => {
    return fetchWithBQ(createHttpRequest(
      resolveGetNetworkApiInfo(isTemplate, enableRbac)
      , { networkId }
    ))
  })

  const results = await Promise.allSettled(reqs)
  networkDeepList = results.filter(isFulfilled).map(p => p.value.data)

  return { response: networkDeepList }
}

export const getApGroupIdNameMap = async (apGroupIds: string[], isTemplate: boolean = false, fetchWithBQ: any) => {
  let apGroupNameMap: KeyValue<string, string>[] = []
  if (apGroupIds.length) {
    const apGroupsListQuery = await fetchWithBQ({
      ...createHttpRequest(
        isTemplate ? ApGroupConfigTemplateUrlsInfo.getApGroupsListRbac : WifiRbacUrlsInfo.getApGroupsList,
        GetApiVersionHeader(ApiVersionEnum.v1)
      ),
      body: JSON.stringify({
        fields: ['name', 'id'],
        pageSize: 10000,
        filters: { id: apGroupIds }
      })
    })
    const apGroupList = apGroupsListQuery.data as TableResult<NewApGroupViewModelResponseType>
    apGroupNameMap = apGroupList.data.map((apg) => ({ key: apg.id!, value: apg.name ?? '' }))
  }

  return apGroupNameMap
}

export const fetchNetworkVlanPoolList = async (networkIds: string[], isTemplate: boolean = false, fetchWithBQ: any) => {
  const networkVlanPoolListQuery = await fetchWithBQ({
    ...createHttpRequest(
      isTemplate ? PoliciesConfigTemplateUrlsInfo.getVlanPoolPolicyList : VlanPoolRbacUrls.getVLANPoolPolicyList
    ),
    body: JSON.stringify({
      fields: ['id', 'name', 'wifiNetworkIds', 'wifiNetworkVenueApGroups'],
      filters: { wifiNetworkIds: networkIds }
    }) })
  return networkVlanPoolListQuery.data as TableResult<VLANPoolViewModelRbacType>
}

export const fetchApGroupVlanPoolList = async (apGroupVenueIds: string[], isTemplate: boolean = false, fetchWithBQ: any) => {
  let apGroupVlanPoolList = {} as TableResult<VLANPoolViewModelRbacType>
  if (apGroupVenueIds.length) {
    const apGroupVlanPoolListQuery = await fetchWithBQ({
      ...createHttpRequest(
        isTemplate ? PoliciesConfigTemplateUrlsInfo.getVlanPoolPolicyList : VlanPoolRbacUrls.getVLANPoolPolicyList
      ),
      body: JSON.stringify({
        fields: ['id', 'name', 'wifiNetworkIds', 'wifiNetworkVenueApGroups'],
        filters: { 'wifiNetworkVenueApGroups.venueId': apGroupVenueIds }
      }) })
    apGroupVlanPoolList = apGroupVlanPoolListQuery.data as TableResult<VLANPoolViewModelRbacType>
  }
  return apGroupVlanPoolList
}

export const fetchRbacApGroupNetworkVenueList = async (arg: any, fetchWithBQ: any) => {
  const networkListResult = await fetchRbacNetworkList(arg, fetchWithBQ)
  const networkList = networkListResult.data
  const { venueId, apGroupId } = arg.params
  const { apGroupIds: apGroupIdsList, isTemplate } = arg.payload
  const apGroupCheckList = apGroupId ? [apGroupId] : [...apGroupIdsList]

  let networkDeepListList = {} as { response: NetworkDetail[] }

  const networkIds: string[] = []
  const activatedNetworkIds: string[] = []
  const networkApGroupParamsList: NetworkApGroupParams[] = []

  networkList?.data?.forEach(item => {
    const networkId = item.id
    networkIds.push(networkId)

    if (calculateRbacNetworkActivated(item, venueId).isActivated) {
      activatedNetworkIds.push(networkId)

      item.venueApGroups?.forEach(venueApGroup => {
        const { apGroupIds } = venueApGroup

        apGroupIds?.forEach(venueApGroupId => {
          if (apGroupCheckList.includes(venueApGroupId)) {
            networkApGroupParamsList.push({ venueId, networkId, apGroupId: venueApGroupId })
          }
        })
      })
    }
  })

  if (networkIds.length > 0) {
    // eslint-disable-next-line max-len
    networkDeepListList = await getNetworkDeepList(networkIds, fetchWithBQ, isTemplate, true)

    const networkDeepListRes = networkDeepListList.response
    if (networkDeepListRes.length > 0) {
      // get "select All APs" settings
      const networkVenueUrlInfo = isTemplate ? ConfigTemplateUrlsInfo.getNetworkVenueTemplateRbac : WifiRbacUrlsInfo.getNetworkVenue
      const venueNetworkReqs = activatedNetworkIds.map(activatedNetworkId => {
        const params = {
          venueId: venueId,
          networkId: activatedNetworkId
        }

        return fetchWithBQ(createHttpRequest(
          networkVenueUrlInfo,
          params,
          GetApiVersionHeader(ApiVersionEnum.v1)
        ))
      })
      const networkVenueResults = await Promise.allSettled(venueNetworkReqs)
      const networkVenueList = networkVenueResults.filter(isFulfilled).map(p => p.value.data)

      // Get "select specific AP Groups" settings
      const venueApGroupUrlInfo = isTemplate ? ConfigTemplateUrlsInfo.getVenueApGroupsRbac : WifiRbacUrlsInfo.getVenueApGroups
      const networkApGroupReqs = networkApGroupParamsList.map(params => {
        return fetchWithBQ(createHttpRequest(
          venueApGroupUrlInfo,
          params,
          GetApiVersionHeader(ApiVersionEnum.v1)
        ))
      })
      const networkAPGroupResults = await Promise.allSettled(networkApGroupReqs)
      const networkApGroupList = networkAPGroupResults.filter(isFulfilled).map(p => p.value.data)

      // need to get APGroupName from AP Group List
      const apGroupIds = uniq(networkApGroupParamsList.map(item => item.apGroupId).filter(item => item))
      const apGroupIdNameMap = await getApGroupIdNameMap(apGroupIds, isTemplate, fetchWithBQ)

      // fetch AP Group vlan pool info
      const apGroupVenueIds = uniq(networkApGroupParamsList.map(item => item.venueId))
      const apGroupVlanPoolList = await fetchApGroupVlanPoolList(apGroupVenueIds, isTemplate, fetchWithBQ)

      networkDeepListRes.forEach((networkDeep) => {
        const networkId = networkDeep.id

        const networkVenueIdx = findIndex(activatedNetworkIds, (activatedNetworkId) =>
          (activatedNetworkId === networkId))

        const networkVenueResult = (networkVenueIdx < 0)
          ? undefined : networkVenueList[networkVenueIdx]

        const venueApGroupIds = networkApGroupParamsList.filter(params => (
          params.venueId === venueId && params.networkId === networkId
        ))
        const venueApGroups = venueApGroupIds?.map(params => {
          const venueApGroupIdx = findIndex(networkApGroupParamsList, (item) => (
            params.venueId === item.venueId &&
            params.networkId === item.networkId &&
            params.apGroupId === item.apGroupId
          ))

          if (venueApGroupIdx < 0) {
            return undefined
          }
          const networkApGroupRes = networkApGroupList[venueApGroupIdx]
          const apGroupName = apGroupIdNameMap.find(apg => apg.key === params.apGroupId)?.value ?? ''

          const apgVlanPool = apGroupVlanPoolList?.data?.find(vlanPool => {
            const vlanPoolApGroups = vlanPool.wifiNetworkVenueApGroups.find(apg => {
              return (apg.venueId === venueId && apg.wifiNetworkId === networkId)
            })
            return vlanPoolApGroups && vlanPoolApGroups.apGroupIds.includes(params.apGroupId)
          })

          return {
            ...networkApGroupRes,
            ...params,
            radio: 'Both',
            isDefault: !apGroupName,
            apGroupName,
            ...(apgVlanPool && {
              vlanPoolId: apgVlanPool.id,
              vlanPoolName: apgVlanPool.name
            })
          }
        })

        const networkVenueData = {
          ...defaultNetworkVenue,
          ...networkVenueResult,
          ...(venueApGroups && { apGroups: venueApGroups }),
          networkId,
          venueId
        }
        networkDeep.venues = [networkVenueData]
      })
    }
  }


  return {
    error: networkListResult.error,
    networkList: networkList ?? ([] as WifiNetwork[]),
    networkDeepListList
  }
}

// replace the fetchRbacApGroupNetworkVenueList
export const fetchEnhanceRbacApGroupNetworkVenueList = async (arg: any, fetchWithBQ: any) => {
  const networkListResult = await fetchRbacNetworkList(arg, fetchWithBQ)
  const networkList = networkListResult.data
  const { venueId, apGroupId } = arg.params
  const { apGroupIds: apGroupIdsList, isTemplate } = arg.payload
  const apGroupCheckList = apGroupId ? [apGroupId] : [...apGroupIdsList]

  let networkDeepListList = {} as { response: NetworkDetail[] }

  const networkIds: string[] = []
  const activatedNetworkIds: string[] = []
  const networkApGroupParamsList: NetworkApGroupParams[] = []

  networkList?.data?.forEach(item => {
    const networkId = item.id
    networkIds.push(networkId)

    if (calculateRbacNetworkActivated(item, venueId).isActivated) {
      activatedNetworkIds.push(networkId)

      item.venueApGroups?.forEach(venueApGroup => {
        const { apGroupIds } = venueApGroup

        apGroupIds?.forEach(venueApGroupId => {
          if (apGroupCheckList.includes(venueApGroupId)) {
            networkApGroupParamsList.push({ venueId, networkId, apGroupId: venueApGroupId })
          }
        })
      })
    }
  })

  if (networkIds.length > 0) {
    // eslint-disable-next-line max-len
    networkDeepListList = await getNetworkDeepList(networkIds, fetchWithBQ, isTemplate, true)

    const networkDeepListRes = networkDeepListList.response
    if (networkDeepListRes.length > 0) {
      // get networkVeneus
      const networkVenuesUrlInfo = isTemplate ? ConfigTemplateUrlsInfo.getNetworkVenuesTemplateRbac : WifiRbacUrlsInfo.getNetworkVenues
      const networkVenuesQuery = await fetchWithBQ({
        ...createHttpRequest(networkVenuesUrlInfo, undefined, GetApiVersionHeader(ApiVersionEnum.v1)),
        body: JSON.stringify({
          venueIds: [venueId],
          networkIds: activatedNetworkIds
        })
      })
      const networkVenueList = networkVenuesQuery.data

      // need to get APGroupName from AP Group List
      const apGroupIds = uniq(networkApGroupParamsList.map(item => item.apGroupId).filter(item => item))
      const apGroupIdNameMap = await getApGroupIdNameMap(apGroupIds, isTemplate, fetchWithBQ)

      // fetch network vlan pool info
      const networkVlanPoolList = await fetchNetworkVlanPoolList(networkIds, isTemplate, fetchWithBQ)

      // fetch AP Group vlan pool info
      const apGroupVenueIds = uniq(networkApGroupParamsList.map(item => item.venueId))
      const apGroupVlanPoolList = await fetchApGroupVlanPoolList(apGroupVenueIds, isTemplate, fetchWithBQ)

      networkDeepListRes.forEach((networkDeep) => {
        const networkId = networkDeep.id

        const networkVenues = (networkVenueList?.data?.[0].networks ?? []) as NetworkVenue[]
        const networkVenueResult = networkVenues.find((networkVenue: NetworkVenue ) => networkVenue.networkId === networkId)

        const venueApGroups = (!networkVenueResult)? undefined : ((networkVenueResult.isAllApGroups)
          ? []
          : networkVenueResult.apGroups?.map((apGroup: NetworkApGroup) => {
            const { apGroupId = '' } = apGroup
            const apGroupName = apGroupIdNameMap.find(apg => apg.key === apGroupId)?.value
            const apgVlanPool = apGroupVlanPoolList?.data?.find(vlanPool => {
              const vlanPoolApGroups = vlanPool.wifiNetworkVenueApGroups.find(apg => {
                return (apg.venueId === venueId && apg.wifiNetworkId === networkId)
              })
              return vlanPoolApGroups && vlanPoolApGroups.apGroupIds.includes(apGroupId)
            })

            return {
              ...apGroup,
              ...({ venueId, networkId }),
              radio: 'Both',
              isDefault: !apGroupName,
              apGroupName,
              ...(apgVlanPool && {
                vlanPoolId: apgVlanPool.id,
                vlanPoolName: apgVlanPool.name
              })
            }
          }))

        const networkVlanPool = networkVlanPoolList?.data?.find(vlanPool => vlanPool.wifiNetworkIds?.includes(networkId))
        const networkVenueData = {
          ...defaultNetworkVenue,
          ...networkVenueResult,
          ...(venueApGroups && { apGroups: venueApGroups }),
          networkId,
          venueId
        } as NetworkVenue
        networkDeep.venues = [networkVenueData]

        if (networkVlanPool && networkDeep.wlan?.advancedCustomization) {
          networkDeep.wlan.advancedCustomization.vlanPool = {
            id: networkVlanPool.id,
            name: networkVlanPool.name
          } as VlanPool
        }
      })
    }
  }


  return {
    error: networkListResult.error,
    networkList: networkList ?? ([] as WifiNetwork[]),
    networkDeepListList
  }
}

export const fetchRbacAllApGroupNetworkVenueList = async (arg: any, fetchWithBQ: any) => {
  const networkListResult = await fetchRbacNetworkList(arg, fetchWithBQ)
  const networkList = networkListResult.data
  const { venueId, apGroupId } = arg.params
  const { apGroupIds: apGroupIdsList, isTemplate } = arg.payload
  const apGroupCheckList = apGroupId ? [apGroupId] : [...apGroupIdsList]

  let networkDeepListList = { response: [] } as { response: NetworkDetail[] }

  const networkIds: string[] = []
  const activatedNetworkIds: string[] = []
  const networkApGroupParamsList: NetworkApGroupParams[] = []

  networkList?.data?.forEach(item => {
    const networkId = item.id
    networkIds.push(networkId)

    if (calculateRbacNetworkActivated(item, venueId).isActivated) {
      activatedNetworkIds.push(networkId)

      item.venueApGroups?.forEach(venueApGroup => {
        const { apGroupIds } = venueApGroup

        apGroupIds?.forEach(venueApGroupId => {
          if (apGroupCheckList.includes(venueApGroupId)) {
            networkApGroupParamsList.push({ venueId, networkId, apGroupId: venueApGroupId })
          }
        })
      })
    }
  })

  if (networkIds.length > 0) {
    // eslint-disable-next-line max-len
    networkDeepListList = await getNetworkDeepList(networkIds, fetchWithBQ, isTemplate, true)

    const networkDeepListRes = networkDeepListList.response
    if (networkDeepListRes.length > 0) {
      // get "select All APs" settings
      const networkVenueUrlInfo = isTemplate ? ConfigTemplateUrlsInfo.getNetworkVenueTemplateRbac : WifiRbacUrlsInfo.getNetworkVenue
      const venueNetworkReqs = activatedNetworkIds.map(activatedNetworkId => {
        const params = {
          venueId: venueId,
          networkId: activatedNetworkId
        }

        return fetchWithBQ(createHttpRequest(
          networkVenueUrlInfo,
          params,
          GetApiVersionHeader(ApiVersionEnum.v1)
        ))
      })
      const networkVenueResults = await Promise.allSettled(venueNetworkReqs)
      const networkVenueList = networkVenueResults.filter(isFulfilled).map(p => p.value.data)

      // Get "select specific AP Groups" settings
      const venueApGroupUrlInfo = isTemplate ? ConfigTemplateUrlsInfo.getVenueApGroupsRbac : WifiRbacUrlsInfo.getVenueApGroups
      const networkApGroupReqs = networkApGroupParamsList.map(params => {
        return fetchWithBQ(createHttpRequest(
          venueApGroupUrlInfo,
          params,
          GetApiVersionHeader(ApiVersionEnum.v1)
        ))
      })
      const networkAPGroupResults = await Promise.allSettled(networkApGroupReqs)
      const networkApGroupList = networkAPGroupResults.filter(isFulfilled).map(p => p.value.data)

      // need to get APGroupName from AP Group List
      let apGroupNameMap: KeyValue<string, string>[] = []
      const apGroupIds = uniq(networkApGroupParamsList.map(item => item.apGroupId).filter(item => item))
      if (apGroupIds.length) {
        const apGroupsListQuery = await fetchWithBQ({
          ...createHttpRequest(
            isTemplate ? ApGroupConfigTemplateUrlsInfo.getApGroupsListRbac : WifiRbacUrlsInfo.getApGroupsList
          ),
          body: JSON.stringify({
            fields: ['name', 'id'],
            pageSize: 10000,
            filters: { venueId: [venueId] }
          })
        })
        const apGroupList = apGroupsListQuery.data as TableResult<NewApGroupViewModelResponseType>
        apGroupNameMap = apGroupList.data.map((apg) => ({ key: apg.id!, value: apg.name ?? '' }))
      }


      networkDeepListRes.forEach((networkDeep) => {
        const networkId = networkDeep.id

        const networkVenueIdx = findIndex(activatedNetworkIds, (activatedNetworkId) =>
          (activatedNetworkId === networkId))

        const networkVenueResult = (networkVenueIdx < 0)
          ? undefined : networkVenueList[networkVenueIdx]

        const venueApGroupIds = networkApGroupParamsList.filter(params => (
          params.venueId === venueId && params.networkId === networkId
        ))
        const venueApGroups = venueApGroupIds?.map(params => {
          const venueApGroupIdx = findIndex(networkApGroupParamsList, (item) => (
            params.venueId === item.venueId &&
            params.networkId === item.networkId &&
            params.apGroupId === item.apGroupId
          ))

          if (venueApGroupIdx < 0) {
            return undefined
          }
          const networkApGroupRes = networkApGroupList[venueApGroupIdx]
          const apGroupName = apGroupNameMap.find(apg => apg.key === params.apGroupId)?.value ?? ''

          return {
            ...networkApGroupRes,
            ...params,
            radio: 'Both',
            isDefault: !apGroupName,
            apGroupName
          }
        })

        const networkVenueData = {
          ...defaultNetworkVenue,
          ...networkVenueResult,
          ...(venueApGroups && { apGroups: venueApGroups }),
          networkId,
          venueId
        }
        networkDeep.venues = [networkVenueData]
      })
    }
  }


  return {
    error: networkListResult.error,
    networkList: networkList ?? ([] as WifiNetwork[]),
    networkDeepListList
  }
}

// replace the fetchRbacAllApGroupNetworkVenueList
export const fetchEnhanceRbacAllApGroupNetworkVenueList = async (arg: any, fetchWithBQ: any) => {
  const networkListResult = await fetchRbacNetworkList(arg, fetchWithBQ)
  const networkList = networkListResult.data
  const { venueId, apGroupId } = arg.params
  const { apGroupIds: apGroupIdsList, isTemplate } = arg.payload
  const apGroupCheckList = apGroupId ? [apGroupId] : [...apGroupIdsList]

  let networkDeepListList = { response: [] } as { response: NetworkDetail[] }

  const networkIds: string[] = []
  const activatedNetworkIds: string[] = []
  const networkApGroupParamsList: NetworkApGroupParams[] = []

  networkList?.data?.forEach(item => {
    const networkId = item.id
    networkIds.push(networkId)

    if (calculateRbacNetworkActivated(item, venueId).isActivated) {
      activatedNetworkIds.push(networkId)

      item.venueApGroups?.forEach(venueApGroup => {
        const { apGroupIds } = venueApGroup

        apGroupIds?.forEach(venueApGroupId => {
          if (apGroupCheckList.includes(venueApGroupId)) {
            networkApGroupParamsList.push({ venueId, networkId, apGroupId: venueApGroupId })
          }
        })
      })
    }
  })

  if (networkIds.length > 0) {
    // eslint-disable-next-line max-len
    networkDeepListList = await getNetworkDeepList(networkIds, fetchWithBQ, isTemplate, true)

    const networkDeepListRes = networkDeepListList.response
    if (networkDeepListRes.length > 0) {
      // get networkVeneus
      const networkVenuesUrlInfo = isTemplate ? ConfigTemplateUrlsInfo.getNetworkVenuesTemplateRbac : WifiRbacUrlsInfo.getNetworkVenues
      const networkVenuesQuery = await fetchWithBQ({
        ...createHttpRequest(networkVenuesUrlInfo, undefined, GetApiVersionHeader(ApiVersionEnum.v1)),
        body: JSON.stringify({
          venueIds: [venueId],
          networkIds: activatedNetworkIds
        })
      })
      const networkVenueList = networkVenuesQuery.data


      networkDeepListRes.forEach((networkDeep) => {
        const networkId = networkDeep.id

        const networkVenues = (networkVenueList?.data?.[0].networks ?? []) as NetworkVenue[]
        const networkVenueResult = networkVenues.find((networkVenue: NetworkVenue ) => networkVenue.networkId === networkId)

        const venueApGroups = (!networkVenueResult)? undefined : ((networkVenueResult.isAllApGroups)
          ? []
          : networkVenueResult.apGroups?.map((apGroup: NetworkApGroup) => {

            return {
              ...apGroup,
              ...({ venueId, networkId }),
              radio: 'Both'
            }
          }))

        const networkVenueData = {
          ...defaultNetworkVenue,
          ...networkVenueResult,
          ...(venueApGroups && { apGroups: venueApGroups }),
          networkId,
          venueId
        } as NetworkVenue
        networkDeep.venues = [networkVenueData]
      })
    }
  }


  return {
    error: networkListResult.error,
    networkList: networkList ?? ([] as WifiNetwork[]),
    networkDeepListList
  }
}

export const fetchRbacVenueNetworkList = async (arg: any, fetchWithBQ: any) => {
  const networkListResult = await fetchRbacNetworkList(arg, fetchWithBQ)
  const venueId = arg.params.venueId
  const isTemplate = arg.payload.isTemplate
  const networkList = networkListResult.data

  let networkDeepListList = {} as { response: NetworkDetail[] }

  const networkIds: string[] = []
  const activatedNetworkIds: string[] = []
  const networkApGroupParamsList: NetworkApGroupParams[] = []

  networkList?.data?.forEach(item => {
    const networkId = item.id
    networkIds.push(networkId)

    if (calculateRbacNetworkActivated(item, venueId).isActivated) {
      activatedNetworkIds.push(networkId)

      item.venueApGroups?.forEach(venueApGroup => {
        const { apGroupIds, isAllApGroups, venueId } = venueApGroup
        if (!isAllApGroups) {
          apGroupIds?.forEach(apGroupId => {
            networkApGroupParamsList.push({ venueId, networkId, apGroupId })
          })
        }
      })
    }
  })

  if (networkIds.length > 0) {
    // eslint-disable-next-line max-len
    networkDeepListList = await getNetworkDeepList(networkIds, fetchWithBQ, isTemplate, true)
    const networkDeepListRes = networkDeepListList.response
    if (networkDeepListRes.length > 0) {
      // get "select All APs" settings
      const networkVenueUrlInfo = isTemplate ? ConfigTemplateUrlsInfo.getNetworkVenueTemplateRbac : WifiRbacUrlsInfo.getNetworkVenue
      const venueNetworkReqs = activatedNetworkIds.map(activatedNetworkId => {
        const params = {
          venueId: venueId,
          networkId: activatedNetworkId
        }

        return fetchWithBQ(createHttpRequest(
          networkVenueUrlInfo,
          params,
          GetApiVersionHeader(ApiVersionEnum.v1)
        ))
      })
      const networkVenueResults = await Promise.allSettled(venueNetworkReqs)
      const networkVenueList = networkVenueResults.filter(isFulfilled).map(p => p.value.data)

      // Get "select specific AP Groups" settings
      const venueApGroupUrlInfo = isTemplate ? ConfigTemplateUrlsInfo.getVenueApGroupsRbac : WifiRbacUrlsInfo.getVenueApGroups
      const networkApGroupReqs = networkApGroupParamsList.map(params => {
        return fetchWithBQ(createHttpRequest(
          venueApGroupUrlInfo,
          params,
          GetApiVersionHeader(ApiVersionEnum.v1)
        ))
      })
      const networkAPGroupResults = await Promise.allSettled(networkApGroupReqs)
      const networkApGroupList = networkAPGroupResults.filter(isFulfilled).map(p => p.value.data)

      // need to get APGroupName from AP Group List
      const apGroupIds = uniq(networkApGroupParamsList.map(item => item.apGroupId).filter(item => item))
      const apGroupIdNameMap = await getApGroupIdNameMap(apGroupIds, isTemplate, fetchWithBQ)

      // fetch network vlan pool info
      const networkVlanPoolList = await fetchNetworkVlanPoolList(networkIds, isTemplate, fetchWithBQ)

      // fetch AP Group vlan pool info
      const apGroupVenueIds = uniq(networkApGroupParamsList.map(item => item.venueId))
      const apGroupVlanPoolList = await fetchApGroupVlanPoolList(apGroupVenueIds, isTemplate, fetchWithBQ)

      networkDeepListRes?.forEach((networkDeep) => {
        const networkId = networkDeep.id

        const networkVenueIdx = findIndex(activatedNetworkIds, (activatedNetworkId) =>
          (activatedNetworkId === networkId))

        const networkVenueResult = (networkVenueIdx < 0)
          ? undefined : networkVenueList[networkVenueIdx]

        if (networkVenueResult) {
          const venueApGroupIds = networkApGroupParamsList.filter(params => (
            params.venueId === venueId && params.networkId === networkId
          ))
          const venueApGroups = venueApGroupIds?.map(params => {
            const venueApGroupIdx = findIndex(networkApGroupParamsList, (item) => (
              params.venueId === item.venueId &&
            params.networkId === item.networkId &&
            params.apGroupId === item.apGroupId
            ))

            if (venueApGroupIdx < 0) {
              return undefined
            }
            const networkApGroupRes = networkApGroupList[venueApGroupIdx]
            const apGroupName = apGroupIdNameMap.find(apg => apg.key === params.apGroupId)?.value

            const apgVlanPool = apGroupVlanPoolList?.data?.find(vlanPool => {
              const vlanPoolApGroups = vlanPool.wifiNetworkVenueApGroups.find(apg => {
                return (apg.venueId === venueId && apg.wifiNetworkId === networkId)
              })
              return vlanPoolApGroups && vlanPoolApGroups.apGroupIds.includes(params.apGroupId)
            })

            return {
              ...networkApGroupRes,
              ...params,
              radio: 'Both',
              isDefault: !apGroupName,
              apGroupName,
              ...(apgVlanPool && {
                vlanPoolId: apgVlanPool.id,
                vlanPoolName: apgVlanPool.name
              })
            }
          })

          const networkVlanPool = networkVlanPoolList?.data?.find(vlanPool => vlanPool.wifiNetworkIds?.includes(networkId))

          const networkVenueData = {
            ...defaultNetworkVenue,
            ...networkVenueResult,
            ...(venueApGroups && { apGroups: venueApGroups }),
            networkId,
            venueId,
            ...(networkVlanPool && {
              vlanPoolId: networkVlanPool.id,
              vlanPoolName: networkVlanPool.name
            })
          }

          networkDeep.venues = [networkVenueData]
        }
      })
    }
  }

  return {
    error: networkListResult.error as FetchBaseQueryError,
    networkList,
    networkDeepListList,
    networkIds
  }
}

// replace the fetchRbacVenueNetworkList
export const fetchEnhanceRbacVenueNetworkList = async (arg: any, fetchWithBQ: any) => {
  const networkListResult = await fetchRbacNetworkList(arg, fetchWithBQ)
  const venueId = arg.params.venueId
  const isTemplate = arg.payload.isTemplate
  const networkList = networkListResult.data

  let networkDeepListList = {} as { response: NetworkDetail[] }

  const networkIds: string[] = []
  const activatedNetworkIds: string[] = []
  const networkApGroupParamsList: NetworkApGroupParams[] = []

  networkList?.data?.forEach(item => {
    const networkId = item.id
    networkIds.push(networkId)

    if (calculateRbacNetworkActivated(item, venueId).isActivated) {
      activatedNetworkIds.push(networkId)

      item.venueApGroups?.forEach(venueApGroup => {
        const { apGroupIds, isAllApGroups, venueId } = venueApGroup
        if (!isAllApGroups) {
          apGroupIds?.forEach(apGroupId => {
            networkApGroupParamsList.push({ venueId, networkId, apGroupId })
          })
        }
      })
    }
  })

  if (networkIds.length > 0) {
    networkDeepListList = await getNetworkDeepList(networkIds, fetchWithBQ, isTemplate, true)
    const networkDeepListRes = networkDeepListList.response
    if (networkDeepListRes.length > 0) {
      // get networkVeneus
      const networkVenuesUrlInfo = isTemplate ? ConfigTemplateUrlsInfo.getNetworkVenuesTemplateRbac : WifiRbacUrlsInfo.getNetworkVenues
      const networkVenuesQuery = await fetchWithBQ({
        ...createHttpRequest(networkVenuesUrlInfo, undefined, GetApiVersionHeader(ApiVersionEnum.v1)),
        body: JSON.stringify({
          venueIds: [venueId],
          networkIds: activatedNetworkIds
        })
      })
      const networkVenueList = networkVenuesQuery.data

      // need to get APGroupName from AP Group List
      const apGroupIds = uniq(networkApGroupParamsList.map(item => item.apGroupId).filter(item => item))
      const apGroupIdNameMap = await getApGroupIdNameMap(apGroupIds, isTemplate, fetchWithBQ)

      // fetch network vlan pool info
      const networkVlanPoolList = await fetchNetworkVlanPoolList(networkIds, isTemplate, fetchWithBQ)

      // fetch AP Group vlan pool info
      const apGroupVenueIds = uniq(networkApGroupParamsList.map(item => item.venueId))
      const apGroupVlanPoolList = await fetchApGroupVlanPoolList(apGroupVenueIds, isTemplate, fetchWithBQ)

      networkDeepListRes?.forEach((networkDeep) => {
        const networkId = networkDeep.id

        const networkVenues = (networkVenueList?.data?.[0].networks ?? []) as NetworkVenue[]
        const networkVenueResult = networkVenues.find((networkVenue: NetworkVenue ) => networkVenue.networkId === networkId)

        if (networkVenueResult) {
          const venueApGroups = (networkVenueResult.isAllApGroups)
            ? []
            : networkVenueResult.apGroups?.map((apGroup: NetworkApGroup) => {
              const { apGroupId = '' } = apGroup
              const apGroupName = apGroupIdNameMap.find(apg => apg.key === apGroupId)?.value

              const apgVlanPool = apGroupVlanPoolList?.data?.find(vlanPool => {
                const vlanPoolApGroups = vlanPool.wifiNetworkVenueApGroups.find(apg => {
                  return (apg.venueId === venueId && apg.wifiNetworkId === networkId)
                })
                return vlanPoolApGroups && vlanPoolApGroups.apGroupIds.includes(apGroupId)
              })

              return {
                ...apGroup,
                ...({ venueId, networkId }),
                radio: 'Both',
                isDefault: !apGroupName,
                apGroupName,
                ...(apgVlanPool && {
                  vlanPoolId: apgVlanPool.id,
                  vlanPoolName: apgVlanPool.name
                })
              }
            })

          const networkVlanPool = networkVlanPoolList?.data?.find(vlanPool => vlanPool.wifiNetworkIds?.includes(networkId))

          const networkVenueData = {
            ...defaultNetworkVenue,
            ...networkVenueResult,
            ...(venueApGroups && { apGroups: venueApGroups }),
            networkId,
            venueId,
            ...(networkVlanPool && {
              vlanPoolId: networkVlanPool.id,
              vlanPoolName: networkVlanPool.name
            })
          } as NetworkVenue

          networkDeep.venues = [networkVenueData]

          if (networkVlanPool && networkDeep.wlan?.advancedCustomization) {
            networkDeep.wlan.advancedCustomization.vlanPool = {
              id: networkVlanPool.id,
              name: networkVlanPool.name
            } as VlanPool
          }
        }
      })
    }
  }

  return {
    error: networkListResult.error as FetchBaseQueryError,
    networkList,
    networkDeepListList,
    networkIds
  }
}

export const fetchRbacAccessControlPolicyNetwork = async (queryArgs: RequestPayload, fetchWithBQ: any) => {
  const { params, payload } = queryArgs
  const queryPayload = {
    filters: {
      wifiNetworkIds: [params?.networkId]
    },
    fields: ['id']
  }
  const apis = (payload as { isTemplate: boolean }).isTemplate ? PoliciesConfigTemplateUrlsInfo : AccessControlUrls
  const aclPolicyListInfo = {
    // eslint-disable-next-line max-len
    ...createHttpRequest(apis.getAccessControlProfileQueryList, params),
    body: JSON.stringify(queryPayload)
  }

  const aclPolicyListInfoQuery = await fetchWithBQ(aclPolicyListInfo)

  return {
    error: aclPolicyListInfoQuery.error,
    data: aclPolicyListInfoQuery.data
  }
}

export const fetchRbacAccessControlSubPolicyNetwork = async (queryArgs: RequestPayload, fetchWithBQ: any) => {
  const { params } = queryArgs
  const queryPayload = {
    filters: {
      wifiNetworkIds: [params?.networkId]
    },
    fields: ['id']
  }
  const apis = AccessControlUrls
  const l2aclPolicyListInfo = {
    ...createHttpRequest(apis.getL2AclPolicyListQuery, params),
    body: JSON.stringify(queryPayload)
  }

  const l3aclPolicyListInfo = {
    ...createHttpRequest(apis.getL3AclPolicyListQuery, params),
    body: JSON.stringify(queryPayload)
  }

  const appAclPolicyListInfo = {
    ...createHttpRequest(apis.getApplicationPolicyListQuery, params),
    body: JSON.stringify(queryPayload)
  }

  const deviceAclPolicyListInfo = {
    ...createHttpRequest(apis.getDevicePolicyListQuery, params),
    body: JSON.stringify(queryPayload)
  }

  const allRequests = []
  allRequests.push(fetchWithBQ(l2aclPolicyListInfo))
  allRequests.push(fetchWithBQ(l3aclPolicyListInfo))
  allRequests.push(fetchWithBQ(appAclPolicyListInfo))
  allRequests.push(fetchWithBQ(deviceAclPolicyListInfo))
  const [
    l2aclPolicyListInfoQuery,
    l3aclPolicyListInfoQuery,
    appAclPolicyListInfoQuery,
    deviceAclPolicyListInfoQuery
  ] = await Promise.all(allRequests)

  return {
    error: l2aclPolicyListInfoQuery.error || l3aclPolicyListInfoQuery.error || appAclPolicyListInfoQuery.error || deviceAclPolicyListInfoQuery.error,
    data: {
      ...(l2aclPolicyListInfoQuery.data.data.length ? { l2AclPolicyId: l2aclPolicyListInfoQuery.data.data[0].id, l2AclEnable: true } : {}),
      ...(l3aclPolicyListInfoQuery.data.data.length ? { l3AclPolicyId: l3aclPolicyListInfoQuery.data.data[0].id, l3AclEnable: true } : {}),
      ...(appAclPolicyListInfoQuery.data.data.length ? { applicationPolicyId: appAclPolicyListInfoQuery.data.data[0].id, applicationPolicyEnable: true } : {}),
      ...(deviceAclPolicyListInfoQuery.data.data.length ? { devicePolicyId: deviceAclPolicyListInfoQuery.data.data[0].id, enableDeviceOs: true } : {})
    }
  }
}

export const fetchRbacNetworkVenueList = async (queryArgs: RequestPayload<{ page?: number, pageSize?: number, isTemplate?: boolean }>, fetchWithBQ: any) => {
  const { params, payload } = queryArgs
  const networkVenuesListInfo = resolveRbacVenuesListFetchArgs(queryArgs)
  const networkVenuesListQuery = await fetchWithBQ(networkVenuesListInfo)
  const networkVenuesList = networkVenuesListQuery.data as TableResult<Venue>
  const venueIds:string[] = networkVenuesList.data?.map(v => v.id) || []

  const isTemplate = payload?.isTemplate
  const networkId = params?.networkId
  const networkApGroupParamsList: NetworkApGroupParams[] = []
  const targetNetworkIdList = networkId ? [networkId] : []
  let networkViewmodel = {} as WifiNetwork

  // eslint-disable-next-line max-len
  const networkDeepList = await getNetworkDeepList(targetNetworkIdList, fetchWithBQ, isTemplate, true)
  const networkDeep = Array.isArray(networkDeepList?.response)
    ? networkDeepList?.response[0]
    : undefined

  if (networkId && networkDeep) {
    const networkListResult = await fetchRbacNetworkList({
      payload: {
        fields: ['id', 'name', 'venueApGroups'],
        filters: { id: [networkId] },
        isTemplate
      }
    }, fetchWithBQ)
    networkViewmodel = networkListResult.data?.data[0]

    const activatedVenueIds: string[] = networkVenuesList.data?.filter(v => {
      return v.networks?.names? v.networks.names.includes(networkViewmodel.name) : false
    }).map(v => v.id) || []

    if (activatedVenueIds.length > 0) {
      // get "select All APs" settings
      const networkVenueUrlInfo = isTemplate ? ConfigTemplateUrlsInfo.getNetworkVenueTemplateRbac : WifiRbacUrlsInfo.getNetworkVenue
      const venueNetworkReqs = activatedVenueIds.map(venueId => {
        const params = {
          venueId: venueId,
          networkId: networkId
        }

        return fetchWithBQ(createHttpRequest(
          networkVenueUrlInfo,
          params,
          GetApiVersionHeader(ApiVersionEnum.v1)
        ))
      })
      const networkVenueResults = await Promise.allSettled(venueNetworkReqs)
      const networkVenueList = networkVenueResults.filter(isFulfilled).map(p => p.value.data)

      // Get "select specific AP Groups" settings
      networkViewmodel.venueApGroups?.forEach(venueApGroup => {
        const { apGroupIds, venueId, isAllApGroups } = venueApGroup
        if (!isAllApGroups) {
          apGroupIds?.forEach(apGroupId => {
            networkApGroupParamsList.push({ venueId, networkId, apGroupId })
          })
        }
      })
      const venueApGroupUrlInfo = isTemplate ? ConfigTemplateUrlsInfo.getVenueApGroupsRbac : WifiRbacUrlsInfo.getVenueApGroups
      const networkApGroupReqs = networkApGroupParamsList.map(params => {
        return fetchWithBQ(createHttpRequest(
          venueApGroupUrlInfo,
          params,
          GetApiVersionHeader(ApiVersionEnum.v1)
        ))
      })
      const networkAPGroupResults = await Promise.allSettled(networkApGroupReqs)
      const networkApGroupList = networkAPGroupResults.filter(isFulfilled).map(p => p.value.data)

      // need to get APGroupName from AP Group List
      const apGroupIds = uniq(networkApGroupParamsList.map(item => item.apGroupId).filter(item => item))
      const apGroupIdNameMap = await getApGroupIdNameMap(apGroupIds, isTemplate, fetchWithBQ)

      // fetch network vlan pool info
      const networkVlanPoolList = await fetchNetworkVlanPoolList([networkId], isTemplate, fetchWithBQ)

      // fetch AP Group vlan pool info
      const apGroupVenueIds = uniq(networkApGroupParamsList.map(item => item.venueId))
      const apGroupVlanPoolList = await fetchApGroupVlanPoolList(apGroupVenueIds, isTemplate, fetchWithBQ)

      const deepNetworks = activatedVenueIds.map(venueId => {
        const networkVenueIdx = findIndex(activatedVenueIds, (vId) =>
          (vId === venueId))

        const networkVenueResult = (networkVenueIdx < 0)
          ? undefined : networkVenueList[networkVenueIdx]
        const venueApGroupIds = networkApGroupParamsList.filter(params => (
          params.venueId === venueId && params.networkId === networkId
        ))
        const venueApGroups = venueApGroupIds?.map(params => {
          const venueApGroupIdx = findIndex(networkApGroupParamsList, (item) => (
            params.venueId === item.venueId &&
            params.networkId === item.networkId &&
            params.apGroupId === item.apGroupId
          ))

          if (venueApGroupIdx < 0) {
            return undefined
          }
          const networkApGroupRes = networkApGroupList[venueApGroupIdx]
          const apGroupName = apGroupIdNameMap.find(apg => apg.key === params.apGroupId)?.value

          const apgVlanPool = apGroupVlanPoolList?.data?.find(vlanPool => {
            const vlanPoolApGroups = vlanPool.wifiNetworkVenueApGroups.find(apg => {
              return (apg.venueId === venueId && apg.wifiNetworkId === networkId)
            })
            return vlanPoolApGroups && vlanPoolApGroups.apGroupIds.includes(params.apGroupId)
          })

          return {
            ...networkApGroupRes,
            ...params,
            radio: 'Both',
            isDefault: !apGroupName,
            apGroupName,
            ...(apgVlanPool && {
              vlanPoolId: apgVlanPool.id,
              vlanPoolName: apgVlanPool.name
            })
          }
        })

        const networkVlanPool = networkVlanPoolList?.data?.find(vlanPool => vlanPool.wifiNetworkIds?.includes(networkId))

        return {
          ...defaultNetworkVenue,
          ...networkVenueResult,
          ...(venueApGroups && { apGroups: venueApGroups }),
          networkId,
          venueId,
          ...(networkVlanPool && {
            vlanPoolId: networkVlanPool.id,
            vlanPoolName: networkVlanPool.name,
            vlanMembers: networkVlanPool.vlanMembers
          })
        }

      })

      networkDeep.venues = deepNetworks
    }
  } else {
    // eslint-disable-next-line no-console
    console.error('missing networkId')
  }

  return {
    error: networkVenuesListQuery.error,
    networkVenuesList,
    networkViewmodel,
    networkDeep,
    venueIds
  }
}

// replace the fetchRbacNetworkVenueList
export const fetchEnhanceRbacNetworkVenueList = async (queryArgs: RequestPayload<{ page?: number, pageSize?: number, isTemplate?: boolean }>, fetchWithBQ: any) => {
  const { params, payload } = queryArgs
  const networkVenuesListInfo = resolveRbacVenuesListFetchArgs(queryArgs)
  const networkVenuesListQuery = await fetchWithBQ(networkVenuesListInfo)
  const networkVenuesList = networkVenuesListQuery.data as TableResult<Venue>
  const venueIds:string[] = networkVenuesList.data?.map(v => v.id) || []

  const isTemplate = payload?.isTemplate ?? false
  const networkId = params?.networkId
  const networkApGroupParamsList: NetworkApGroupParams[] = []
  const targetNetworkIdList = networkId ? [networkId] : []
  let networkViewmodel = {} as WifiNetwork

  // eslint-disable-next-line max-len
  const networkDeepList = await getNetworkDeepList(targetNetworkIdList, fetchWithBQ, isTemplate, true)
  const networkDeep = Array.isArray(networkDeepList?.response)
    ? networkDeepList?.response[0]
    : undefined

  if (networkId && networkDeep) {
    const networkListResult = await fetchRbacNetworkList({
      payload: {
        fields: ['id', 'name', 'venueApGroups'],
        filters: { id: [networkId] },
        isTemplate
      }
    }, fetchWithBQ)
    networkViewmodel = networkListResult.data?.data[0]

    const activatedVenueIds: string[] = networkVenuesList.data?.filter(v => {
      return v.networks?.names? v.networks.names.includes(networkViewmodel.name) : false
    }).map(v => v.id) || []

    if (activatedVenueIds.length > 0) {
      // get networkVeneus
      const networkVenuesUrlInfo = isTemplate ? ConfigTemplateUrlsInfo.getNetworkVenuesTemplateRbac : WifiRbacUrlsInfo.getNetworkVenues
      const networkVenuesQuery = await fetchWithBQ({
        ...createHttpRequest(networkVenuesUrlInfo, undefined, GetApiVersionHeader(ApiVersionEnum.v1)),
        body: JSON.stringify({
          venueIds: activatedVenueIds,
          networkIds: [networkId]
        })
      })
      const networkVenueListData = networkVenuesQuery.data

      networkViewmodel.venueApGroups?.forEach(venueApGroup => {
        const { apGroupIds, venueId, isAllApGroups } = venueApGroup
        if (!isAllApGroups) {
          apGroupIds?.forEach(apGroupId => {
            networkApGroupParamsList.push({ venueId, networkId, apGroupId })
          })
        }
      })

      // need to get APGroupName from AP Group List
      const apGroupIds = uniq(networkApGroupParamsList.map(item => item.apGroupId).filter(item => item))
      const apGroupIdNameMap = await getApGroupIdNameMap(apGroupIds, isTemplate, fetchWithBQ)

      // fetch network vlan pool info
      const networkVlanPoolList = await fetchNetworkVlanPoolList([networkId], isTemplate, fetchWithBQ)
      const networkVlanPool = networkVlanPoolList?.data?.find(vlanPool => vlanPool.wifiNetworkIds?.includes(networkId))

      // fetch AP Group vlan pool info
      const apGroupVenueIds = uniq(networkApGroupParamsList.map(item => item.venueId))
      const apGroupVlanPoolList = await fetchApGroupVlanPoolList(apGroupVenueIds, isTemplate, fetchWithBQ)

      const deepNetworks = activatedVenueIds.map(venueId => {
        const networkVenues = (networkVenueListData?.data ?? []) as { networks: NetworkVenue[], venueId: string }[]
        const currentNetworkVenue = networkVenues.find((networkVenue) => networkVenue.venueId === venueId)

        const networkVenueResult = currentNetworkVenue?.networks?.[0]

        const venueApGroups = (!networkVenueResult)? undefined : ((networkVenueResult.isAllApGroups)
          ? []
          : networkVenueResult.apGroups?.map((apGroup: NetworkApGroup) => {
            const { apGroupId = '' } = apGroup
            const apGroupName = apGroupIdNameMap.find(apg => apg.key === apGroupId)?.value
            const apgVlanPool = apGroupVlanPoolList?.data?.find(vlanPool => {
              const vlanPoolApGroups = vlanPool.wifiNetworkVenueApGroups.find(apg => {
                return (apg.venueId === venueId && apg.wifiNetworkId === networkId)
              })
              return vlanPoolApGroups && vlanPoolApGroups.apGroupIds.includes(apGroupId)
            })

            return {
              ...apGroup,
              ...({ venueId, networkId }),
              radio: 'Both',
              isDefault: !apGroupName,
              apGroupName,
              ...(apgVlanPool && {
                vlanPoolId: apgVlanPool.id,
                vlanPoolName: apgVlanPool.name
              })
            }
          }))

        return {
          ...defaultNetworkVenue,
          ...networkVenueResult,
          ...(venueApGroups && { apGroups: venueApGroups }),
          networkId,
          venueId,
          ...(networkVlanPool && {
            vlanPoolId: networkVlanPool.id,
            vlanPoolName: networkVlanPool.name,
            vlanMembers: networkVlanPool.vlanMembers
          })
        } as NetworkVenue

      })

      networkDeep.venues = deepNetworks
    }
  } else {
    // eslint-disable-next-line no-console
    console.error('missing networkId')
  }

  return {
    error: networkVenuesListQuery.error,
    networkVenuesList,
    networkViewmodel,
    networkDeep,
    venueIds
  }
}

export const fetchRbacNetworkList = async (arg:any, fetchWithBQ:any) => {
  const venueApGroupFilters = getVenueApGroupFilters(arg.payload.filters)
  const isFilterByIsAllApGroups = venueApGroupFilters.includes('venueApGroups.isAllApGroups')
  const resolvedRequest = arg.payload.isTemplate
    ? createHttpRequest(ConfigTemplateUrlsInfo.getNetworkTemplateListRbac, arg.params)
    // eslint-disable-next-line max-len
    : createHttpRequest(CommonRbacUrlsInfo.getWifiNetworksList, arg.params, GetApiVersionHeader(ApiVersionEnum.v1))

  let updatedFilters = arg.payload.filters
  if (isFilterByIsAllApGroups) {
    updatedFilters = { ...omit(updatedFilters, 'venueApGroups.isAllApGroups') }
  }

  const networkListInfo = {
    ...resolvedRequest,
    body: JSON.stringify({
      ...arg.payload,
      filters: updatedFilters
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

function resolveGetNetworkApiInfo (isTemplate: boolean, enableRbac: boolean): ApiInfo {
  if (isTemplate) {
    return enableRbac
      ? ConfigTemplateUrlsInfo.getNetworkTemplateRbac
      : ConfigTemplateUrlsInfo.getNetworkTemplate
  }

  return enableRbac ? WifiRbacUrlsInfo.getNetwork : WifiUrlsInfo.getNetwork
}

function resolveRbacVenuesListFetchArgs (queryArgs: RequestPayload<{ isTemplate?: boolean }>): FetchArgs {
  const { params, payload } = queryArgs

  const venueTemplateListInfo = {
    ...createHttpRequest(ConfigTemplateUrlsInfo.getVenuesTemplateListRbac, params),
    body: JSON.stringify(payload)
  }

  const networkVenuesListInfo = {
    ...createHttpRequest(CommonUrlsInfo.getVenuesList, params),
    body: payload
  }

  return payload?.isTemplate ? venueTemplateListInfo : networkVenuesListInfo
}

export const updateNetworkVenueFn = (isTemplate: boolean = false) : QueryFn<CommonResult, RequestPayload> => {
  return async ({ params, payload, enableRbac }, _queryApi, _extraOptions, fetchWithBQ) => {
    try {
      const { oldPayload, newPayload } = payload as { oldPayload: NetworkVenue, newPayload: NetworkVenue }

      const urlInfo = isTemplate
        ? (enableRbac ? ConfigTemplateUrlsInfo.updateNetworkVenueTemplateRbac : ConfigTemplateUrlsInfo.updateNetworkVenue)
        : (enableRbac ? WifiRbacUrlsInfo.updateNetworkVenue : WifiUrlsInfo.updateNetworkVenue)

      const updateNetworkVenueInfo = {
        ...createHttpRequest(urlInfo, params),
        body: JSON.stringify(newPayload || payload) // newPayload is used for per apGroup setting update, otherwise use payload
      }
      const updateNetworkVenueQuery = await fetchWithBQ(updateNetworkVenueInfo)

      if (enableRbac) {
        // per ap groups settings and skip the all ap groups setting
        if ((!newPayload?.isAllApGroups && newPayload?.apGroups && oldPayload?.apGroups)
          || (!oldPayload && newPayload) // new payload and update the ap groups settings
        ) {
          const {
            updateApGroups,
            addApGroups,
            deleteApGroups,
            activatedVlanPoolParamsList,
            deactivatedVlanPoolParamsList
          } = apGroupsChangeSet(
            newPayload,
            oldPayload ?? {
              allApGroupsRadio: [RadioEnum._2_4_GHz, RadioEnum._5_GHz],
              apGroups: []
            } as unknown as NetworkVenue
          )

          if (addApGroups.length > 0) {
            const activateVenueApGroupUrlInfo = isTemplate ? ConfigTemplateUrlsInfo.activateVenueApGroupRbac : WifiRbacUrlsInfo.activateVenueApGroup
            await Promise.all(addApGroups.map(apGroup => {
              // add ap group to update list when there is not the default setting
              if (!isEqual(apGroup.radioTypes?.sort(), ['2.4-Ghz', '5-Ghz']) || apGroup.vlanId) {
                updateApGroups.push(apGroup)
              }

              const apGroupSettingReq = {
                ...createHttpRequest(
                  activateVenueApGroupUrlInfo, {
                    venueId: newPayload.venueId,
                    networkId: newPayload.networkId,
                    apGroupId: apGroup.apGroupId
                  })
              }
              return fetchWithBQ(apGroupSettingReq)
            }))
          }

          if (deleteApGroups.length > 0) {
            const deactivateVenueApGroupUrlInfo = isTemplate ? ConfigTemplateUrlsInfo.deactivateVenueApGroupRbac : WifiRbacUrlsInfo.deactivateVenueApGroup
            await Promise.all(deleteApGroups.map(apGroup => {
              const apGroupSettingReq = {
                ...createHttpRequest(
                  deactivateVenueApGroupUrlInfo, {
                    venueId: oldPayload.venueId,
                    networkId: oldPayload.networkId,
                    apGroupId: apGroup.apGroupId
                  })
              }
              return fetchWithBQ(apGroupSettingReq)
            }))
          }

          // deactivatedVlanPool need before the updateApGroups
          if (deactivatedVlanPoolParamsList.length > 0) {
            const deactivateApGroupVlanPoolUrlInfo = isTemplate ? PoliciesConfigTemplateUrlsInfo.deactivateApGroupVlanPool :WifiRbacUrlsInfo.deactivateApGroupVlanPool
            await Promise.all(deactivatedVlanPoolParamsList.map(params => {
              const activatedVlanPoolReq = createHttpRequest( deactivateApGroupVlanPoolUrlInfo, params )
              return fetchWithBQ(activatedVlanPoolReq)
            }))
          }

          if (updateApGroups.length > 0) {
            const updateVenueApGroupsUrlInfo = isTemplate ? ConfigTemplateUrlsInfo.updateVenueApGroupsRbac : WifiRbacUrlsInfo.updateVenueApGroups
            await Promise.all(updateApGroups.map(apGroup => {
              const apGroupSettingReq = {
                ...createHttpRequest(
                  updateVenueApGroupsUrlInfo, {
                    venueId: newPayload.venueId,
                    networkId: newPayload.networkId,
                    apGroupId: apGroup.apGroupId
                  }),
                body: JSON.stringify(apGroup)
              }
              return fetchWithBQ(apGroupSettingReq)
            }))
          }

          if (activatedVlanPoolParamsList.length > 0) {
            const activateApGroupVlanPoolUrlInfo = isTemplate ? PoliciesConfigTemplateUrlsInfo.activateApGroupVlanPool :WifiRbacUrlsInfo.activateApGroupVlanPool
            await Promise.all(activatedVlanPoolParamsList.map(params => {
              const activatedVlanPoolReq = createHttpRequest( activateApGroupVlanPoolUrlInfo, params )
              return fetchWithBQ(activatedVlanPoolReq)
            }))
          }
        }
      }

      return updateNetworkVenueQuery.data
        ? { data: updateNetworkVenueQuery.data as CommonResult }
        : { error: updateNetworkVenueQuery.error as FetchBaseQueryError }
    } catch (error) {
      return { error: error as FetchBaseQueryError }
    }
  }
}
