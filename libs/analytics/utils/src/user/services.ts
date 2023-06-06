import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import { RequestPayload }    from '@acx-ui/types'
import { createHttpRequest } from '@acx-ui/utils'

import { UserProfile } from './types'


export const userApi = createApi({
  baseQuery: fetchBaseQuery(),
  reducerPath: 'userApi',
  tagTypes: ['UserProfileRA'],
  refetchOnMountOrArgChange: true,
  endpoints: () => ({ })
})

export const { useGetUserProfileQuery } = userApi.injectEndpoints({
  endpoints: (build) => ({
    getUserProfile: build.query<UserProfile, RequestPayload>({
      query: () => createHttpRequest({
        method: 'get',
        url: '/analytics/api/rsa-mlisa-rbac/users/profile'
      }),
      transformResponse (userProfile: UserProfile) {
        return userProfile
      }
    })
  })
})
