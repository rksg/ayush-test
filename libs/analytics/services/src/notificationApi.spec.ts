

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
    it('should return correct value on preferences mutation', async () => {
      mockRestApiQuery(`${notificationApiURL}preferences`, 'post', {
        data: { success: true }
      }, false, true)
      const data = await store.dispatch(
        preferencesApi.endpoints.setNotification.initiate({
          tenantId: 'mutate-tenant-id',
          preferences: {
            incident: {
              P1: [],
              P2: ['email'],
              P3: ['email'],
              P4: []
            },
            configRecommendation: {
              crrm: [],
              aiOps: []
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
    it('should return correctly for undefined preferences', async () => {
      mockRestApiQuery(`${notificationApiURL}preferences`, 'post', {
        data: { success: true }
      }, false, true)
      const data = await store.dispatch(
        preferencesApi.endpoints.setNotification.initiate({
          tenantId: 'mutate-tenant-id',
          preferences: {}
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