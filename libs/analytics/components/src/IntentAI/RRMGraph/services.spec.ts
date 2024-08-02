import { Provider, recommendationUrl }           from '@acx-ui/store'
import { mockGraphqlQuery, renderHook, waitFor } from '@acx-ui/test-utils'

import { intentBandMapping }                                                                    from '../config'
import { mockedCRRMGraphs, mockedCRRMGraphsApplied, mockedIntentCRRM, mockedIntentCRRMApplied } from '../IntentAIDetails/__tests__/fixtures'

import { useIntentAICRRMQuery } from './services'

describe('useIntentAICRRMQuery', () => {
  afterEach(() => jest.resetAllMocks())
  it('should return correct data', async () => {
    mockGraphqlQuery(recommendationUrl, 'IntentAIRRMGraph', {
      data: { intent: mockedCRRMGraphs }
    })
    const band = intentBandMapping[mockedIntentCRRM.code as keyof typeof intentBandMapping]
    const { result } = renderHook(() => useIntentAICRRMQuery(
      mockedIntentCRRM.id,
      band
    ), { wrapper: Provider })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toMatchSnapshot()
    expect(result.current.csv).toMatchSnapshot()
  })
  it('should return correct data for applied status', async () => {
    mockGraphqlQuery(recommendationUrl, 'IntentAIRRMGraph', {
      data: { intent: mockedCRRMGraphsApplied }
    })
    const band = intentBandMapping[mockedIntentCRRMApplied.code as keyof typeof intentBandMapping]
    const { result } = renderHook(() => useIntentAICRRMQuery(
      mockedIntentCRRMApplied.id,
      band
    ), { wrapper: Provider })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toMatchSnapshot()
    expect(result.current.csv).toMatchSnapshot()
  })
})
