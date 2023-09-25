import { cloneDeep, get, set } from 'lodash'

import { notificationApi } from '@acx-ui/store'
import { getJwtHeaders }   from '@acx-ui/utils'

type NotificationMethod = 'web' | 'email'


export type AnalyticsPreferences = {
  incident?: {
    P1?: NotificationMethod[]
    P2?: NotificationMethod[]
    P3?: NotificationMethod[]
    P4?: NotificationMethod[]
  }
  recommendation?: {
    crrm: NotificationMethod[]
    aiOps: NotificationMethod[]
  }
}

export type IncidentStates = {
  P1: boolean
  P2: boolean
  P3: boolean
  P4: boolean
}

type IncidentPreferencePayload = {
  states: Record<string, boolean>[],
  preferences: AnalyticsPreferences,
  tenantId: string
}

export type RecommendationStates = {
  crrm: boolean,
  aiOps: boolean,
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
    setIncidentNotification: build.mutation<{ success: boolean }, IncidentPreferencePayload>({
      query: ({ preferences, tenantId, states }) => {
        return {
          url: 'preferences',
          method: 'post',
          credentials: 'include',
          body: setIncidentPreferences(states, preferences),
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
  useSetIncidentNotificationMutation
} = preferencesApi


const setIncidentPreferences = (
  states: Record<string, boolean>[],
  ogPref: AnalyticsPreferences
): string => {
  const cp = cloneDeep(ogPref)
  for (let state in states) {
    Object.entries(state).forEach(([key, val]) => {
      let incidentPref: NotificationMethod[] | undefined = get(cp.incident, key, undefined)
      if (val) {
        if (!cp.incident) {
          cp.incident = {}
        }
        const method: NotificationMethod[] = Array.isArray(incidentPref)
          ? incidentPref.concat(['email'])
          : ['email']
        set(cp.incident, key, method)
      } else {
        (cp.incident && incidentPref)
          && set(cp.incident, key, incidentPref.filter(pref => pref !== 'email'))
      }
    })
  }
  return JSON.stringify(cp)
}