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
  configRecommendation?: {
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

export type RecommendationStates = {
  crrm: boolean,
  aiOps: boolean,
}


type IncidentPreferencePayload = {
  states: {
    incident?: IncidentStates,
    configRecommendation?: RecommendationStates
  },
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
      query: ({ preferences, tenantId, states }) => {
        return {
          url: 'preferences',
          method: 'post',
          credentials: 'include',
          body: setPreferences(states, preferences),
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


const setPreferences = (
  states: Record<string, Record<string, boolean>>,
  ogPref: AnalyticsPreferences
): string => {
  const cp = cloneDeep(ogPref)
  Object.keys(states).forEach(type => {
    Object.entries(states[type]).forEach(([key, val]) => {
      let pref: NotificationMethod[] | undefined = get(cp[type as keyof typeof cp], key, undefined)
      if (val) {
        if (!get(cp, type, undefined)) {
          set(cp, type, {})
        }
        if (Array.isArray(pref) && pref.includes('email')) return
        const method: NotificationMethod[] = Array.isArray(pref)
          ? pref.concat(['email'])
          : ['email']
        set(cp, [type, key], method)
      } else {
        (get(cp, [type, key], undefined) && pref)
          && set(cp, [type, key], pref.filter(pref => pref !== 'email'))
      }
    })
  })
  return JSON.stringify(cp)
}