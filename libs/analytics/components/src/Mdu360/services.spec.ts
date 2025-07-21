import { dataApiURL, Provider, store } from '@acx-ui/store'
import {
  act,
  mockGraphqlMutation,
  mockGraphqlQuery,
  renderHook,
  waitFor
} from '@acx-ui/test-utils'

import {
  api,
  useUpdateSlaThresholdsMutation,
  getSlaThresholdValue,
  mduThresholdMutation,
  mduThresholdQuery
} from './services'
import { SLAKeys }                    from './types'
import { mockTimeseriesResponseData } from './Widgets/ClientExperience/__tests__/fixtures'
import { TimeseriesPayload }          from './Widgets/ClientExperience/types'
import {
  mockMduThresholdQuery,
  mockQueryResponse,
  mockQueryResponseWithNullValues,
  mockUpdateSlaThresholdsQuery
} from './Widgets/SLA/__tests__/fixtures'
import { slaConfig }                              from './Widgets/SLA/constants'
import { MutationPayload, QueryPayload, SLAData } from './Widgets/SLA/types'

const mockClientExperiencePayload: TimeseriesPayload = {
  start: '2024-03-23T07:23:00+05:30',
  end: '2025-05-24T07:23:00+05:30'
}

const mockSLAThresholdsQueryPayload: QueryPayload = {
  mspEcIds: []
}

const mockSLAThresholdsMutationPayload: MutationPayload = {
  mspEcIds: [],
  slasToUpdate: {
    timeToConnectSLA: 10,
    clientThroughputSLA: 200000
  }
}

jest.mock('./services', () => ({
  ...jest.requireActual('./services'),
  mduThresholdQuery: jest.fn(),
  mduThresholdMutation: jest.fn()
}))

describe('ClientExperience services', () => {
  describe('clientExperienceTimeseries', () => {
    it('should return client experience timeseries data correctly', async () => {
      mockGraphqlQuery(dataApiURL, 'FranchisorTimeseries', {
        data: { franchisorTimeseries: mockTimeseriesResponseData }
      })
      const { status, data, error } = await store.dispatch(
        api.endpoints.clientExperienceTimeseries.initiate(
          mockClientExperiencePayload
        )
      )
      expect(status).toBe('fulfilled')
      expect(data).toStrictEqual(mockTimeseriesResponseData)
      expect(error).toBe(undefined)
    })

    it('should handle error', async () => {
      mockGraphqlQuery(dataApiURL, 'FranchisorTimeseries', {
        error: new Error('something went wrong!')
      })
      const { status, data, error } = await store.dispatch(
        api.endpoints.clientExperienceTimeseries.initiate(
          {} as TimeseriesPayload
        )
      )
      expect(status).toBe('rejected')
      expect(data).toBeUndefined()
      expect(error).not.toBeUndefined()
    })
  })
})

describe('SLA services', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    store.dispatch(api.util.resetApiState())
  })

  describe('getSlaThresholdValue', () => {
    it('should return SLA data correctly', () => {
      const data = getSlaThresholdValue(mockQueryResponse)
      expect(data).toEqual(mockQueryResponse)
    })

    it('should return empty object when data is undefined', () => {
      const data = getSlaThresholdValue(undefined as unknown as SLAData)
      expect(data).toEqual({})
    })

    it('should return default value when data is null', () => {
      const data = getSlaThresholdValue(mockQueryResponseWithNullValues)
      expect(data).toEqual({
        timeToConnectSLA: {
          value: slaConfig[SLAKeys.timeToConnectSLA].defaultValue!,
          isSynced: true,
          isDefault: true
        },
        clientThroughputSLA: {
          value: slaConfig[SLAKeys.clientThroughputSLA].defaultValue!,
          isSynced: true,
          isDefault: true
        },
        channelWidthSLA: {
          value: slaConfig[SLAKeys.channelWidthSLA].defaultValue!,
          isSynced: true,
          isDefault: true
        },
        channelChangePerDaySLA: {
          value: slaConfig[SLAKeys.channelChangeExperienceSLA].defaultValue!,
          isSynced: true,
          isDefault: true
        }
      })
    })
  })

  describe('slaThresholds', () => {
    it('should return SLA data correctly', async () => {
      (mduThresholdQuery as jest.Mock).mockReturnValue(mockMduThresholdQuery)
      mockGraphqlQuery(dataApiURL, 'GetMDUThresholds', {
        data: mockQueryResponse
      })

      const { status, data, error } = await store.dispatch(
        api.endpoints.slaThresholds.initiate(mockSLAThresholdsQueryPayload)
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
        api.endpoints.slaThresholds.initiate(mockSLAThresholdsQueryPayload)
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
        result.current[0](mockSLAThresholdsMutationPayload)
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
        result.current[0](mockSLAThresholdsMutationPayload)
      })
      await waitFor(() => expect(result.current[1].isLoading).toBe(false))
      expect(result.current[1].isError).toBe(true)
      expect(result.current[1].isSuccess).toBe(false)
    })
  })
})
