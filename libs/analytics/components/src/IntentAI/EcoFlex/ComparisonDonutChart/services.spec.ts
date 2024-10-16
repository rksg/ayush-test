import { Provider, intentAIUrl }                 from '@acx-ui/store'
import { mockGraphqlQuery, renderHook, waitFor } from '@acx-ui/test-utils'

import { mocked, mockKpiData, mockKpiResultDataWithUnknownField } from '../__tests__/mockedEcoFlex'

import { useIntentAIEcoKpiQuery } from './services'

describe('useIntentAIEcoKpiQuery', () => {
  afterEach(() => jest.resetAllMocks())
  it('should return correct data', async () => {
    mockGraphqlQuery(intentAIUrl, 'IntentAIEcoKpi', {
      data: { intent: mockKpiData }
    })
    const params = {
      root: mocked.root,
      sliceId: mocked.sliceId,
      code: mocked.code
    }
    const { result } = renderHook(() => useIntentAIEcoKpiQuery(params), { wrapper: Provider })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    // eslint-disable-next-line max-len
    expect(result.current.data?.compareData.timestamp).toEqual(mockKpiData.kpi.compareData.timestamp)
    // eslint-disable-next-line max-len
    expect(result.current.data?.compareData.data[0].value).toEqual(mockKpiData.kpi.compareData.result.unsupported)
    expect(result.current.data?.data.timestamp).toEqual(mockKpiData.kpi.data.timestamp)
    // eslint-disable-next-line max-len
    expect(result.current.data?.data.data[0].value).toEqual(mockKpiData.kpi.data.result.unsupported)
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
    const { result } = renderHook(() => useIntentAIEcoKpiQuery(params), { wrapper: Provider })
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
    const { result } = renderHook(() => useIntentAIEcoKpiQuery(params), { wrapper: Provider })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    // kpi result has unknown fields
    expect(result.current.data?.data.data[0].value).toEqual(0)
    // kpi result has null compareData
    expect(result.current.data?.compareData.data).toEqual([])
  })

})
