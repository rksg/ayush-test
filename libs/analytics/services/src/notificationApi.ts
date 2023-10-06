import { notificationApi } from '@acx-ui/store'
import { getJwtHeaders }   from '@acx-ui/utils'

export type NotificationMethod = 'web' | 'email'
export type AnalyticsPreferenceType = 'incident' | 'configRecommendation'

export type AnalyticsPreferences = {
  incident?: {
    P1?: NotificationMethod[]
    P2?: NotificationMethod[]
    P3?: NotificationMethod[]
    P4?: NotificationMethod[]
  }
  configRecommendation?: {
    crrm: NotificationMethod[]
    aiOps: NotificationMethod[]
  }
}

type IncidentPreferencePayload = {
  preferences: AnalyticsPreferences,
  tenantId: string
}

export const preferencesApi = notificationApi.injectEndpoints({
  endpoints: (build) => ({
    getPreferences: build.query<AnalyticsPreferences, {
      tenantId: string
    }>({
      query: ({ tenantId }) => {
        return {
          url: 'preferences',
          method: 'get',
          credentials: 'include',
          headers: {
            ...getJwtHeaders(),
            'x-mlisa-tenant-id': tenantId,
            'x-mlisa-user-id': tenantId
          }
        }
      },
      providesTags: [{ type: 'Notification', id: 'GET_PREFERENCES' }],
      transformResponse: (response: AnalyticsPreferences) => response
    }),
    setNotification: build.mutation<{ success: boolean }, IncidentPreferencePayload>({
      query: ({ preferences, tenantId }) => {
        return {
          url: 'preferences',
          method: 'post',
          credentials: 'include',
          body: JSON.stringify(preferences),
          headers: {
            ...getJwtHeaders(),
            'x-mlisa-tenant-id': tenantId,
            'x-mlisa-user-id': tenantId,
            'content-type': 'application/json'
          }
        }
      },
      invalidatesTags: [{ type: 'Notification', id: 'GET_PREFERENCES' }]
    })
  })
})

export const {
  useGetPreferencesQuery,
  useSetNotificationMutation
} = preferencesApi
