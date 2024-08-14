import { recommendationBandMapping }             from '@acx-ui/components'
import { Provider, recommendationUrl }           from '@acx-ui/store'
import { mockGraphqlQuery, renderHook, waitFor } from '@acx-ui/test-utils'

import { mockedCRRMGraphs, mockedCRRMGraphsApplied, mockedIntentCRRM, mockedIntentCRRMApplied } from '../IntentAIDetails/__tests__/fixtures'
import { EnhancedIntent }                                                                       from '../IntentAIForm/services'

import { useIntentAICRRMQuery } from './services'

describe('useIntentAICRRMQuery', () => {
  afterEach(() => jest.resetAllMocks())
  it('should return correct data', async () => {
    mockGraphqlQuery(recommendationUrl, 'IntentAIRRMGraph', {
      data: { intent: mockedCRRMGraphs }
    })
    const band = recommendationBandMapping[
      mockedIntentCRRM.code as keyof typeof recommendationBandMapping]
    const { result } = renderHook(() => useIntentAICRRMQuery(
      mockedIntentCRRM as EnhancedIntent,
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
    const band = recommendationBandMapping[
      mockedIntentCRRMApplied.code as keyof typeof recommendationBandMapping]
    const { result } = renderHook(() => useIntentAICRRMQuery(
      mockedIntentCRRMApplied as EnhancedIntent,
      band
    ), { wrapper: Provider })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toMatchSnapshot()
    expect(result.current.csv).toMatchSnapshot()
  })
})
