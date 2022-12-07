import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import {
  CommonUrlsInfo,
  createHttpRequest,
  RequestPayload,
  UserSettings,
  UserProfile,
  CloudVersion
} from '@acx-ui/rc/utils'


export const baseUserApi = createApi({
  baseQuery: fetchBaseQuery(),
  reducerPath: 'userApi',
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
        const cloudVersionReq = createHttpRequest(
          CommonUrlsInfo.getUserProfile,
          params
        )
        return {
          ...cloudVersionReq
        }
      }
    })
  })
})


export const { useGetAllUserSettingsQuery,
  useGetCloudVersionQuery,
  useGetUserProfileQuery } = userApi
