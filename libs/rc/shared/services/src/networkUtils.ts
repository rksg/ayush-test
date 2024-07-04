/* eslint-disable max-len */
import { FetchBaseQueryError } from '@reduxjs/toolkit/query'

import {
  ApiVersionEnum,
  CommonResult,
  ConfigTemplateUrlsInfo,
  GetApiVersionHeader,
  WifiUrlsInfo
} from '@acx-ui/rc/utils'
import { RequestPayload }    from '@acx-ui/types'
import { createHttpRequest } from '@acx-ui/utils'

import { QueryFn } from './servicePolicy.utils'


export const addNetworkVenueFn = (isTemplate: boolean = false) : QueryFn<CommonResult, RequestPayload> => {
  return async ({ params, payload, enableRbac }, _queryApi, _extraOptions, fetchWithBQ) => {
    try {
      const urlsInfo = WifiUrlsInfo // enableRbac ? WifiRbacUrlsInfo : WifiUrlsInfo
      const apis = isTemplate ? ConfigTemplateUrlsInfo : urlsInfo
      const customHeaders = GetApiVersionHeader(enableRbac ? ApiVersionEnum.v1 : undefined)
      const req = createHttpRequest(
        isTemplate && enableRbac ? apis.addNetworkVenueTemplateRbac : apis.addNetworkVenue,
        params,
        customHeaders
      )

      const res = await fetchWithBQ({
        ...req,
        ...(enableRbac ? {} : { body: payload })
      })

      if (isTemplate && enableRbac) {
        const updateReq = createHttpRequest(
          apis.updateNetworkVenueTemplateRbac,
          params,
          customHeaders
        )

        await fetchWithBQ({
          ...updateReq,
          body: JSON.stringify(payload)
        })
      }

      if (res.error) {
        return { error: res.error as FetchBaseQueryError }
      } else {
        return { data: res.data as CommonResult }
      }
    } catch (error) {
      return { error: error as FetchBaseQueryError }
    }
  }
}
