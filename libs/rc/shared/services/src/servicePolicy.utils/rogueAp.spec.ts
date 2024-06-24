import { ApiVersionEnum, GetApiVersionHeader } from '@acx-ui/rc/utils'

import { executeAddRoguePolicy, executeGetVenueRoguePolicy, executeUpdateRoguePolicy, executeUpdateVenueRoguePolicy } from './rogueAp'

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
        // eslint-disable-next-line max-len
        payload: { id: undefined, name: 'name', description: 'desc', rules: [], venues: [], oldVenues: [], defaultPolicyId: 'defaultID' },
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

      const result = await executeAddRoguePolicy(mockProps)
      // eslint-disable-next-line max-len
      expect(mockedCreateHttpRequest).toHaveBeenCalledWith(mockProps.rbacApiInfo, mockProps.queryArgs.params, GetApiVersionHeader(mockProps.rbacApiVersionKey))
      expect(result).toEqual({ error: 'error' })
    })

    it('should call batchApi with correct parameters when enableRbac is true', async () => {
      mockProps.fetchWithBQ.mockResolvedValueOnce({ data: { response: { id: '987654321' } } })
      const result = await executeAddRoguePolicy(mockProps)
      expect(mockedBatchApi).toHaveBeenCalled()
      expect(result).toEqual({ data: { response: { id: '987654321' } } })
    })

    it('should return correct response when enableRbac is false', async () => {
      // eslint-disable-next-line max-len
      const mockNonRbacProps = { ...mockProps, queryArgs: { ...mockProps.queryArgs, enableRbac: false } }
      // eslint-disable-next-line max-len
      mockNonRbacProps.fetchWithBQ.mockResolvedValueOnce({ data: { response: { id: '987654321' } } })
      const result = await executeAddRoguePolicy(mockNonRbacProps)
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

      const result = await executeUpdateRoguePolicy(mockProps)
      expect(result).toEqual({ error: 'error' })
    })

    it('should call batchApi with correct parameters', async () => {
      mockProps.fetchWithBQ.mockResolvedValueOnce({ data: {} })
      mockedBatchApi.mockResolvedValue({})

      const result = await executeUpdateRoguePolicy(mockProps)
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

      const result = await executeGetVenueRoguePolicy(mockProps)
      expect(result).toEqual({ error: { error: 'error' } })
    })

    it('should return correcr response when enableRbac is true', async () => {
      // eslint-disable-next-line max-len
      mockProps.fetchWithBQ.mockResolvedValue({ data: { totalCount: 0, data: [], reportThreshold: 100 } })
      const result = await executeGetVenueRoguePolicy(mockProps)
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
      // eslint-disable-next-line max-len
      const mockNonRbacProps = { ...mockProps, queryArgs: { ...mockProps.queryArgs, enableRbac: false } }
      mockNonRbacProps.fetchWithBQ.mockResolvedValueOnce({ data: {} })
      const result = await executeGetVenueRoguePolicy(mockNonRbacProps)
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
      apiInfo: { url: '/api/regular', method: 'get' },
      rbacApiInfo: { url: '/api/rbac', method: 'get' },
      rbacApiVersionKey: ApiVersionEnum.v1,
      activateRoguePolicy: { url: '/api/activate', method: 'put' },
      deactivateRoguePolicy: { url: '/api/deactivate', method: 'delete' },
      fetchWithBQ: jest.fn()
    }

    it('should return error when fetchWithBQ fails', async () => {
      mockProps.fetchWithBQ.mockRejectedValueOnce({ error: 'error' })

      const result = await executeUpdateVenueRoguePolicy(mockProps)
      expect(result).toEqual({ error: { error: 'error' } })
    })

    // eslint-disable-next-line max-len
    it('should return correct response when both enable Rogue AP and enableRbac is true', async () => {
      mockProps.fetchWithBQ.mockResolvedValue({})
      const result = await executeUpdateVenueRoguePolicy(mockProps)
      expect(mockProps.fetchWithBQ).toHaveBeenCalledTimes(2)
      const { enabled, reportThreshold, roguePolicyId } = mockProps.queryArgs.payload
      expect(result).toEqual({
        data: { enabled, reportThreshold, roguePolicyId }
      })
    })

    // eslint-disable-next-line max-len
    it('should return correct response when enable Rogue AP is false and enableRbac is true', async () => {
      // eslint-disable-next-line max-len
      const newMockProps = { ...mockProps, queryArgs: { ...mockProps.queryArgs, payload: { ...mockProps.queryArgs.payload, enabled: false } } }
      newMockProps.fetchWithBQ.mockResolvedValue({})
      await executeUpdateVenueRoguePolicy(newMockProps)
      expect(newMockProps.fetchWithBQ).toHaveBeenCalledTimes(1)
    })

    it('should return correct response when enableRbac is false', async () => {
      // eslint-disable-next-line max-len
      const newMockProps = { ...mockProps, queryArgs: { ...mockProps.queryArgs, enableRbac: false } }
      newMockProps.fetchWithBQ.mockResolvedValue({ data: {} })
      const result = await executeUpdateVenueRoguePolicy(newMockProps)
      expect(result).toEqual({ data: {} })
    })
  })
})
