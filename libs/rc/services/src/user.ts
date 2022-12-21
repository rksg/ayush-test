import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import {
  CommonUrlsInfo,
  createHttpRequest,
  MfaAuthApp,
  MfaDetailStatus,
  ProfileDataToUpdate,
  RequestPayload,
  UserSettings,
  UserProfile,
  UserUrlsInfo,
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
      }
    }),
    updateUserProfile: build.mutation<ProfileDataToUpdate, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(CommonUrlsInfo.updateUserProfile, params)
        return {
          ...req,
          body: payload
        }
      }
    }),
    getMfaTenantDetails: build.query<MfaDetailStatus, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(
          UserUrlsInfo.getMfaTenantDetails,
          params
        )
        return {
          ...req
        }
      },
      transformResponse (mfaDetail: MfaDetailStatus) {
        mfaDetail.enabled = mfaDetail.tenantStatus === 'ENABLED'
        return mfaDetail
      }
    }),
    getMfaAdminDetails: build.query<UserProfile, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(
          UserUrlsInfo.getMfaAdminDetails,
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
      }
    }),
    // getMfaMasterCode: build.query<UserProfile, RequestPayload>({
    //   query: ({ params }) => {
    //     const req = createHttpRequest(
    //       UserUrlsInfo.getMfaMasterCode,
    //       params
    //     )
    //     return {
    //       ...req
    //     }
    //   },
    //   transformResponse (userProfile: UserProfile) {
    //     userProfile.initials =
    //       userProfile.firstName[0].toUpperCase() + userProfile.lastName[0].toUpperCase()
    //     userProfile.fullName = `${userProfile.firstName} ${userProfile.lastName}`
    //     return userProfile
    //   }
    // }),
    mfaRegisterPhone: build.mutation<MfaAuthApp, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(UserUrlsInfo.mfaRegisterPhone, params)
        return {
          ...req
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
  useGetMfaTenantDetailsQuery,
  useGetMfaAdminDetailsQuery,
  // useGetMfaMasterCodeQuery,
  useMfaRegisterPhoneMutation
} = userApi
