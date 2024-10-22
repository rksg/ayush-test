import { Provider, intentAIApi, intentAIUrl, store } from '@acx-ui/store'
import { mockGraphqlQuery, renderHook, waitFor }     from '@acx-ui/test-utils'


import { mocked, mockKpiData } from '../__tests__/mockedEcoFlex'

import { useIntentAIEcoFlexQuery } from './services'

const mockedIntentParams = jest.fn()

jest.mock('../../useIntentDetailsQuery', () => ({
  ...jest.requireActual('../../useIntentDetailsQuery'),
  useIntentParams: () => mockedIntentParams
}))

describe('useIntentAIEcoFlexQuery', () => {
  beforeEach(() => {
    mockedIntentParams.mockReset()
    store.dispatch(intentAIApi.util.resetApiState())
  })
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

    mockedIntentParams.mockReturnValue(params)

    const { result } = renderHook(() => useIntentAIEcoFlexQuery(), { wrapper: Provider })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.compareData.timestamp)
      .toEqual(mockKpiData.kpi.compareData.timestamp)
    expect(result.current.data?.compareData.data[0].value)
      .toEqual(mockKpiData.kpi.compareData.result.unsupported)
    expect(result.current.data?.data.timestamp).toEqual(mockKpiData.kpi.data.timestamp)
    expect(result.current.data?.data.data[0].value)
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
})