/* eslint-disable max-len */
import { FetchArgs, FetchBaseQueryError, FetchBaseQueryMeta, BaseQueryApi, RetryOptions } from '@reduxjs/toolkit/query'
import { MaybePromise, QueryReturnValue }                                                 from '@rtk-query/graphql-request-base-query/dist/GraphqlBaseQueryTypes'
import { each, keyBy, assign }                                                            from 'lodash'
import { Params }                                                                         from 'react-router-dom'
import { v4 as uuidv4 }                                                                   from 'uuid'

import { ServicesConfigTemplateUrlsInfo, DHCPUrls, VenueConfigTemplateUrlsInfo, GetApiVersionHeader, ApiVersionEnum, DHCPSaveData, DHCPConfigTypeEnum, WifiDhcpPoolUsages, LeaseUnit, IpUtilsService, TableResult, DHCPUsage, VenueDHCPProfile, VenueDHCPPoolInst } from '@acx-ui/rc/utils'
import { RequestPayload }                                                                                                                                                                                                                                           from '@acx-ui/types'
import { createHttpRequest }                                                                                                                                                                                                                                        from '@acx-ui/utils'

import { QueryFn } from './common'

type DhcpFetchFn = (arg: string | FetchArgs) => MaybePromise<QueryReturnValue<unknown, FetchBaseQueryError, FetchBaseQueryMeta>>

export const getDhcpProfileFn = (isTemplate = false): QueryFn<DHCPSaveData | null> => {
  const dhcpApis = isTemplate ? ServicesConfigTemplateUrlsInfo : DHCPUrls
  const venueApis = isTemplate ? VenueConfigTemplateUrlsInfo : DHCPUrls

  const fetchDhcpProfile = async (params: Params<string> | undefined, fetchWithBQ: DhcpFetchFn) => {
    const req = createHttpRequest(dhcpApis.getDhcpProfileDetailRbac, params, GetApiVersionHeader(ApiVersionEnum.v1_1))
    return await fetchWithBQ(req)
  }

  const fetchVenueIds = async (params: Params<string> | undefined, fetchWithBQ: DhcpFetchFn) => {
    const viewmodelReq = {
      ...createHttpRequest(dhcpApis.queryDhcpProfiles, params),
      body: JSON.stringify({ filters: { id: [params?.serviceId] } })
    }
    return await fetchWithBQ(viewmodelReq)
  }

  const fetchVenueUsage = async (venueIds: string[], fetchWithBQ: DhcpFetchFn, dhcpProfile: DHCPSaveData) => {
    if (dhcpProfile.dhcpMode === DHCPConfigTypeEnum.SIMPLE) {
      return venueIds.map(venueId => ({ venueId, totalIpCount: 0, usedIpCount: 0 }))
    }
    const requests = venueIds.map(venueId => ({ params: { venueId } }))
    const promises = requests.map((arg) => {
      const req = createHttpRequest(venueApis.getDhcpUsagesRbac, arg.params)
      return Promise.resolve(fetchWithBQ({ ...req })).then((result) => ({ id: arg.params.venueId, result }))
    })
    const results = await Promise.all(promises)
    const resultsById = results.reduce((acc: { [key: string]: QueryReturnValue }, { id, result }) => {
      acc[id] = result
      return acc
    }, {})
    return venueIds.map(venueId => {
      const data = resultsById[venueId]?.data as WifiDhcpPoolUsages
      if (data?.wifiDhcpPoolUsages) {
        const { totalIpCount, usedIpCount } = data.wifiDhcpPoolUsages.reduce(
          (acc, usage) => {
            acc.totalIpCount += (usage.totalIpCount ?? 0)
            acc.usedIpCount += (usage.usedIpCount ?? 0)
            return acc
          },
          { totalIpCount: 0, usedIpCount: 0 }
        )
        return { venueId, totalIpCount, usedIpCount }
      }
      return { venueId, totalIpCount: 0, usedIpCount: 0 }
    })
  }

  const transformDhcpResponse = (dhcpProfile: DHCPSaveData, arg: RequestPayload) => {
    each(dhcpProfile.dhcpPools, (pool) => {
      if (arg.enableRbac && !pool.id) {
        pool.id = uuidv4()
      }
      if (pool.leaseTimeMinutes && pool.leaseTimeMinutes > 0) {
        pool.leaseUnit = LeaseUnit.MINUTES
        pool.leaseTime = pool.leaseTimeMinutes + (pool.leaseTimeHours || 0) * 60
      } else {
        pool.leaseUnit = LeaseUnit.HOURS
        pool.leaseTime = pool.leaseTimeHours
      }
      pool.numberOfHosts = IpUtilsService.countIpRangeSize(pool.startIpAddress, pool.endIpAddress)
    })
    return dhcpProfile
  }

  return async (arg, _queryApi, _extraOptions, fetchWithBQ) => {
    const { params, enableRbac, payload } = arg as RequestPayload<{ needUsage: false }>

    if (!enableRbac) {
      const req = createHttpRequest(dhcpApis.getDHCProfileDetail, params)
      const res = await fetchWithBQ(req)
      const data = res.data as DHCPSaveData
      return data ? { data: (transformDhcpResponse(data, arg) as DHCPSaveData) } : { error: res.error as FetchBaseQueryError }
    } else {
      // Query viewmodel to get venueIds and get dhcpProfile concurrently
      const [viewmodelRes, dhcpProfileRes] = await Promise.all([
        fetchVenueIds(params, fetchWithBQ),
        fetchDhcpProfile(params, fetchWithBQ)
      ])

      if (viewmodelRes.error) return { error: viewmodelRes.error }
      if (dhcpProfileRes.error) return { error: dhcpProfileRes.error }
      const viewmodelData = viewmodelRes.data as TableResult<DHCPSaveData>
      const venueIds = viewmodelData.data[0]?.venueIds
      const dhcpProfile = dhcpProfileRes.data as DHCPSaveData

      // Get venue usage
      let usage: DHCPUsage[] = []
      if (payload?.needUsage && venueIds) {
        usage = await fetchVenueUsage(venueIds, fetchWithBQ, dhcpProfile)
      }

      // Merge data
      const mergedData = {
        ...(dhcpProfile as DHCPSaveData),
        venueIds: venueIds as string[],
        usage: usage?.length ? usage : undefined }
      const data = transformDhcpResponse(mergedData, arg)
      return { data }
    }
  }
}

export const getVenueDHCPProfileFn = (isTemplate = false): QueryFn<VenueDHCPProfile> => {
  const dhcpApis = isTemplate ? ServicesConfigTemplateUrlsInfo : DHCPUrls
  const venueApis = isTemplate ? VenueConfigTemplateUrlsInfo : DHCPUrls
  return async ({ params, enableRbac }: RequestPayload, _queryApi: BaseQueryApi, _extraOptions: RetryOptions, fetchWithBQ: (arg: string | FetchArgs) => MaybePromise<QueryReturnValue<unknown, FetchBaseQueryError, FetchBaseQueryMeta>>) => {
    if (!enableRbac) {
      const req = createHttpRequest(venueApis.getVenueDHCPServiceProfile, params)
      const res = await fetchWithBQ(req)
      return res.data ?
        { data: (res.data as VenueDHCPProfile) } : { error: res.error as FetchBaseQueryError }
    } else {
      // query viewmodel to get serviceId
      const viewmodelReq = {
        ...createHttpRequest(dhcpApis.queryDhcpProfiles, params),
        body: JSON.stringify({ filters: { venueIds: [params?.venueId] } }) }
      const result = await fetchWithBQ(viewmodelReq)
      const viewmodelData = result.data as TableResult<DHCPSaveData>

      if (viewmodelData && viewmodelData.data.length > 0) {
        // query venue DHCP profile by serviceId
        const serviceId = viewmodelData.data[0].id
        const req = { ...createHttpRequest(venueApis.getVenueDhcpServiceProfileRbac, { ...params, serviceId }) }
        const res = await fetchWithBQ(req)
        const venueDhcpProfile = res.data as VenueDHCPProfile
        const data = {
          ...venueDhcpProfile,
          serviceProfileId: serviceId || '',
          enabled: (venueDhcpProfile.activeDhcpPoolNames || []).length > 0,
          id: params?.venueId || '' }
        return res.data ? { data } : { error: res.error as FetchBaseQueryError }
      } else {
        return { data: { enabled: false, serviceProfileId: '', id: '' } }
      }
    }
  }
}

export const transformGetVenueDHCPPoolsResponse = (response: WifiDhcpPoolUsages | VenueDHCPPoolInst[], _meta: FetchBaseQueryMeta, arg: RequestPayload) => {
  if (arg.enableRbac) {
    const payload = (arg.payload as { venueDHCPProfile?: VenueDHCPProfile, dhcpProfile?: DHCPSaveData })
    const dhcpPoolUsagesMap = keyBy((response as WifiDhcpPoolUsages).wifiDhcpPoolUsages, 'name')
    // merge data
    const activePoolNames = payload.venueDHCPProfile?.activeDhcpPoolNames
    const mergedPools = payload.dhcpProfile?.dhcpPools.map((dhcpPool) => {
      const matchedPool = dhcpPoolUsagesMap[dhcpPool.name]
      const mergedPool = assign({}, dhcpPool, matchedPool)
      if (activePoolNames?.find(name => dhcpPool.name === name)) mergedPool.active = true
      return mergedPool
    })
    return mergedPools as VenueDHCPPoolInst[]
  }
  return response as VenueDHCPPoolInst[]
}