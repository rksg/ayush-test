import { QueryReturnValue }                        from '@reduxjs/toolkit/dist/query/baseQueryTypes'
import { MaybePromise }                            from '@reduxjs/toolkit/dist/query/tsHelpers'
import { FetchArgs }                               from '@reduxjs/toolkit/query'
import { FetchBaseQueryError, FetchBaseQueryMeta } from '@reduxjs/toolkit/query/react'
import { Params }                                  from 'react-router-dom'

import {
  AAARbacViewModalType,
  AAAViewModalType,
  AccessControlUrls,
  ApiVersionEnum, CommonResult,
  GetApiVersionHeader,
  Radius,
  TableResult
} from '@acx-ui/rc/utils'
import { RequestPayload }             from '@acx-ui/types'
import { ApiInfo, createHttpRequest } from '@acx-ui/utils'

// eslint-disable-next-line max-len
export function convertRbacDataToAAAViewModelPolicyList (input: TableResult<AAARbacViewModalType>): TableResult<AAAViewModalType> {
  const resolvedData = input.data.map(aaaRbacPolicy => {
    const { wifiNetworkIds, ...rest } = aaaRbacPolicy
    return { ...rest, networkIds: wifiNetworkIds }
  })
  return {
    ...input,
    data: resolvedData
  }
}

export function covertAAAViewModalTypeToRadius (data: AAAViewModalType): Radius {
  const { id, name, primary, secondary = '', type } = data
  const splitPrimary = primary.split(':')
  const splitSecondary = secondary.split(':')

  return {
    id,
    name,
    type,
    primary: {
      ip: splitPrimary[0],
      port: Number(splitPrimary[1])
    },
    ...(splitSecondary.length > 1 ? {
      secondary: {
        ip: splitSecondary[0],
        port: Number(splitSecondary[1])
      }
    } : {})
  }
}

interface CreateFetchArgsBasedOnRbacProps {
  apiInfo: ApiInfo
  rbacApiInfo?: ApiInfo
  rbacApiVersionKey?: ApiVersionEnum
  queryArgs: RequestPayload
}
export function createFetchArgsBasedOnRbac (props: CreateFetchArgsBasedOnRbacProps) {
  const { apiInfo, rbacApiInfo = apiInfo, rbacApiVersionKey, queryArgs } = props
  const enableRbac = queryArgs.enableRbac ?? false
  const resolvedApiInfo = enableRbac ? rbacApiInfo : apiInfo
  const apiVersionHeaders = GetApiVersionHeader(enableRbac ? rbacApiVersionKey : undefined)
  const resolvedPayload = enableRbac ? JSON.stringify(queryArgs.payload) : queryArgs.payload

  return {
    ...createHttpRequest(resolvedApiInfo, queryArgs.params, apiVersionHeaders),
    body: resolvedPayload
  }
}

type FetchData<T> = {
  data: T
}

export type profilePayload = {
  [key: string]: unknown
}

export interface comparisonObjectType {
  added: actionItem[]
  removed: actionItem[]
  updated: updateActionItem[]
}

export interface actionMapType {
  [key: string]: {
    added: (params: Params<string>) => FetchArgs
    removed: (params: Params<string>) => FetchArgs
    updated: (params: Params<string>, oldParams: Params<string>) => FetchArgs[]
  }
}

export interface wifiActionMapType {
  [key: string]: {
    added: (params: Params<string>) => Promise<CommonResult>
    removed: (params: Params<string>) => Promise<CommonResult>
    updated: (params: Params<string>, oldParams: Params<string>) => Promise<CommonResult>[]
  }
}

export interface actionItem {
  [key: string]: Params<string>
}

export interface updateActionItem {
  [key: string]: {
    oldAction: Params<string>,
    action: Params<string>
  }
}

export async function fetchAdditionalData<T, U> (
  fetchData: TableResult<T>,
  processFn: (data: T) => Promise<U>
): Promise<FetchData<TableResult<U>>> {
  const withAdditionalData = await Promise.all(
    fetchData.data.map(processFn)
  )

  return {
    data: {
      ...fetchData,
      data: withAdditionalData
    }
  }
}

export function comparePayload (
  currentPayload: profilePayload,
  oldPayload: profilePayload,
  id: string,
  // eslint-disable-next-line max-len
  itemProcessFn: (currentPayload: profilePayload, oldPayload: profilePayload, key: string, id: string) => actionItem | updateActionItem
) {
  const comparisonObject = {
    added: [],
    removed: [],
    updated: []
  } as comparisonObjectType

  for (const key in currentPayload) {
    if (!oldPayload[key]) {
      comparisonObject.added.push(itemProcessFn(currentPayload, {}, key, id) as actionItem)
    } else {
      if (JSON.stringify(currentPayload[key]) !== JSON.stringify(oldPayload[key])) {
        comparisonObject.updated.push(
          itemProcessFn(currentPayload, oldPayload, key, id) as updateActionItem
        )
      }
    }
  }

  for (const key in oldPayload) {
    if (!currentPayload[key]) {
      comparisonObject.removed.push(itemProcessFn(oldPayload, {}, key, id) as actionItem)
    }
  }

  return comparisonObject
}

export const accessControlActionMap = {
  l2AclPolicyId: {
    added: (params: Params<string>) => {
      return createHttpRequest(
        AccessControlUrls.activateL2AclOnAccessControlProfile,
        params,
        GetApiVersionHeader(ApiVersionEnum.v1)
      )
    },
    removed: (params: Params<string>) => {
      return createHttpRequest(
        AccessControlUrls.deactivateL2AclOnAccessControlProfile,
        params,
        GetApiVersionHeader(ApiVersionEnum.v1)
      )
    },
    updated: (oldParams: Params<string>, params: Params<string>) => {
      return [
        createHttpRequest(
          AccessControlUrls.deactivateL2AclOnAccessControlProfile,
          oldParams,
          GetApiVersionHeader(ApiVersionEnum.v1)
        ),
        createHttpRequest(
          AccessControlUrls.activateL2AclOnAccessControlProfile,
          params,
          GetApiVersionHeader(ApiVersionEnum.v1)
        )
      ]
    }
  },
  l3AclPolicyId: {
    added: (params: Params<string>) => {
      return createHttpRequest(
        AccessControlUrls.activateL3AclOnAccessControlProfile,
        params,
        GetApiVersionHeader(ApiVersionEnum.v1)
      )
    },
    removed: (params: Params<string>) => {
      return createHttpRequest(
        AccessControlUrls.deactivateL3AclOnAccessControlProfile,
        params,
        GetApiVersionHeader(ApiVersionEnum.v1)
      )
    },
    updated: (oldParams: Params<string>, params: Params<string>) => {
      return [
        createHttpRequest(
          AccessControlUrls.deactivateL3AclOnAccessControlProfile,
          oldParams,
          GetApiVersionHeader(ApiVersionEnum.v1)
        ),
        createHttpRequest(
          AccessControlUrls.activateL3AclOnAccessControlProfile,
          params,
          GetApiVersionHeader(ApiVersionEnum.v1)
        )
      ]
    }
  }
} as actionMapType

export const operateAction = async (
  comparisonObject: comparisonObjectType, actionMap: actionMapType,
  fetchWithBQ:(arg: string | FetchArgs) => MaybePromise<
    QueryReturnValue<unknown, FetchBaseQueryError, FetchBaseQueryMeta>>,
  enableRbac: boolean | undefined
) => {
  if (!enableRbac) return Promise.resolve()
  // eslint-disable-next-line max-len
  const removeActions: MaybePromise<QueryReturnValue<unknown, FetchBaseQueryError, FetchBaseQueryMeta>>[] = []
  for (const removedObject of comparisonObject.removed) {
    Object.entries(removedObject).forEach(([key, value]) => {
      if (key in actionMap) {
        removeActions.push(fetchWithBQ(actionMap[key].removed(value)))
      }
    })
  }
  await Promise.all(removeActions)
  // eslint-disable-next-line max-len
  const addActions: MaybePromise<QueryReturnValue<unknown, FetchBaseQueryError, FetchBaseQueryMeta>>[] = []
  for (const addedObject of comparisonObject.added) {
    Object.entries(addedObject).forEach(([key, value]) => {
      if (key in actionMap) {
        addActions.push(fetchWithBQ(actionMap[key].added(value)))
      }
    })
  }

  await Promise.all(addActions)
  // eslint-disable-next-line max-len
  const updateActions: MaybePromise<QueryReturnValue<unknown, FetchBaseQueryError, FetchBaseQueryMeta>>[] = []
  for(const updatedObject of comparisonObject.updated) {
    Object.entries(updatedObject).forEach(([key, value]) => {
      console.log('update', key, value, actionMap)
      if (key in actionMap) {
        // eslint-disable-next-line max-len
        const updatedActionRequests = actionMap[key].updated(value.oldAction, value.action)
        for (const request of updatedActionRequests) {
          updateActions.push(fetchWithBQ(request))
        }
      }
    })
  }
  console.log(updateActions)
  await Promise.all(updateActions)
}
