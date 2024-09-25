import { QueryCacheLifecycleApi, MutationCacheLifecycleApi } from '@reduxjs/toolkit/dist/query/endpointDefinitions'
import {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
  FetchBaseQueryMeta
} from '@reduxjs/toolkit/query/react'
import { Params } from 'react-router-dom'

import { getUserProfile }          from '@acx-ui/user'
import { offActivity, onActivity } from '@acx-ui/utils'

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

  await cacheDataLoaded

  const onActivityChangedEvent = (data: string) => {
    const userProfile = getUserProfile()
    const jsonData = JSON.parse(data)
    if(userProfile.abacEnabled){
      const hasPermittedVenue = jsonData?.scopeType === 'venues' && jsonData?.scopeIds?.some(
        (id: string) => userProfile.venuesList?.includes(id))
      if(userProfile.hasAllVenues || hasPermittedVenue){
        handler(jsonData)
      }
    } else {
      handler(jsonData)
    }
  }

  onActivity(onActivityChangedEvent)

  await cacheEntryRemoved

  offActivity(onActivityChangedEvent)
}
