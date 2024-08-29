import { QueryCacheLifecycleApi, MutationCacheLifecycleApi } from '@reduxjs/toolkit/dist/query/endpointDefinitions'
import {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
  FetchBaseQueryMeta
} from '@reduxjs/toolkit/query/react'
import { Params } from 'react-router-dom'


import { getTenantId, initialSocket, offActivity, onActivity } from '@acx-ui/utils'

import { Transaction } from '.'
import { getJwtToken } from '@acx-ui/config'

type RTKBaseQuery = BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError,
  unknown,
  FetchBaseQueryMeta
>

export async function onSocketActivityChanged <
  ReducerPath extends string,
  Response,
  Payload extends { params?: Params<string> }
> (
  payload: Payload,
  api: QueryCacheLifecycleApi<
    Payload,
    RTKBaseQuery,
    Response,
    ReducerPath
  > | MutationCacheLifecycleApi<
    Payload,
    RTKBaseQuery,
    Response,
    ReducerPath
  >,
  handler: (activityData: Transaction) => void
) {
  const { cacheDataLoaded, cacheEntryRemoved } = api

  const token = getJwtToken()
  const tenantId = getTenantId()

  const url1 = token ? `/activity?token=${token}&tenantId=${tenantId}`
    : `/activity?tenantId=${tenantId}`

  initialSocket(url1)

  await cacheDataLoaded

  const onActivityChangedEvent = (data: string) => handler(JSON.parse(data))

  // socket.on('onActivity', onActivityChangedEvent)
  onActivity(onActivityChangedEvent)

  await cacheEntryRemoved

  offActivity(onActivityChangedEvent)

  // socket.off('activityChangedEvent', onActivityChangedEvent)
}