import { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { Params }              from 'react-router-dom'

import {
  ApiVersionEnum, CommonRbacUrlsInfo, CommonUrlsInfo, ConfigTemplateUrlsInfo, GetApiVersionHeader,
  PoliciesConfigTemplateUrlsInfo,
  TableResult, Venue, VenueAPGroup, VenueApGroupRbacType, VLANPoolNetworkType, VlanPoolRbacUrls,
  VlanPoolUrls, VLANPoolVenues, VLANPoolViewModelRbacType,
  VLANPoolViewModelType,
  WifiUrlsInfo
} from '@acx-ui/rc/utils'
import { createHttpRequest } from '@acx-ui/utils'

import { QueryFn } from './common'

type GetVLANPoolVenuesFnResultType = TableResult<VLANPoolVenues>
type GetVLANPoolVenuesFnRequestType = { sortField?: string, sortOrder?: string }

// eslint-disable-next-line max-len
export function getVLANPoolVenuesFn (isTemplate = false) : QueryFn<GetVLANPoolVenuesFnResultType, GetVLANPoolVenuesFnRequestType, unknown> {
  return async ({ params, payload, enableRbac = false }, _api, _extraOptions, fetchWithBQ) => {
    const req = createVLANPoolVenuesHttpRequest(params, enableRbac, isTemplate)
    const res = await fetchWithBQ({ ...req, body: JSON.stringify(payload) })

    if (res.error) return { error: res.error as FetchBaseQueryError }

    if (!enableRbac) {
      return { data: res.data as TableResult<VLANPoolVenues> }
    } else {
      const fetchNetworkData = (wifiNetworkIds: string[]) => {
        return fetchWithBQ({
          ...createRbacNetworkListHttpRequest(params, isTemplate),
          body: JSON.stringify({
            filters: { id: wifiNetworkIds },
            fields: ['id', 'name', 'venueApGroups'],
            pageSize: 10000
          })
        })
      }

      // eslint-disable-next-line max-len
      const fetchVenuesList = async (venueIds: string[], payload: GetVLANPoolVenuesFnRequestType) => {
        const { sortField = 'name', sortOrder } = payload
        return fetchWithBQ({
          ...createRbacVenueListHttpRequest(params, isTemplate),
          body: JSON.stringify({
            filters: { id: venueIds },
            fields: ['id', 'name', 'aggregatedApStatus'],
            pageSize: 10000,
            // eslint-disable-next-line max-len
            ...(['venueName', 'name'].includes(sortField) && sortOrder ? { sortField: 'name', sortOrder } : {})
          })
        })
      }

      const result = res.data as TableResult<VLANPoolViewModelRbacType>
      if (result.totalCount > 0) {
        const allApGroupVenueSet = new Set<string> ()
        if((result.data[0].wifiNetworkIds?.length ?? 0) > 0) {
          const networkQuery = await fetchNetworkData(result.data[0].wifiNetworkIds!)

          if (networkQuery.error) {
            return { error: networkQuery.error as FetchBaseQueryError }
          }
          const networkData = networkQuery.data as TableResult<VLANPoolNetworkType>
          networkData.data?.forEach(v => {
            const val = v as VLANPoolNetworkType
            val.venueApGroups.filter(group => group.isAllApGroups)
              .forEach(group => allApGroupVenueSet.add(group.venueId))
          })
        }

        const venueApGroupMap = new Map<string, VenueApGroupRbacType>()

        result.data[0].wifiNetworkVenueApGroups.forEach(group => {
          venueApGroupMap.set(group.venueId, group)
        })

        const venueIds = [...venueApGroupMap.keys(), ...allApGroupVenueSet.keys()]

        if (venueIds.length === 0) {
          return { data: {} as TableResult<VLANPoolVenues> }
        }

        const venueRes = await fetchVenuesList(venueIds, payload as GetVLANPoolVenuesFnRequestType)

        if ( venueRes.error) {
          return { error: venueRes.error as FetchBaseQueryError }
        }

        const venues = venueRes.data as TableResult<Venue>
        return { data: {
          totalCount: venues.totalCount,
          page: 1,
          data: venues.data.map(venue => {
            const venueApGroup = venueApGroupMap.get(venue.id)
            return {
              venueId: venue.id,
              venueName: venue.name,
              venueApCount: venue.aggregatedApStatus
                ? Object.values(venue.aggregatedApStatus).reduce((a, b) => a + b, 0)
                : 0,
              apGroupData: allApGroupVenueSet.has(venue.id)
                ? [ { apGroupName: 'ALL_APS' } ]
                : venueApGroup?.apGroupIds.map(id => ({ apGroupId: id }))
            } as VLANPoolVenues
          })
        } as TableResult<VLANPoolVenues> }
      } else {
        return { data: {} as TableResult<VLANPoolVenues> }
      }
    }
  }
}

// eslint-disable-next-line max-len
export function createVLANPoolVenuesHttpRequest (params: Params<string> | undefined, enableRbac: boolean, isTemplate: boolean) {
  const url = enableRbac ? VlanPoolRbacUrls.getVLANPoolPolicyList : VlanPoolUrls.getVLANPoolVenues
  // eslint-disable-next-line max-len
  const configTemplateUrl = PoliciesConfigTemplateUrlsInfo[enableRbac ? 'getVlanPoolPolicyList' : 'getVlanPoolVenues']
  return createHttpRequest(isTemplate ? configTemplateUrl : url, params)
}

// eslint-disable-next-line max-len
export function createVLANPoolListHttpRequest (params: Params<string> | undefined, enableRbac: boolean, isTemplate: boolean) {
  // eslint-disable-next-line max-len
  const url = enableRbac ? VlanPoolRbacUrls.getVLANPoolPolicyList : WifiUrlsInfo.getVlanPoolViewModelList
  // eslint-disable-next-line max-len
  const configTemplateUrl = PoliciesConfigTemplateUrlsInfo[enableRbac ? 'getVlanPoolPolicyList' : 'getEnhancedVlanPools']
  return createHttpRequest(isTemplate ? configTemplateUrl : url, params)
}

// eslint-disable-next-line max-len
function createRbacNetworkListHttpRequest (params: Params<string> | undefined, isTemplate: boolean) {
  return isTemplate
    ? createHttpRequest(ConfigTemplateUrlsInfo.getNetworkTemplateListRbac, params)
    // eslint-disable-next-line max-len
    : createHttpRequest(CommonRbacUrlsInfo.getWifiNetworksList, params, GetApiVersionHeader(ApiVersionEnum.v1))
}

function createRbacVenueListHttpRequest (params: Params<string> | undefined, isTemplate: boolean) {
  return isTemplate
    ? createHttpRequest(ConfigTemplateUrlsInfo.getVenuesTemplateListRbac, params)
    // eslint-disable-next-line max-len
    : createHttpRequest(CommonUrlsInfo.getVenuesList, params, GetApiVersionHeader(ApiVersionEnum.v1))
}


// eslint-disable-next-line max-len
export function getVLANPoolPolicyViewModelListFn (isTemplate = false) : QueryFn<TableResult<VLANPoolViewModelType>, GetVLANPoolVenuesFnRequestType, unknown> {
  return async ({ params, payload, enableRbac = false }, _api, _extraOptions, fetchWithBQ) => {
    const req = createVLANPoolListHttpRequest(params, enableRbac, isTemplate)
    const res = await fetchWithBQ({ ...req, body: JSON.stringify(payload) })

    if (res.error) {
      return { error: res.error as FetchBaseQueryError }
    }
    if (!enableRbac) {
      return { data: res.data as TableResult<VLANPoolViewModelType> }
    } else {
      const data = res.data as TableResult<VLANPoolViewModelRbacType>
      const networkIds: string[] = [...new Set(data.data.map(v => v.wifiNetworkIds ?? []).flat())]
      const networkMap = new Map<string, VenueApGroupRbacType[]>()
      if (networkIds.length > 0) {
        const networkQuery = await fetchWithBQ({
          ...createRbacNetworkListHttpRequest(params, isTemplate),
          body: JSON.stringify({
            filters: { id: networkIds },
            fields: ['id', 'name', 'venueApGroups'],
            pageSize: 10000
          })
        })

        if (networkQuery.error) {
          return { error: networkQuery.error as FetchBaseQueryError }
        }

        const networkData = networkQuery.data as TableResult<VLANPoolNetworkType>
        networkData.data?.forEach(v => {
          const network = v as VLANPoolNetworkType
          networkMap.set(network.id, network.venueApGroups)
        })
      }

      const aggregated: VLANPoolViewModelType[] = data.data.map( v => {
        let val = v as VLANPoolViewModelRbacType
        const venueApGroups: VenueAPGroup[] = []
        const venueIds = new Set<string>()
        val.wifiNetworkIds?.forEach(networkId => {
          networkMap.get(networkId)?.forEach(group => {
            if (group.isAllApGroups) {
              venueApGroups.push({
                id: group.venueId,
                apGroups: [{
                  id: '',
                  allApGroups: true,
                  default: true
                }]
              })
              venueIds.add(group.venueId)
            }
          })
        })
        val.wifiNetworkVenueApGroups?.forEach(group => {
          venueIds.add(group.venueId)
          if (!group.isAllApGroups) {
            venueApGroups.push({
              id: group.venueId,
              apGroups: group.apGroupIds.map(id => {
                return {
                  id: id,
                  default: false,
                  allApGroups: false
                }
              })
            })
          }
        })

        return {
          id: val.id,
          name: val.name,
          vlanMembers: val.vlanMembers,
          networkIds: val.wifiNetworkIds,
          venueApGroups: venueApGroups,
          venueIds: [...venueIds]
        } as VLANPoolViewModelType
      })

      const ret: TableResult<VLANPoolViewModelType> = {
        totalCount: data.totalCount,
        data: aggregated,
        page: data.page
      }
      return { data: ret }
    }
  }
}
