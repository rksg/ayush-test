import { dataApiURL, Provider, store } from '@acx-ui/store'
import {
  act,
  mockGraphqlMutation,
  mockGraphqlQuery,
  renderHook,
  waitFor
} from '@acx-ui/test-utils'

import {
  mockMduThresholdQuery,
  mockQueryResponse,
  mockUpdateSlaThresholdsQuery
} from './__tests__/fixtures'
import {
  api,
  mduThresholdMutation,
  mduThresholdQuery,
  MutationPayload,
  QueryPayload,
  useUpdateSlaThresholdsMutation
} from './services'

jest.mock('./services', () => ({
  ...jest.requireActual('./services'),
  mduThresholdQuery: jest.fn(),
  mduThresholdMutation: jest.fn()
}))

const mockQueryPayload: QueryPayload = {
  mspEcIds: []
}

const mockMutationPayload: MutationPayload = {
  mspEcIds: [],
  slasToUpdate: {
    timeToConnectSLA: 10,
    clientThroughputSLA: 200000
  }
}

describe('SLA services', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    store.dispatch(api.util.resetApiState())
  })

  describe('slaThresholds', () => {
    it('should return SLA data correctly', async () => {
      (mduThresholdQuery as jest.Mock).mockReturnValue(mockMduThresholdQuery)
      mockGraphqlQuery(dataApiURL, 'GetMDUThresholds', {
        data: mockQueryResponse
      })

      const { status, data, error } = await store.dispatch(
        api.endpoints.slaThresholds.initiate(mockQueryPayload)
      )

      expect(status).toBe('fulfilled')
      expect(data).toStrictEqual(mockQueryResponse)
      expect(error).toBeUndefined()
    })

    it('should handle error', async () => {
      mockGraphqlQuery(dataApiURL, 'GetMDUThresholds', {
        error: new Error('GraphQL error occurred')
      })

      const { status, data, error } = await store.dispatch(
        api.endpoints.slaThresholds.initiate(mockQueryPayload)
      )

      expect(status).toBe('rejected')
      expect(data).toBeUndefined()
      expect(error).not.toBeUndefined()
    })
  })

  describe('updateSlaThresholds', () => {
    it('should update SLA data correctly', async () => {
      (mduThresholdMutation as jest.Mock).mockReturnValue(
        mockMduThresholdQuery
      )
      mockGraphqlMutation(dataApiURL, 'SaveMultipleThresholds', {
        data: mockUpdateSlaThresholdsQuery
      })
      const { result } = renderHook(() => useUpdateSlaThresholdsMutation(), {
        wrapper: Provider
      })

      act(() => {
        result.current[0](mockMutationPayload)
      })
      await waitFor(() => expect(result.current[1].isSuccess).toBe(true))
    })

    it('should handle error', async () => {
      mockGraphqlMutation(dataApiURL, 'SaveMultipleThresholds', {
        error: new Error('GraphQL error occurred')
      })
      const { result } = renderHook(() => useUpdateSlaThresholdsMutation(), {
        wrapper: Provider
      })

      act(() => {
        result.current[0](mockMutationPayload)
      })
      await waitFor(() => expect(result.current[1].isLoading).toBe(false))
      expect(result.current[1].isError).toBe(true)
      expect(result.current[1].isSuccess).toBe(false)
    })
  })
})
