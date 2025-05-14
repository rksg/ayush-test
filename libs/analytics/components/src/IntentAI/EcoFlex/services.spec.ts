import { Provider, intentAIApi, intentAIUrl, store } from '@acx-ui/store'
import { mockGraphqlQuery, renderHook, waitFor }     from '@acx-ui/test-utils'

import { mockedIntentAIPowerSavePlan }                            from './__tests__/fixtures'
import { mocked, mockKpiData, mockKpiResultDataWithUnknownField } from './__tests__/mockedEcoFlex'
import {
  useIntentAIEcoFlexQuery,
  useLazyApPowerSaveDistributionQuery
}                                from './services'

const mockedIntentParams = jest.fn()

jest.mock('../useIntentDetailsQuery', () => ({
  ...jest.requireActual('../useIntentDetailsQuery'),
  useIntentParams: () => mockedIntentParams
}))

describe('IntentAI EcoFlex service', () => {
  beforeEach(() => {
    mockedIntentParams.mockReset()
    store.dispatch(intentAIApi.util.resetApiState())
  })
  afterEach(() => jest.resetAllMocks())
  describe('useIntentAIEcoFlexQuery', () => {
    it('should return correct data', async () => {
      mockGraphqlQuery(intentAIUrl, 'IntentAIEcoKpi', {
        data: { intent: mockKpiData }
      })
      const params = {
        root: mocked.root,
        sliceId: mocked.sliceId,
        code: mocked.code
      }

      mockedIntentParams.mockReturnValue(params)

      const { result } = renderHook(() => useIntentAIEcoFlexQuery(), { wrapper: Provider })
      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(result.current.data?.compareData.timestamp)
        .toEqual(mockKpiData.kpi.compareData.timestamp)
      expect(result.current.data?.compareData.data.unsupported)
        .toEqual(mockKpiData.kpi.compareData.result.unsupported)
      expect(result.current.data?.data.timestamp).toEqual(mockKpiData.kpi.data.timestamp)
      expect(result.current.data?.data.data.unsupported)
        .toEqual(mockKpiData.kpi.data.result.unsupported)
    })

    it('should return correct data for applied status', async () => {
      mockGraphqlQuery(intentAIUrl, 'IntentAIEcoKpi', {
        data: { intent: {} }
      })
      const params = {
        root: 'no-kpi-data-root',
        sliceId: 'noo-kpi-data-slice-id',
        code: mocked.code
      }
      mockedIntentParams.mockReturnValue(params)

      const { result } = renderHook(() => useIntentAIEcoFlexQuery(), { wrapper: Provider })
      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(result.current.data?.data.timestamp).toEqual('')
      expect(result.current.data?.compareData.timestamp).toEqual('')
    })

    it('should return value as 0 when kpi result field is unknown', async () => {
      mockGraphqlQuery(intentAIUrl, 'IntentAIEcoKpi', {
        data: { intent: mockKpiResultDataWithUnknownField }
      })
      const params = {
        root: 'xxx-data-root',
        sliceId: 'xxx-data-slice-id',
        code: mocked.code
      }
      mockedIntentParams.mockReturnValue(params)

      const { result } = renderHook(() => useIntentAIEcoFlexQuery(), { wrapper: Provider })
      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      // kpi result has unknown fields
      expect(result.current.data?.data.data).toHaveProperty('xxx')
      // kpi result has null compareData
      expect(result.current.data?.compareData.data.apTotalCount).toEqual(0)
    })
  })

  describe('useLazyApPowerSaveDistributionQuery', () => {
    it('should return correct data', async () => {
      mockGraphqlQuery(intentAIUrl, 'ApPowerSaveDistribution', {
        data: { intent: mockedIntentAIPowerSavePlan }
      })
      const params = {
        root: mocked.root,
        sliceId: mocked.sliceId,
        code: mocked.code
      }

      mockedIntentParams.mockReturnValue(params)

      const { result } =
      renderHook(() => useLazyApPowerSaveDistributionQuery(), { wrapper: Provider })
      const [getApPowerSaveDistribution] = result.current
      const response = await getApPowerSaveDistribution(params).unwrap()
      await waitFor(() => expect(response.data).toBeDefined())
      await waitFor(() => expect(response.csv).toBeDefined())
      expect(response.data[0])
        .toEqual(mockedIntentAIPowerSavePlan.apPowerSaveDistribution[0])
    })

    it('should handle null response', async () => {
      mockGraphqlQuery(intentAIUrl, 'ApPowerSaveDistribution', {
        data: { intent: { apPowerSaveDistribution: null } }
      })
      const params = {
        root: mocked.root,
        sliceId: mocked.sliceId,
        code: mocked.code
      }

      mockedIntentParams.mockReturnValue(params)

      const { result } =
      renderHook(() => useLazyApPowerSaveDistributionQuery(), { wrapper: Provider })
      const [getApPowerSaveDistribution] = result.current
      const response = await getApPowerSaveDistribution(params).unwrap()
      await waitFor(() => expect(response.data).toBeNull())
      await waitFor(() => expect(response.csv).toBeDefined())
    })
  })

})
