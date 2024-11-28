import { FetchBaseQueryError, FetchBaseQueryMeta, QueryReturnValue } from '@reduxjs/toolkit/query'

import {
  CommonResult,
  ConfigTemplateUrlsInfo,
  NetworkVenue,
  PoliciesConfigTemplateUrlsInfo,
  WifiUrlsInfo
} from '@acx-ui/rc/utils'
import { RequestPayload, MaybePromise } from '@acx-ui/types'
import { ApiInfo, createHttpRequest }   from '@acx-ui/utils'

import { QueryFn } from './common'


// eslint-disable-next-line max-len
export const addNetworkVenueFn = () : QueryFn<CommonResult, RequestPayload> => {
  return async ({ params, payload, enableRbac }, _queryApi, _extraOptions, fetchWithBQ) => {
    try {
      const apis = ConfigTemplateUrlsInfo
      const req = createHttpRequest(
        enableRbac ? apis.addNetworkVenueTemplateRbac : apis.addNetworkVenueTemplate,
        params
      )

      const res = await fetchWithBQ({
        ...req,
        body: JSON.stringify(payload)
      })

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

// eslint-disable-next-line max-len
export function updateNetworkVenueFn (isTemplate = false): QueryFn<CommonResult, { oldData?: NetworkVenue, newData: NetworkVenue }> {
  // eslint-disable-next-line max-len
  const apiInfo: ApiInfo = isTemplate ? ConfigTemplateUrlsInfo.updateNetworkVenueTemplate : WifiUrlsInfo.updateNetworkVenue
  return async ({ params, payload, enableRbac }, _queryApi, _extraOptions, fetchWithBQ) => {
    try {
      const { newData, oldData } = payload!!

      const res = await fetchWithBQ({
        ...createHttpRequest(apiInfo, params, {
          'x-rks-new-ui': 'true'
        }),
        body: JSON.stringify(newData)
      })

      if(res.error) {
        return { error: res.error as FetchBaseQueryError }
      }
      if (enableRbac) {
        if (oldData) {
          // eslint-disable-next-line max-len
          const promises: MaybePromise<QueryReturnValue<CommonResult, FetchBaseQueryError, FetchBaseQueryMeta>>[] = []
          // eslint-disable-next-line max-len
          const activateApi: ApiInfo = isTemplate ? PoliciesConfigTemplateUrlsInfo.activateApGroupVlanPool :WifiUrlsInfo.activateApGroupVlanPool
          // eslint-disable-next-line max-len
          const deactivateApi: ApiInfo = isTemplate ? PoliciesConfigTemplateUrlsInfo.deactivateApGroupVlanPool: WifiUrlsInfo.activateApGroupVlanPool
          if (newData.isAllApGroups && !oldData.isAllApGroups) {
            oldData.apGroups?.filter(group => group.vlanPoolId !== undefined)
              .forEach(group => {
                promises.push(fetchWithBQ(
                  createHttpRequest(deactivateApi, {
                    apGroupId: group.apGroupId,
                    profileId: group.vlanPoolId,
                    networkId: oldData.networkId,
                    venueId: oldData.venueId
                  }, deactivateApi.defaultHeaders)))
              })
          } else if (!newData.isAllApGroups && oldData.isAllApGroups ) {
            newData.apGroups?.filter(group => group.vlanPoolId !== undefined)
              .forEach(group => {
                promises.push(fetchWithBQ(
                  createHttpRequest(activateApi, {
                    apGroupId: group.apGroupId,
                    profileId: group.vlanPoolId,
                    networkId: newData.networkId,
                    venueId: newData.venueId
                  }, activateApi.defaultHeaders)))
              })
          } else if (!newData.isAllApGroups && !oldData.isAllApGroups) {
            const oldMapping = new Map<string, string>()
            oldData.apGroups?.filter(group => group.vlanPoolId !== undefined)
              .forEach(group => oldMapping.set(group.apGroupId!!, group.vlanPoolId!!))
            const newMapping = new Map<string, string>()
            newData.apGroups?.filter(group => group.vlanPoolId !== undefined)
              .forEach(group => newMapping.set(group.apGroupId!!, group.vlanPoolId!!))
            newMapping.forEach((vlanPoolId, groupId ) => {
              if (!oldMapping.has(groupId) || oldMapping.get(groupId) !== vlanPoolId) {
                promises.push(fetchWithBQ(
                  createHttpRequest(activateApi, {
                    apGroupId: groupId,
                    profileId: vlanPoolId,
                    networkId: newData.networkId,
                    venueId: newData.venueId
                  }, activateApi.defaultHeaders)))
              }
            })
            oldMapping.forEach((vlanPoolId, groupId) => {
              if (!newMapping.has(groupId)) {
                promises.push(fetchWithBQ(
                  createHttpRequest(deactivateApi, {
                    apGroupId: groupId,
                    profileId: vlanPoolId,
                    networkId: newData.networkId,
                    venueId: newData.venueId
                  }, deactivateApi.defaultHeaders)))
              }
            })
          }
          await Promise.all(promises)
        }
      }

    } catch (error) {
      return { error: error as FetchBaseQueryError }
    }
    return { data: {} as CommonResult }
  }
}
