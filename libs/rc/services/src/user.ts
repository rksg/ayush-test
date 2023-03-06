import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import {
  CommonUrlsInfo,
  createHttpRequest,
  MfaAuthApp,
  MfaDetailStatus,
  MfaOtpMethod,
  PlmMessageBanner,
  RequestPayload,
  UserSettings,
  UserProfile,
  UserUrlsInfo,
  CloudVersion,
  CommonResult,
  GlobalValues
} from '@acx-ui/rc/utils'


export const baseUserApi = createApi({
  baseQuery: fetchBaseQuery(),
  reducerPath: 'userApi',
  tagTypes: ['UserProfile', 'Mfa'],
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
      },
      providesTags: [{ type: 'Mfa', id: 'DETAIL' }]
    }),
    getMfaAdminDetails: build.query<MfaDetailStatus, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(
          UserUrlsInfo.getMfaAdminDetails,
          params
        )
        return {
          ...req
        }
      },
      transformResponse (mfaDetail: MfaDetailStatus) {
        mfaDetail.enabled = mfaDetail.tenantStatus === 'ENABLED'
        return mfaDetail
      },
      providesTags: [{ type: 'Mfa', id: 'DETAIL' }]
    }),
    toggleMFA: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(UserUrlsInfo.toggleMFA, params)
        return {
          ...req
        }
      },
      invalidatesTags: [{ type: 'Mfa', id: 'DETAIL' }]
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
    mfaRegisterAdmin: build.mutation<MfaOtpMethod, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(UserUrlsInfo.mfaRegisterAdmin, params)
        return {
          ...req,
          body: payload
        }
      }
    }),
    mfaRegisterPhone: build.query<MfaAuthApp, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(UserUrlsInfo.mfaRegisterPhone, params)
        return {
          ...req
        }
      }
    }),
    setupMFAAccount: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(UserUrlsInfo.setupMFAAccount, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Mfa', id: 'DETAIL' }]
    }),
    mfaResendOTP: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(UserUrlsInfo.mfaResendOTP, params)
        return {
          ...req,
          body: payload
        }
      }
    }),
    disableMFAMethod: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(UserUrlsInfo.disableMFAMethod, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Mfa', id: 'DETAIL' }]
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
  useSetupMFAAccountMutation,
  useToggleMFAMutation,
  useGetMfaAdminDetailsQuery,
  useLazyGetMfaAdminDetailsQuery,
  useGetMfaTenantDetailsQuery,
  useLazyGetMfaTenantDetailsQuery,
  useMfaRegisterAdminMutation,
  useMfaRegisterPhoneQuery,
  useMfaResendOTPMutation,
  useDisableMFAMethodMutation,
  useGetGlobalValuesQuery
} = userApi
