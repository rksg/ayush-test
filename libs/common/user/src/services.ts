import { userApi }           from '@acx-ui/store'
import { RequestPayload }    from '@acx-ui/types'
import { createHttpRequest } from '@acx-ui/utils'

import {
  CloudVersion,
  CommonResult,
  MfaAuthApp,
  MfaDetailStatus,
  MfaOtpMethod,
  PlmMessageBanner,
  TenantAccountTierValue,
  UserSettings,
  UserProfile,
  UserSettingsUIModel,
  BetaStatus
} from './types'

export const UserUrlsInfo = {
  getCloudMessageBanner: {
    method: 'get',
    url: '/upgradeConfig/banners',
    oldUrl: '/api/upgrade/tenant/:tenantId/banner',
    newApi: true
  },
  updateUserProfile: {
    method: 'put',
    url: '/tenants/userProfiles',
    oldUrl: '/api/tenant/:tenantId/user-profile',
    newApi: true
  },
  getUserProfile: {
    method: 'get',
    url: '/tenants/userProfiles',
    oldUrl: '/api/tenant/:tenantId/user-profile',
    newApi: true
  },
  getAccountTier: {
    method: 'get',
    url: '/tenants/accountTier',
    newApi: true
  },
  getCloudVersion: {
    method: 'get',
    url: '/upgradeConfig/productVersions',
    oldUrl: '/api/upgrade/tenant/:tenantId/upgrade-version',
    newApi: true
  },
  getCloudScheduleVersion: {
    method: 'get',
    url: '/api/tenant/:tenantId/wifi/upgrade/schedule-version'
  },
  getAllUserSettings: {
    method: 'get',
    url: '/api/tenant/:tenantId/admin-settings/ui'
  },
  saveUserSettings: {
    method: 'put',
    url: '/api/tenant/:tenantId/admin-settings/ui/:productKey'
  },
  wifiAllowedOperations: {
    method: 'get',
    url: '/tenants/allowedOperations?service=wifi',
    oldUrl: '/api/tenant/:tenantId/wifi/allowed-operations',
    newApi: true
  },
  switchAllowedOperations: {
    method: 'get',
    url: '/tenants/allowedOperations?service=switch',
    oldUrl: '/api/switch/tenant/:tenantId/allowed-operations',
    newApi: true
  },
  tenantAllowedOperations: {
    method: 'get',
    url: '/tenants/allowed-operations',
    oldUrl: '/api/tenant/:tenantId/allowed-operations',
    newApi: true
  },
  venueAllowedOperations: {
    method: 'get',
    url: '/api/tenant/:tenantId/venue/allowed-operations'
  },
  guestAllowedOperations: {
    method: 'get',
    url: '/tenants/allowedOperations?service=guest',
    oldUrl: '/api/tenant/:tenantId/wifi/guest-user/allowed-operations',
    newApi: true
  },
  upgradeAllowedOperations: {
    method: 'get',
    url: '/tenants/allowedOperations?service=upgradeConfig',
    oldUrl: '/api/upgrade/tenant/:tenantId/allowed-operations',
    newApi: true
  },
  getMfaTenantDetails: {
    method: 'get',
    url: '/mfa/tenant/:tenantId'
  },
  getMfaAdminDetails: {
    method: 'get',
    url: '/mfa/admin/:userId'
  },
  mfaRegisterAdmin: {
    method: 'post',
    url: '/mfa/registerAdmin/:userId'
  },
  mfaRegisterPhone: {
    method: 'post',
    url: '/mfa/registerPhone/:userId'
  },
  setupMFAAccount: {
    method: 'post',
    url: '/mfa/setupAdmin/admin/:userId'
  },
  mfaResendOTP: {
    method: 'post',
    url: '/mfa/resendOTP/admin/:userId'
  },
  toggleMFA: {
    method: 'put',
    url: '/mfa/setupTenant/tenant/:tenantId/:enable'
  },
  getMfaMasterCode: {
    method: 'get',
    url: '/mfa/mastercode'
  },
  disableMFAMethod: {
    method: 'put',
    url: '/mfa/auth-method/:mfaMethod/disable'
  },
  getBetaStatus: {
    method: 'get',
    url: '/tenants/betaStatus',
    newApi: true
  },
  toggleBetaStatus: {
    method: 'put',
    url: '/tenants/betaStatus/:enable',
    newApi: true
  }
}

export const {
  useAllowedOperationsQuery,
  useGetAllUserSettingsQuery,
  useLazyGetAllUserSettingsQuery,
  useSaveUserSettingsMutation,
  useGetAccountTierQuery,
  useGetCloudVersionQuery,
  useGetCloudScheduleVersionQuery,
  useLazyGetCloudScheduleVersionQuery,
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
  useGetBetaStatusQuery,
  useToggleBetaStatusMutation
} = userApi.injectEndpoints({
  endpoints: (build) => ({
    getAllUserSettings: build.query<UserSettingsUIModel, RequestPayload>({
      query: ({ params }) => createHttpRequest(UserUrlsInfo.getAllUserSettings, params),
      transformResponse (userSettings: UserSettings) {
        let result:UserSettingsUIModel = {}
        Object.keys(userSettings).forEach((key: string) => {
          result[key] = JSON.parse(userSettings[key])
        })
        return result
      }
    }),
    saveUserSettings: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => ({
        ...createHttpRequest(UserUrlsInfo.saveUserSettings, params),
        body: payload
      })
    }),
    getAccountTier: build.query<TenantAccountTierValue, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(UserUrlsInfo.getAccountTier, params)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'UserProfile', id: 'ACCOUNT_TIER' }]
    }),
    getCloudVersion: build.query<CloudVersion, RequestPayload>({
      query: ({ params }) => createHttpRequest(UserUrlsInfo.getCloudVersion, params)
    }),
    getCloudScheduleVersion: build.query<CloudVersion, RequestPayload>({
      query: ({ params }) => createHttpRequest(UserUrlsInfo.getCloudScheduleVersion, params)
    }),
    getUserProfile: build.query<UserProfile, RequestPayload>({
      query: ({ params }) => createHttpRequest(UserUrlsInfo.getUserProfile, params),
      transformResponse (userProfile: UserProfile) {
        const { firstName, lastName } = userProfile
        userProfile.fullName = ''

        if (firstName && lastName) {
          userProfile.initials = `${firstName[0].toUpperCase()}${lastName[0].toUpperCase()}`
          userProfile.fullName = `${firstName} ${lastName}`
        }
        return userProfile
      },
      providesTags: ['UserProfile']
    }),
    updateUserProfile: build.mutation<Partial<UserProfile>, RequestPayload>({
      query: ({ params, payload }) => ({
        ...createHttpRequest(UserUrlsInfo.updateUserProfile, params),
        body: payload
      }),
      invalidatesTags: ['UserProfile']
    }),
    getPlmMessageBanner: build.query<PlmMessageBanner, RequestPayload>({
      query: ({ params }) => createHttpRequest(UserUrlsInfo.getCloudMessageBanner, params)
    }),
    allowedOperations: build.query<string[], string>({
      async queryFn (tenantId, _api, _extraOptions, query) {
        const params = { tenantId }
        const responses = await Promise.all([
          createHttpRequest(UserUrlsInfo.wifiAllowedOperations, params),
          createHttpRequest(UserUrlsInfo.switchAllowedOperations, params),
          createHttpRequest(UserUrlsInfo.tenantAllowedOperations, params),
          createHttpRequest(UserUrlsInfo.venueAllowedOperations, params),
          createHttpRequest(UserUrlsInfo.guestAllowedOperations, params),
          createHttpRequest(UserUrlsInfo.upgradeAllowedOperations, params)
        ].map(query))

        return { data: responses.flatMap(response => (response.data as string[])) }
      }
    }),
    getMfaTenantDetails: build.query<MfaDetailStatus, RequestPayload>({
      query: ({ params }) => createHttpRequest(UserUrlsInfo.getMfaTenantDetails, params ),
      transformResponse (mfaDetail: MfaDetailStatus) {
        mfaDetail.enabled = mfaDetail.tenantStatus === 'ENABLED'
        return mfaDetail
      },
      providesTags: [{ type: 'Mfa', id: 'DETAIL' }]
    }),
    getMfaAdminDetails: build.query<MfaDetailStatus, RequestPayload>({
      query: ({ params }) => createHttpRequest(UserUrlsInfo.getMfaAdminDetails, params),
      transformResponse (mfaDetail: MfaDetailStatus) {
        mfaDetail.enabled = mfaDetail.tenantStatus === 'ENABLED'
        return mfaDetail
      },
      providesTags: [{ type: 'Mfa', id: 'DETAIL' }]
    }),
    toggleMFA: build.mutation<CommonResult, RequestPayload>({
      query: ({ params }) => createHttpRequest(UserUrlsInfo.toggleMFA, params),
      invalidatesTags: [{ type: 'Mfa', id: 'DETAIL' }]
    }),
    // getMfaMasterCode: build.query<UserProfile, RequestPayload>({
    //   query: ({ params }) => createHttpRequest(UserUrlsInfo.getMfaMasterCode, params),
    //   transformResponse (userProfile: UserProfile) {
    //     userProfile.initials =
    //       userProfile.firstName[0].toUpperCase() + userProfile.lastName[0].toUpperCase()
    //     userProfile.fullName = `${userProfile.firstName} ${userProfile.lastName}`
    //     return userProfile
    //   }
    // }),
    mfaRegisterAdmin: build.mutation<MfaOtpMethod, RequestPayload>({
      query: ({ params, payload }) => ({
        ...createHttpRequest(UserUrlsInfo.mfaRegisterAdmin, params),
        body: payload
      })
    }),
    mfaRegisterPhone: build.query<MfaAuthApp, RequestPayload>({
      query: ({ params }) => createHttpRequest(UserUrlsInfo.mfaRegisterPhone, params)
    }),
    setupMFAAccount: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => ({
        ...createHttpRequest(UserUrlsInfo.setupMFAAccount, params),
        body: payload
      }),
      invalidatesTags: [{ type: 'Mfa', id: 'DETAIL' }]
    }),
    mfaResendOTP: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => ({
        ...createHttpRequest(UserUrlsInfo.mfaResendOTP, params),
        body: payload
      })
    }),
    disableMFAMethod: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => ({
        ...createHttpRequest(UserUrlsInfo.disableMFAMethod, params),
        body: payload
      }),
      invalidatesTags: [{ type: 'Mfa', id: 'DETAIL' }]
    }),
    getBetaStatus: build.query<BetaStatus, RequestPayload>({
      query: ({ params }) => createHttpRequest(UserUrlsInfo.getBetaStatus, params),
      transformResponse: (betaStatus: { 'Start Date': string, enabled: string }) =>
        ({ startDate: betaStatus['Start Date'], enabled: betaStatus.enabled })
    }),
    toggleBetaStatus: build.mutation<BetaStatus, RequestPayload>({
      query: ({ params }) => createHttpRequest(UserUrlsInfo.toggleBetaStatus, params)
    })
  })
})
