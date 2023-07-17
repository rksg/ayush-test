import { QueryCacheLifecycleApi, MutationCacheLifecycleApi } from '@reduxjs/toolkit/dist/query/endpointDefinitions'
import {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
  FetchBaseQueryMeta
} from '@reduxjs/toolkit/query/react'
import { Params } from 'react-router-dom'

import { getJwtToken, getTenantId } from '@acx-ui/utils'

import { initialSocket } from './initialSocket'

import { Transaction } from '.'

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

  const url = token ? `/activity?token=${token}&tenantId=${tenantId}`
    : `/activity?tenantId=${tenantId}`
  const socket = initialSocket(url)

  await cacheDataLoaded

  const onActivityChangedEvent = (data: string) => handler(JSON.parse(data))

  socket.on('activityChangedEvent', onActivityChangedEvent)

  await cacheEntryRemoved

  socket.off('activityChangedEvent', onActivityChangedEvent)
}
