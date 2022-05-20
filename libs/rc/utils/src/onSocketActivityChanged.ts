import { QueryCacheLifecycleApi } from '@reduxjs/toolkit/dist/query/endpointDefinitions'
import {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
  FetchBaseQueryMeta
} from '@reduxjs/toolkit/query/react'
import { Params } from 'react-router-dom'
import io         from 'socket.io-client'

import { websocketServerUrl } from '.'


type RTKBaseQuery = BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError,
  unknown,
  FetchBaseQueryMeta
>

interface ActivityResponse {
  useCase: string
  status: 'SUCCESS'
}

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
  handler: (activityData: ActivityResponse) => void
) {
  const { cacheDataLoaded, cacheEntryRemoved } = api

  const socket = io.connect(`/activity?tenantId=${payload.params?.tenantId}`, {
    path: websocketServerUrl,
    secure: true,
    reconnection: true,
    transports: ['websocket'],
    rejectUnauthorized: false
  })
  try {
    await cacheDataLoaded

    socket.on('activityChangedEvent', (data: string) => handler(JSON.parse(data)))
  } finally {
    await cacheEntryRemoved

    socket.off('activityChangedEvent')
  }
}
