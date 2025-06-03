import { userApi }                             from '@acx-ui/store'
import { RequestPayload }                      from '@acx-ui/types'
import { createHttpRequest, ignoreErrorModal } from '@acx-ui/utils'

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
  BetaStatus,
  // FeatureAPIResults,
  BetaFeatures,
  AllowedOperationsResponse
} from './types'

export const getUserUrls = (enableRbac?: boolean | unknown) => {
  return enableRbac ? UserRbacUrlsInfo : UserUrlsInfo
}

interface VenueData {
  id?: string
}

interface Venue {
  data: VenueData[],
  fields: string[],
  page: number,
  totalCount: number
}

export interface PrivilegeGroup {
  id?: string,
  name?: string,
  type?: string,
  description?: string,
  roleName?: string,
  scope?: string,
  memberCount?: number,
  allCustomers?: boolean,
  allVenues?: boolean
}

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
    url: '/admins/admins-settings/ui',
    oldUrl: '/api/tenant/:tenantId/admin-settings/ui',
    newApi: true
  },
  saveUserSettings: {
    method: 'put',
    url: '/admins/admins-settings/ui/:productKey',
    oldUrl: '/api/tenant/:tenantId/admin-settings/ui/:productKey',
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
    url: '/mfa/setupTenant/tenant/:tenantId/:enable',
    opsApi: 'PUT:/mfa/setupTenant/{id}'
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
  },
  getFeatureFlagStates: {
    method: 'post',
    url: '/featureFlagStates',
    newApi: true
  },
  getVenuesList: {
    method: 'post',
    url: '/venues/query',
    oldUrl: '/api/viewmodel/tenant/:tenantId/venue',
    newApi: true
  }
}

export const UserRbacUrlsInfo = {
  getAccountTier: {
    method: 'get',
    url: '/tenants/self/query?accountTier',
    oldUrl: '/tenants/accountTier',
    newApi: true
  },
  getAllUserSettings: {
    method: 'get',
    url: '/admins/settings/ui',
    oldUrl: '/admins/admins-settings/ui',
    newApi: true
  },
  saveUserSettings: {
    method: 'PATCH',
    url: '/admins/settings/ui/:productKey',
    oldUrl: '/admins/admins-settings/ui/:productKey',
    newApi: true
  },
  getBetaStatus: {
    method: 'get',
    url: '/tenants/self/query?betaStatus',
    oldUrl: '/tenants/betaStatus',
    newApi: true
  },
  toggleBetaStatus: {
    method: 'PATCH',
    url: '/tenants/self',
    oldUrl: '/tenants/betaStatus/:enable',
    opsApi: 'PATCH:/tenants/self',
    newApi: true
  },
  getPrivilegeGroups: {
    method: 'get',
    url: '/roleAuthentications/privilegeGroups',
    newApi: true
  },
  getMfaTenantDetails: {
    method: 'get',
    url: '/mfa',
    newApi: true
  },
  toggleMFA: {
    method: 'put',
    url: '/mfa/setupTenant/:enable',
    opsApis: 'PUT:/mfa/setupTenant/{id}',
    newApi: true
  },
  getBetaFeatureList: {
    method: 'get',
    url: '/tenants/betaFeatures',
    newApi: true
  },
  updateBetaFeatureList: {
    method: 'put',
    url: '/tenants/betaFeatures',
    newApi: true
  },
  getAllowedOperations: {
    method: 'get',
    url: '/allowedOperations',
    newApi: false // TODO: Awaiting backend support
  }
}

export const {
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
  useToggleBetaStatusMutation,
  useFeatureFlagStatesQuery,
  useGetPrivilegeGroupsQuery,
  useGetVenuesListQuery,
  useGetBetaFeatureListQuery,
  useUpdateBetaFeatureListMutation,
  useGetAllowedOperationsQuery
} = userApi.injectEndpoints({
  endpoints: (build) => ({
    getAllUserSettings: build.query<UserSettingsUIModel, RequestPayload>({
      query: ({ params, enableRbac }) =>
        createHttpRequest(enableRbac
          ? UserRbacUrlsInfo.getAllUserSettings
          : UserUrlsInfo.getAllUserSettings, params),
      transformResponse (userSettings: UserSettings) {
        let result:UserSettingsUIModel = {}
        Object.keys(userSettings).forEach((key: string) => {
          result[key] = JSON.parse(userSettings[key])
        })
        return result
      }
    }),
    saveUserSettings: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload, enableRbac }) => ({
        ...createHttpRequest(enableRbac
          ? UserRbacUrlsInfo.saveUserSettings
          : UserUrlsInfo.saveUserSettings, params),
        body: payload
      })
    }),
    getAccountTier: build.query<TenantAccountTierValue, RequestPayload>({
      query: ({ params, enableRbac }) => {
        const userUrlsInfo = getUserUrls(enableRbac)
        const req = createHttpRequest(userUrlsInfo.getAccountTier, params)
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

    getAllowedOperations: build.query<AllowedOperationsResponse, void>({
      query: () => createHttpRequest(UserRbacUrlsInfo.getAllowedOperations)
    }),

    getMfaTenantDetails: build.query<MfaDetailStatus, RequestPayload>({
      query: ({ params, enableRbac }) => {
        const userUrlsInfo = getUserUrls(enableRbac)
        const req = createHttpRequest(userUrlsInfo.getMfaTenantDetails, params)
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
      query: ({ params }) => createHttpRequest(UserUrlsInfo.getMfaAdminDetails, params),
      transformResponse (mfaDetail: MfaDetailStatus) {
        mfaDetail.enabled = mfaDetail.tenantStatus === 'ENABLED'
        return mfaDetail
      },
      providesTags: [{ type: 'Mfa', id: 'DETAIL' }]
    }),
    toggleMFA: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, enableRbac }) => {
        const userUrlsInfo = getUserUrls(enableRbac)
        const req = createHttpRequest(userUrlsInfo.toggleMFA, params)
        return {
          ...req
        }
      },
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
      query: ({ params, payload }) => {
        const req = createHttpRequest(UserUrlsInfo.setupMFAAccount, params, {
          ...ignoreErrorModal
        })
        return {
          ...req,
          body: payload
        }
      },
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
      query: ({ params, enableRbac }) => {
        const userUrlsInfo = getUserUrls(enableRbac)
        const req = createHttpRequest(userUrlsInfo.getBetaStatus, params)
        return {
          ...req
        }
      },
      transformResponse: (betaStatus: { startDate: string, enabled: string }) =>
        ({ startDate: betaStatus?.startDate, enabled: betaStatus?.enabled }),
      providesTags: [{ type: 'Beta', id: 'DETAIL' }]
    }),
    toggleBetaStatus: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload, enableRbac }) => {
        const userUrlsInfo = getUserUrls(enableRbac)
        const req = createHttpRequest(userUrlsInfo.toggleBetaStatus, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Beta', id: 'DETAIL' }]
    }),
    featureFlagStates: build.query<{ [key: string]: boolean }, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(UserUrlsInfo.getFeatureFlagStates, params)
        return{
          ...req,
          body: payload
        }
      }
    }),
    getPrivilegeGroups: build.query<PrivilegeGroup[], RequestPayload>({
      query: ({ params }) => {
        const req =
          createHttpRequest(UserRbacUrlsInfo.getPrivilegeGroups, params)
        return {
          ...req
        }
      }
    }),
    getVenuesList: build.query<Venue, RequestPayload>({
      query: ({ params, payload }) => {
        const req =
          createHttpRequest(UserUrlsInfo.getVenuesList, params)
        return {
          ...req,
          body: payload
        }
      },
      providesTags: [{ type: 'Venue', id: 'LIST' }]
    }),
    getBetaFeatureList: build.query<BetaFeatures, RequestPayload>({
      query: ({ params }) => {
        const req = createHttpRequest(UserRbacUrlsInfo.getBetaFeatureList, params)
        return {
          ...req
        }
      },
      providesTags: [{ type: 'Beta', id: 'DETAIL' }]
    }),
    updateBetaFeatureList: build.mutation<CommonResult, RequestPayload>({
      query: ({ params, payload }) => {
        const req = createHttpRequest(UserRbacUrlsInfo.updateBetaFeatureList, params)
        return {
          ...req,
          body: payload
        }
      },
      invalidatesTags: [{ type: 'Beta', id: 'DETAIL' }]
    })
  })
})
