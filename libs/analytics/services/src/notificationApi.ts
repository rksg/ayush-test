import { notificationApi } from '@acx-ui/store'

export type NotificationMethod = 'web' | 'email'
export type AnalyticsPreferenceType = 'incident' | 'licenses' | 'intentAI'

export type AnalyticsPreferences = {
  incident?: {
    P1?: NotificationMethod[]
    P2?: NotificationMethod[]
    P3?: NotificationMethod[]
    P4?: NotificationMethod[]
  }
  licenses?: {
    '60D': NotificationMethod[]
    '30D': NotificationMethod[]
    '7D': NotificationMethod[]
  }
  recipients?: string[]
  intentAI?: {
    all: NotificationMethod[]
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
