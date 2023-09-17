

import { configureStore } from '@reduxjs/toolkit'

import { notificationApiURL } from '@acx-ui/store'
import { mockRestApiQuery }   from '@acx-ui/test-utils'

import { preferencesApi } from '.'

describe('Services for notification apis', () => {
  const store = configureStore({
    reducer: {
      [preferencesApi.reducerPath]: preferencesApi.reducer
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat([preferencesApi.middleware])
  })

  describe('getPreferences' , () => {
    const fetchProps = {
      tenantId: 'fetch-tenant-id'
    }
    afterEach(() => {
      store.dispatch(preferencesApi.util.resetApiState())
    })
    it('should return correct data for preferences', async () => {
      const mockedPref = {
        incident: {
          P1: ['email']
        }
      }
      mockRestApiQuery(`${notificationApiURL}preferences`, 'get', {
        data: mockedPref
      })
      const { status, data, error } = await store.dispatch(
        preferencesApi.endpoints.getPreferences.initiate(fetchProps)
      )
      expect(status).toBe('fulfilled')
      expect(data).toStrictEqual({ data: mockedPref })
      expect(error).toBeUndefined()
    })
    it('should return rejected on error', async () => {
      mockRestApiQuery(`${notificationApiURL}preferences`, 'get', {
        error: new Error('unknown server error')
      })
      const { status, data, error } = await store.dispatch(
        preferencesApi.endpoints.getPreferences.initiate(fetchProps)
      )
      expect(status).toBe('rejected')
      expect(data).toBeUndefined()
      expect(error).toBeDefined()
    })
  })

  describe('setIncidentNotification', () => {
    const mutateProps = {
      tenantId: 'mutate-tenant-id',
      state: {
        P1: false,
        P2: false,
        P3: false,
        P4: false
      },
      preferences: {}
    }
    it('should return correct value on mutation', async () => {
      mockRestApiQuery(`${notificationApiURL}preferences`, 'post', {
        data: { success: true }
      })
      const data = await store.dispatch(
        preferencesApi.endpoints.setIncidentNotification.initiate({
          ...mutateProps,
          state: {
            ...mutateProps.state,
            P1: false,
            P2: true,
            P3: true
          },
          preferences: {
            incident: {
              P1: ['email'],
              P2: []
            }
          }
        })
      )
      expect(data).toStrictEqual({
        data: {
          data: { success: true }
        }
      })
    })
    it('should return correctly for undefined incidents', async () => {
      mockRestApiQuery(`${notificationApiURL}preferences`, 'post', {
        data: { success: true }
      })
      const data = await store.dispatch(
        preferencesApi.endpoints.setIncidentNotification.initiate({
          ...mutateProps,
          state: {
            ...mutateProps.state,
            P1: false,
            P2: true,
            P3: true
          },
          preferences: {
            incident: undefined
          }
        })
      )
      expect(data).toStrictEqual({
        data: {
          data: { success: true }
        }
      })
    })
  })
})