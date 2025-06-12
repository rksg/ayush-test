/* eslint-disable max-len */
import { CommonResult, EdgeConfigTemplateUrlsInfo } from '@acx-ui/rc/utils'
import { baseConfigTemplateApi }                    from '@acx-ui/store'
import { RequestPayload }                           from '@acx-ui/types'

import { commonQueryFn } from '../servicePolicy.utils'

export const EdgeConfigTemplateApi = baseConfigTemplateApi.injectEndpoints({
  endpoints: (build) => ({
    activateSdLanNetworkTemplate: build.mutation<CommonResult, RequestPayload>({
      query: commonQueryFn(EdgeConfigTemplateUrlsInfo.activateSdLanNetworkTemplate),
      invalidatesTags: [{ type: 'EdgeSdLanTemplate', id: 'LIST' }]
    })
  })
})