import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import {
  CommonUrlsInfo,
  createHttpRequest,
  PlmMessageBanner,
  RequestPayload,
  UserSettings,
  UserProfile,
  CloudVersion,
  GlobalValues
} from '@acx-ui/rc/utils'


export const baseUserApi = createApi({
  baseQuery: fetchBaseQuery(),
  reducerPath: 'userApi',
  tagTypes: ['UserProfile'],
  refetchOnMountOrArgChange: true,
  endpoints: () => ({ })
})

export const userApi = baseUserApi.injectEndpoints({
  endpoints: (build) => ({
    getAllUserSettings: build.query<UserSettings, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(
          CommonUrlsInfo.getAllUserSettings,
          params
        )
        return {
          ...req
        }
      },
      transformResponse (userSettings: UserSettings) {
        let result:{ [key: string]: string } = {}
        Object.keys(userSettings).forEach((key: string) => {
          result[key] = JSON.parse(userSettings[key])
        })
        return result
      }
    }),
    getCloudVersion: build.query<CloudVersion, RequestPayload>({
      query: ({ params }) => {
        const cloudVersionReq = createHttpRequest(
          CommonUrlsInfo.getCloudVersion,
          params
        )
        return {
          ...cloudVersionReq
        }
      }
    }),
    getUserProfile: build.query<UserProfile, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(
          CommonUrlsInfo.getUserProfile,
          params
        )
        return {
          ...req
        }
      },
      transformResponse (userProfile: UserProfile) {
        userProfile.initials =
          userProfile.firstName[0].toUpperCase() + userProfile.lastName[0].toUpperCase()
        userProfile.fullName = `${userProfile.firstName} ${userProfile.lastName}`
        return userProfile
      },
      providesTags: ['UserProfile']
    }),
    updateUserProfile: build.mutation<Partial<UserProfile>, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(CommonUrlsInfo.updateUserProfile, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: ['UserProfile']
    }),
    getPlmMessageBanner: build.query<PlmMessageBanner, RequestPayload>({
      query: ({ params }) => {
        const messageBannerReq = createHttpRequest(
          CommonUrlsInfo.getCloudMessageBanner,
          params
        )
        return {
          ...messageBannerReq
        }
      }
    }),
    getGlobalValues: build.query<GlobalValues, RequestPayload>({
      query: ({ params }) => {
        const values = createHttpRequest(
          CommonUrlsInfo.getGlobalValues,
          params
        )
        return {
          ...values
        }
      }
    })

  })
})
export const {
  useGetAllUserSettingsQuery,
  useGetCloudVersionQuery,
  useGetUserProfileQuery,
  useLazyGetUserProfileQuery,
  useUpdateUserProfileMutation,
  useGetPlmMessageBannerQuery,
  useGetGlobalValuesQuery
} = userApi
