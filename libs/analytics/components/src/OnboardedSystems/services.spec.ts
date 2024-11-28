import '@testing-library/jest-dom'

import { rest } from 'msw'

import { store, smartZoneURL, Provider }                          from '@acx-ui/store'
import { act, mockRestApiQuery, mockServer, renderHook, waitFor } from '@acx-ui/test-utils'

import { mockSmartZoneList, mockFormattedSmartZoneList, mockSmartZoneStatusList } from './__tests__/fixtures'
import { smartZoneApi, useDeleteSmartZone }                                       from './services'

describe('smartzone services', () => {
  describe('useGetSmartZoneListQuery', () => {
    beforeEach(() => {
      store.dispatch(smartZoneApi.util.resetApiState())
    })
    it('should return smartzone list', async () => {
      mockServer.use(
        rest.post(`${smartZoneURL}/smartzones/query`, (_req, res, ctx) =>
          res(ctx.json(mockSmartZoneList)))
      )
      const { status, data, error } = await store.dispatch(
        smartZoneApi.endpoints.getSmartZoneList.initiate({})
      )
      expect(status).toBe('fulfilled')
      expect(data).toStrictEqual(mockFormattedSmartZoneList)
      expect(error).toBe(undefined)
    })
    it('should return error', async () => {
      mockRestApiQuery(`${smartZoneURL}/smartzones/query`, 'post', { status: 500 })
      const { status, data, error } = await store.dispatch(
        smartZoneApi.endpoints.getSmartZoneList.initiate({})
      )
      expect(status).toBe('rejected')
      expect(data).toBeUndefined()
      expect(error).toBeDefined()
    })
  })
  describe('useGetDistinctSmartZoneStatusQuery', () => {
    beforeEach(() => {
      store.dispatch(smartZoneApi.util.resetApiState())
    })
    it('should return distinct smartzone status', async () => {
      mockServer.use(
        rest.post(`${smartZoneURL}/smartzones/status/query`, (_req, res, ctx) =>
          res(ctx.json(mockSmartZoneStatusList)))
      )
      const { status, data, error } = await store.dispatch(
        smartZoneApi.endpoints.getDistinctSmartZoneStatus
          .initiate({})
      )
      expect(status).toBe('fulfilled')
      expect(data).toStrictEqual(mockSmartZoneStatusList)
      expect(error).toBe(undefined)
    })
    it('should return error', async () => {
      mockRestApiQuery(`${smartZoneURL}/smartzones/status/query`, 'post', { status: 500 })
      const { status, data, error } = await store.dispatch(
        smartZoneApi.endpoints.getDistinctSmartZoneStatus
          .initiate({})
      )
      expect(status).toBe('rejected')
      expect(data).toBeUndefined()
      expect(error).toBeDefined()
    })
  })
  describe('useDeleteSmartZone', () => {
    beforeEach(() => {
      store.dispatch(smartZoneApi.util.resetApiState())
    })
    it('should delete smartzone', async () => {
      mockRestApiQuery(`${smartZoneURL}/smartzones/id/delete`, 'delete', { status: 204 })
      const { result } = renderHook(useDeleteSmartZone, { wrapper: Provider, route: {} })
      act(() => { result.current.deleteSmartZone({ id: 'id', tenants: ['tenant1', 'tenant2'] }) })
      await waitFor(() => expect(result.current.response.status).toBe('fulfilled'))
      await waitFor(() => expect(result.current.response.data).toStrictEqual({ status: 204 }))
      await waitFor(() => expect(result.current.response.error).toBe(undefined))
    })
    it('should return error', async () => {
      mockRestApiQuery(`${smartZoneURL}/smartzones/id/delete`, 'delete', { status: 500 })
      const { result } = renderHook(useDeleteSmartZone, { wrapper: Provider, route: {} })
      act(() => { result.current.deleteSmartZone({ id: 'id', tenants: ['tenant1', 'tenant2'] }) })
      await waitFor(() => expect(result.current.response.status).toBe('rejected'))
      await waitFor(() => expect(result.current.response.data).toBeUndefined())
      await waitFor(() => expect(result.current.response.error).toBeDefined())
    })
  })
})
