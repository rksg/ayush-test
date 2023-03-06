import { userApi }           from '@acx-ui/store'
import { RequestPayload }    from '@acx-ui/types'
import { createHttpRequest } from '@acx-ui/utils'

import {
  CloudVersion,
  PlmMessageBanner,
  UserSettings,
  UserProfile,
  // TODO
  // remove once Sean addressed this
  GlobalValues
} from './types'

export const Urls = {
  // TODO
  // remove once Sean addressed this
  getGlobalValues: {
    method: 'get',
    url: '/api/ui/globalValues'
  },
  getCloudMessageBanner: {
    method: 'get',
    url: '/api/upgrade/tenant/:tenantId/banner'
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
  getCloudVersion: {
    method: 'get',
    url: '/api/upgrade/tenant/:tenantId/upgrade-version'
  },
  getAllUserSettings: {
    method: 'get',
    url: '/api/tenant/:tenantId/admin-settings/ui'
  },
  wifiAllowedOperations: {
    method: 'get',
    url: '/api/tenant/:tenantId/wifi/allowed-operations'
  },
  switchAllowedOperations: {
    method: 'get',
    url: '/api/switch/tenant/:tenantId/allowed-operations'
  },
  tenantAllowedOperations: {
    method: 'get',
    url: '/api/tenant/:tenantId/allowed-operations'
  },
  venueAllowedOperations: {
    method: 'get',
    url: '/api/tenant/:tenantId/venue/allowed-operations'
  },
  guestAllowedOperations: {
    method: 'get',
    url: '/api/tenant/:tenantId/wifi/guest-user/allowed-operations'
  },
  upgradeAllowedOperations: {
    method: 'get',
    url: '/api/upgrade/tenant/:tenantId/allowed-operations'
  }
}

export const {
  // TODO
  // remove once Sean addressed this
  useGetGlobalValuesQuery,
  useAllowedOperationsQuery,
  useGetAllUserSettingsQuery,
  useGetCloudVersionQuery,
  useGetUserProfileQuery,
  useLazyGetUserProfileQuery,
  useUpdateUserProfileMutation,
  useGetPlmMessageBannerQuery
} = userApi.injectEndpoints({
  endpoints: (build) => ({
    getAllUserSettings: build.query<UserSettings, RequestPayload>({
      query: ({ params }) => createHttpRequest(Urls.getAllUserSettings, params),
      transformResponse (userSettings: UserSettings) {
        let result:{ [key: string]: string } = {}
        Object.keys(userSettings).forEach((key: string) => {
          result[key] = JSON.parse(userSettings[key])
        })
        return result
      }
    }),
    getCloudVersion: build.query<CloudVersion, RequestPayload>({
      query: ({ params }) => createHttpRequest(Urls.getCloudVersion, params)
    }),
    getUserProfile: build.query<UserProfile, RequestPayload>({
      query: ({ params }) => createHttpRequest(Urls.getUserProfile, params),
      transformResponse (userProfile: UserProfile) {
        userProfile.initials =
          userProfile.firstName[0].toUpperCase() + userProfile.lastName[0].toUpperCase()
        userProfile.fullName = `${userProfile.firstName} ${userProfile.lastName}`
        return userProfile
      },
      providesTags: ['UserProfile']
    }),
    updateUserProfile: build.mutation<Partial<UserProfile>, RequestPayload>({
      query: ({ params, payload }) => ({
        ...createHttpRequest(Urls.updateUserProfile, params),
        body: payload
      }),
      invalidatesTags: ['UserProfile']
    }),
    getPlmMessageBanner: build.query<PlmMessageBanner, RequestPayload>({
      query: ({ params }) => createHttpRequest(Urls.getCloudMessageBanner, params)
    }),
    // TODO
    // remove once Sean addressed this
    getGlobalValues: build.query<GlobalValues, RequestPayload>({
      query: ({ params }) => createHttpRequest(Urls.getGlobalValues, params)
    }),
    allowedOperations: build.query<string[], string>({
      async queryFn (tenantId, _api, _extraOptions, query) {
        const params = { tenantId }
        const responses = await Promise.all([
          createHttpRequest(Urls.wifiAllowedOperations, params),
          createHttpRequest(Urls.switchAllowedOperations, params),
          createHttpRequest(Urls.tenantAllowedOperations, params),
          createHttpRequest(Urls.venueAllowedOperations, params),
          createHttpRequest(Urls.guestAllowedOperations, params),
          createHttpRequest(Urls.upgradeAllowedOperations, params)
        ].map(query))

        return { data: responses.flatMap(response => (response.data as string[])) }
      }
    })
  })
})
