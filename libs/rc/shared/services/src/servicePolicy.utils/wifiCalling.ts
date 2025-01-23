import { FetchBaseQueryError } from '@reduxjs/toolkit/query'

import {
  ServicesConfigTemplateUrlsInfo,
  TableResult,
  WifiCallingFormContextType, WifiCallingSetting,
  WifiCallingUrls
} from '@acx-ui/rc/utils'
import { CommonResult }                from '@acx-ui/user'
import { batchApi, createHttpRequest } from '@acx-ui/utils'

import { QueryFn } from './common'


export function createWifiCallingFn (isTemplate = false)
  : QueryFn<CommonResult, WifiCallingFormContextType> {
  const wifiCallingApi = isTemplate ? ServicesConfigTemplateUrlsInfo : WifiCallingUrls

  return async (args, _queryApi, _extraOptions, fetchWithBQ) => {
    const { params, payload, enableRbac } = args
    const createWifiCallingServiceReq = createHttpRequest(
      enableRbac ? wifiCallingApi.addWifiCallingRbac : wifiCallingApi.addWifiCalling,
      params
    )

    const res = await fetchWithBQ({
      ...createWifiCallingServiceReq,
      body: JSON.stringify(payload)
    })

    if (res.error) {
      return { error: res.error as FetchBaseQueryError }
    }

    if (enableRbac && payload?.networkIds && payload?.networkIds.length > 0) {
      const { response } = res.data as CommonResult
      if (response?.id) {
        const requests = payload.networkIds.map(networkId => ({
          params: { serviceId: response?.id, networkId }
        }))
        await batchApi(wifiCallingApi.activateWifiCalling, requests, fetchWithBQ)
      }
    }

    return { data: res.data as CommonResult }
  }
}

export function updateWifiCallingFn (isTemplate = false)
  : QueryFn<CommonResult, WifiCallingFormContextType> {
  const wifiCallingApi = isTemplate ? ServicesConfigTemplateUrlsInfo : WifiCallingUrls

  return async (args, _queryApi, _extraOptions, fetchWithBQ) => {
    const { params, payload, enableRbac } = args
    const { networkIds, oldNetworkIds, ...restPayload } = payload ?? {}
    const apiInfo = enableRbac
      ? wifiCallingApi.updateWifiCallingRbac
      : wifiCallingApi.updateWifiCalling

    const res = await fetchWithBQ({
      ...createHttpRequest(apiInfo, params),
      body: JSON.stringify({
        ...restPayload,
        networkIds: enableRbac ? undefined : networkIds
      })
    })

    if (enableRbac) {
      const activateRequests = (networkIds || [])
        .filter(networkId => !oldNetworkIds?.includes(networkId))
        .map(networkId => ({ params: { networkId, serviceId: params?.serviceId } }))
      const deactivateRequests = (oldNetworkIds || [])
        .filter(networkId => !networkIds?.includes(networkId))
        .map(networkId => ({ params: { networkId, serviceId: params?.serviceId } }))

      await Promise.all([
        batchApi(wifiCallingApi.activateWifiCalling, activateRequests, fetchWithBQ),
        batchApi(wifiCallingApi.deactivateWifiCalling, deactivateRequests, fetchWithBQ)
      ])
    }

    return res.error
      ? { error: res.error as FetchBaseQueryError }
      : { data: res.data as CommonResult }
  }
}

export function getWifiCallingFn (isTemplate = false)
  : QueryFn<WifiCallingFormContextType> {
  const wifiCallingApi = isTemplate ? ServicesConfigTemplateUrlsInfo : WifiCallingUrls

  return async (args, _queryApi, _extraOptions, fetchWithBQ) => {
    const { params, enableRbac } = args
    const req = createHttpRequest(enableRbac
      ? wifiCallingApi.getWifiCallingRbac : wifiCallingApi.getWifiCalling, params)
    const resPromise = fetchWithBQ(req)

    if (enableRbac) {
      const payload = { filters: { id: [params?.serviceId] } }
      const viewmodelReq = createHttpRequest(wifiCallingApi.queryWifiCalling, params)

      const [res, viewmodelRes] = await Promise.all([
        resPromise,
        fetchWithBQ({ ...viewmodelReq, body: JSON.stringify(payload) })
      ])

      if (res.error || viewmodelRes.error) {
        return { error: res.error || viewmodelRes.error as FetchBaseQueryError }
      }

      const viewmodelData =
        (viewmodelRes.data as unknown as TableResult<WifiCallingFormContextType>)

      return {
        data: {
          ...res.data as WifiCallingFormContextType,
          networkIds: viewmodelData?.data?.[0].wifiNetworkIds ?? []
        } as WifiCallingFormContextType }
    } else {
      const res = await resPromise

      return res.data
        ? { data: res.data as WifiCallingFormContextType }
        : { error: res.error as FetchBaseQueryError }
    }
  }
}

export function queryWifiCallingFn (isTemplate = false)
  : QueryFn<TableResult<WifiCallingSetting>> {
  const wifiCallingApi = isTemplate ? ServicesConfigTemplateUrlsInfo : WifiCallingUrls

  return async (args, _queryApi, _extraOptions, fetchWithBQ) => {
    const { params, payload, enableRbac } = args
    const apiInfo = enableRbac
      ? wifiCallingApi.queryWifiCalling
      : wifiCallingApi.getEnhancedWifiCallingList
    const res = await fetchWithBQ({
      ...createHttpRequest(apiInfo, params),
      body: JSON.stringify(payload)
    })

    if (res.error) {
      return { error: res.error as FetchBaseQueryError }
    }

    if (enableRbac) {
      const wifiCallingData = res.data?.data
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ?.map((profile: any) => ({ ...profile, networkIds: profile.wifiNetworkIds }))

      return {
        data: {
          ...res.data,
          data: wifiCallingData
        }
      }
    }

    return { data: res.data as TableResult<WifiCallingSetting> }
  }
}
