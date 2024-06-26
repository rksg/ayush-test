/* eslint-disable max-len */
import { FetchBaseQueryError, FetchBaseQueryMeta } from '@reduxjs/toolkit/query'
import { difference }                              from 'lodash'

import { SyslogPolicyDetailType, PoliciesConfigTemplateUrlsInfo, SyslogUrls, GetApiVersionHeader, ApiVersionEnum, TableResult, SyslogPolicyListType, VenueSyslogSettingType } from '@acx-ui/rc/utils'
import { RequestPayload }                                                                                                                                                     from '@acx-ui/types'
import { CommonResult }                                                                                                                                                       from '@acx-ui/user'
import { createHttpRequest, batchApi }                                                                                                                                        from '@acx-ui/utils'

import { QueryFn } from '../servicePolicy.utils'

export function addSyslogPolicy (isTemplate = false): QueryFn<CommonResult, RequestPayload<SyslogPolicyDetailType>> {
  const syslogApis = isTemplate ? PoliciesConfigTemplateUrlsInfo : SyslogUrls
  return async (args, _queryApi, _extraOptions, fetchWithBQ) => {
    const { params, payload, enableRbac, enableTemplateRbac } = args
    const resolvedEnableRbac = isTemplate ? enableTemplateRbac : enableRbac
    const headers = GetApiVersionHeader(resolvedEnableRbac ? ApiVersionEnum.v1_1 : undefined)
    const { venues, ...rest } = payload!
    const res = await fetchWithBQ({
      ...createHttpRequest(syslogApis.addSyslogPolicy, params, headers),
      body: JSON.stringify(resolvedEnableRbac ? { ...rest } : payload)
    })
    if (res.error) {
      return { error: res.error as FetchBaseQueryError }
    }
    if (resolvedEnableRbac) {
      const { response } = res.data as CommonResult
      const requests = venues?.map(venue => ({
        params: { policyId: response?.id, venueId: venue.id }
      }))
      await batchApi(syslogApis.bindVenueSyslog, requests ?? [],
        fetchWithBQ, GetApiVersionHeader(ApiVersionEnum.v1))
    }

    return { data: res.data as CommonResult }
  }
}

export function updateSyslogPolicy (isTemplate = false): QueryFn<CommonResult, RequestPayload<SyslogPolicyDetailType>> {
  const syslogApis = isTemplate ? PoliciesConfigTemplateUrlsInfo : SyslogUrls
  return async ({ params, payload, enableRbac, enableTemplateRbac }, _queryApi, _extraOptions,
    fetchWithBQ) => {
    const resolvedEnableRbac = isTemplate ? enableTemplateRbac : enableRbac
    const { id, venues, oldVenues, ...rest } = payload!
    const headers = GetApiVersionHeader(resolvedEnableRbac ? ApiVersionEnum.v1_1 : undefined)
    const res = await fetchWithBQ({
      ...createHttpRequest(syslogApis.updateSyslogPolicy, params, headers),
      body: JSON.stringify(resolvedEnableRbac ? { id, ...rest } : payload)
    })

    if(res.error) {
      return { error: res.error as FetchBaseQueryError }
    }
    if (resolvedEnableRbac) {
      const unbindReqs = difference(oldVenues, venues || []).map(venue => ({
        params: { policyId: id, venueId: venue.id }
      }))
      const bindReqs = difference(venues, oldVenues || []).map(venue => ({
        params: { policyId: id, venueId: venue.id }
      }))
      await Promise.all([
        batchApi(syslogApis.unbindVenueSyslog, unbindReqs, fetchWithBQ, GetApiVersionHeader(ApiVersionEnum.v1)),
        batchApi(syslogApis.bindVenueSyslog, bindReqs, fetchWithBQ, GetApiVersionHeader(ApiVersionEnum.v1))
      ])
    }
    return { data: res.data as CommonResult }
  }
}

export function getSyslogPolicy (isTemplate = false): QueryFn<SyslogPolicyDetailType, RequestPayload> {
  const syslogApis = isTemplate ? PoliciesConfigTemplateUrlsInfo : SyslogUrls
  return async ({ params, enableRbac }, _queryApi, _extraOptions, fetchWithBQ) => {
    if (enableRbac) {
      const req = createHttpRequest(syslogApis.getSyslogPolicy, params, GetApiVersionHeader(ApiVersionEnum.v1_1))
      const viewmodelReq = createHttpRequest(syslogApis.querySyslog, params, GetApiVersionHeader(ApiVersionEnum.v1))
      const [res, viewmodelRes] = await Promise.all([
        fetchWithBQ(req),
        fetchWithBQ({
          ...viewmodelReq,
          body: JSON.stringify({ filters: { id: [params!.policyId] } })
        })
      ])
      if (res.error || viewmodelRes.error) {
        return { error: res.error ?? viewmodelRes.error as FetchBaseQueryError }
      }

      const venueIds =
          (viewmodelRes.data as TableResult<SyslogPolicyListType>).data?.[0]?.venueIds
      const mergeData = {
        ...res.data as SyslogPolicyDetailType,
        ...(venueIds && venueIds?.length > 0) ? { venues: venueIds.map(id => ({ id, name: '' })) } : {}
      }
      return { data: mergeData as SyslogPolicyDetailType }
    } else {
      const req = createHttpRequest(syslogApis.getSyslogPolicy, params)
      const res = await fetchWithBQ(req)
      return res.data ? { data: res.data as SyslogPolicyDetailType } : { error: res.error as FetchBaseQueryError }
    }
  }
}

export const transformGetVenueSyslog = (response: VenueSyslogSettingType | TableResult<SyslogPolicyListType>, _meta: FetchBaseQueryMeta, arg: RequestPayload) => {
  if (arg.enableRbac) {
    const res = response as TableResult<SyslogPolicyListType>
    return res.data.length > 0
      ? { serviceProfileId: res.data[0].id, enabled: true } as VenueSyslogSettingType
      : { enabled: false } as VenueSyslogSettingType
  }
  return response as VenueSyslogSettingType
}