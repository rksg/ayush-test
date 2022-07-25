import { QueryCacheLifecycleApi } from '@reduxjs/toolkit/dist/query/endpointDefinitions'
import {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
  FetchBaseQueryMeta
} from '@reduxjs/toolkit/query/react'
import { Params } from 'react-router-dom'

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
  >,
  handler: (activityData: Transaction) => void
) {
  const { cacheDataLoaded, cacheEntryRemoved } = api

  const socket = initialSocket(`/activity?tenantId=${payload.params?.tenantId}`)

  try {
    await cacheDataLoaded

    if(!socket.hasListeners('activityChangedEvent')){
      socket.on('activityChangedEvent', (data: string) => handler(JSON.parse(data)))
    }

    await cacheEntryRemoved
  } catch {}
}
