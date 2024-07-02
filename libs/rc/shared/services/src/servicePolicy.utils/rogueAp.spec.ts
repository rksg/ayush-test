import { BaseQueryApi } from '@reduxjs/toolkit/query'

import { ApiVersionEnum } from '@acx-ui/rc/utils'

import { addRoguePolicyFn, getVenueRoguePolicyFn, updateRoguePolicyFn, updateVenueRoguePolicyFn } from './rogueAp'

/* eslint-disable max-len */
const mockQueryApi: BaseQueryApi = {
  dispatch: jest.fn(),
  getState: jest.fn(),
  abort: jest.fn(),
  extra: {},
  signal: new AbortController().signal,
  endpoint: '',
  type: 'query'
}
const mockedCreateHttpRequest = jest.fn()
const mockedBatchApi = jest.fn()
jest.mock('@acx-ui/utils', () => ({
  ...jest.requireActual('@acx-ui/utils'),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createHttpRequest: (...args: any) => mockedCreateHttpRequest.apply(null, args),
  batchApi: () => mockedBatchApi()
}))

describe('rogueAp.utils', () => {
  afterEach(() => {
    jest.clearAllMocks()
    mockedBatchApi.mockRestore()
  })

  describe('executeAddRoguePolicy', () => {
    const mockProps = {
      queryArgs: {
        params: {},
        payload: { id: undefined, name: 'name', description: 'desc', rules: [], venues: [], oldVenues: [], defaultPolicyId: 'defaultID' },
        enableRbac: true
      },
      apiInfo: { url: '/api/regular', method: 'get' },
      rbacApiInfo: { url: '/roguePolicies', method: 'post', newApi: true, defaultHeaders: {
        'Accept': 'application/vnd.ruckus.v1+json',
        'Content-Type': 'application/vnd.ruckus.v1+json'
      } },
      rbacApiVersionKey: ApiVersionEnum.v1,
      activateRoguePolicyApiInfo: { url: '/api/activate', method: 'put' },
      fetchWithBQ: jest.fn()
    }

    it('should return error when fetchWithBQ fails', async () => {
      mockProps.fetchWithBQ.mockResolvedValueOnce({ error: 'error' })

      const result = await addRoguePolicyFn()(mockProps.queryArgs, mockQueryApi, {}, mockProps.fetchWithBQ)
      expect(mockedCreateHttpRequest).toHaveBeenCalledWith(mockProps.rbacApiInfo, mockProps.queryArgs.params)
      expect(result).toEqual({ error: 'error' })
    })

    it('should call batchApi with correct parameters when enableRbac is true', async () => {
      mockProps.fetchWithBQ.mockResolvedValueOnce({ data: { response: { id: '987654321' } } })
      const result = await addRoguePolicyFn()(mockProps.queryArgs, mockQueryApi, {}, mockProps.fetchWithBQ)
      expect(mockedBatchApi).toHaveBeenCalled()
      expect(result).toEqual({ data: { response: { id: '987654321' } } })
    })

    it('should return correct response when enableRbac is false', async () => {
      const mockNonRbacProps = { ...mockProps, queryArgs: { ...mockProps.queryArgs, enableRbac: false } }
      mockNonRbacProps.fetchWithBQ.mockResolvedValueOnce({ data: { response: { id: '987654321' } } })
      const result = await addRoguePolicyFn()(mockNonRbacProps.queryArgs, mockQueryApi, {}, mockNonRbacProps.fetchWithBQ)
      expect(mockedBatchApi).not.toHaveBeenCalled()
      expect(result).toEqual({ data: { response: { id: '987654321' } } })
    })
  })

  describe('executeUpdateRoguePolicy', () => {
    const mockProps = {
      queryArgs: {
        params: {},
        payload: { id: '12345', name: 'name', description: 'desc', rules: [],
          venues: [{ id: '2', name: 'venue 2' }, { id: '3', name: 'venue 3' }],
          oldVenues: [{ id: '1', name: 'venue 1' }, { id: '2', name: 'venue 2' }],
          defaultPolicyId: 'defaultID'
        },
        enableRbac: true
      },
      apiInfo: { url: '/api/regular', method: 'get' },
      rbacApiInfo: { url: '/api/rbac', method: 'get' },
      rbacApiVersionKey: ApiVersionEnum.v1,
      activateRoguePolicyApiInfo: { url: '/api/activate', method: 'put' },
      fetchWithBQ: jest.fn()
    }

    it('should return error when fetchWithBQ fails', async () => {
      mockProps.fetchWithBQ.mockResolvedValueOnce({ error: 'error' })

      const result = await updateRoguePolicyFn()(mockProps.queryArgs, mockQueryApi, {}, mockProps.fetchWithBQ)
      expect(result).toEqual({ error: 'error' })
    })

    it('should call batchApi with correct parameters', async () => {
      mockProps.fetchWithBQ.mockResolvedValueOnce({ data: {} })
      mockedBatchApi.mockResolvedValue({})

      const result = await updateRoguePolicyFn()(mockProps.queryArgs, mockQueryApi, {}, mockProps.fetchWithBQ)
      expect(mockedBatchApi).toHaveBeenCalledTimes(2)
      expect(result).toEqual({ data: {} })
    })
  })

  describe('executeGetVenueRoguePolicy', () => {
    const mockProps = {
      queryArgs: { params: {}, enableRbac: true },
      apiInfo: { url: '/api/regular', method: 'get' },
      rbacApiInfo: { url: '/api/rbac', method: 'get' },
      rbacApiVersionKey: ApiVersionEnum.v1,
      roguePolicyListRbacApiInfo: { url: '/api/query', method: 'post' },
      fetchWithBQ: jest.fn()
    }

    it('should return error when fetchWithBQ fails', async () => {
      mockProps.fetchWithBQ.mockRejectedValueOnce({ error: 'error' })

      const result = await getVenueRoguePolicyFn()(mockProps.queryArgs, mockQueryApi, {}, mockProps.fetchWithBQ)
      expect(result).toEqual({ error: { error: 'error' } })
    })

    it('should return correcr response when enableRbac is true', async () => {
      // eslint-disable-next-line max-len
      mockProps.fetchWithBQ.mockResolvedValue({ data: { totalCount: 0, data: [], reportThreshold: 100 } })
      const result = await getVenueRoguePolicyFn()(mockProps.queryArgs, mockQueryApi, {}, mockProps.fetchWithBQ)
      expect(mockProps.fetchWithBQ).toHaveBeenCalledTimes(2)
      expect(result).toEqual({
        data: {
          enabled: false,
          roguePolicyId: null,
          reportThreshold: 100
        }
      })
    })

    it('should return correct response when enableRbac is false', async () => {
      const mockNonRbacProps = { ...mockProps, queryArgs: { ...mockProps.queryArgs, enableRbac: false } }
      mockNonRbacProps.fetchWithBQ.mockResolvedValueOnce({ data: {} })
      const result = await getVenueRoguePolicyFn()(mockNonRbacProps.queryArgs, mockQueryApi, {}, mockNonRbacProps.fetchWithBQ)
      expect(mockNonRbacProps.fetchWithBQ).toHaveBeenCalled()
      expect(result).toEqual({ data: {} })
    })
  })

  describe('executeUpdateVenueRoguePolicy', () => {
    const mockProps = {
      queryArgs: {
        params: {},
        payload: {
          enabled: true,
          reportThreshold: 15,
          roguePolicyId: '12345',
          currentRoguePolicyId: '54321',
          currentReportThreshold: 5
        },
        enableRbac: true
      },
      _queryApi: mockQueryApi,
      _extraOptions: {},
      fetchWithBQ: jest.fn()
    }

    it('should return error when fetchWithBQ fails', async () => {
      mockProps.fetchWithBQ.mockRejectedValueOnce({ error: 'error' })

      const result = await updateVenueRoguePolicyFn()(mockProps.queryArgs, mockQueryApi, {}, mockProps.fetchWithBQ)
      expect(result).toEqual({ error: { error: 'error' } })
    })

    it('should return correct response when both enable Rogue AP and enableRbac is true', async () => {
      mockProps.fetchWithBQ.mockResolvedValue({})
      const result = await updateVenueRoguePolicyFn()(mockProps.queryArgs, mockQueryApi, {}, mockProps.fetchWithBQ)
      expect(mockProps.fetchWithBQ).toHaveBeenCalledTimes(2)
      const { enabled, reportThreshold, roguePolicyId } = mockProps.queryArgs.payload
      expect(result).toEqual({
        data: { enabled, reportThreshold, roguePolicyId }
      })
    })

    it('should return correct response when enable Rogue AP is false and enableRbac is true', async () => {
      const newMockProps = { ...mockProps, queryArgs: { ...mockProps.queryArgs, payload: { ...mockProps.queryArgs.payload, enabled: false } } }
      newMockProps.fetchWithBQ.mockResolvedValue({})
      await updateVenueRoguePolicyFn()(newMockProps.queryArgs, mockQueryApi, {}, newMockProps.fetchWithBQ)
      expect(newMockProps.fetchWithBQ).toHaveBeenCalledTimes(1)
    })

    it('should return correct response when enableRbac is false', async () => {
      const newMockProps = { ...mockProps, queryArgs: { ...mockProps.queryArgs, enableRbac: false } }
      newMockProps.fetchWithBQ.mockResolvedValue({ data: {} })
      const result = await updateVenueRoguePolicyFn()(newMockProps.queryArgs, mockQueryApi, {}, newMockProps.fetchWithBQ)
      expect(result).toEqual({ data: {} })
    })
  })
})
