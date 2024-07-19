import { recommendationBandMapping }             from '@acx-ui/components'
import { Provider, recommendationUrl }           from '@acx-ui/store'
import { mockGraphqlQuery, renderHook, waitFor } from '@acx-ui/test-utils'

<<<<<<<< HEAD:libs/analytics/components/src/IntentAI/RRMGraph/services.spec.ts
import { mockedCRRMGraphs, mockedCRRMGraphsApplied, mockedRecommendationCRRM, mockedRecommendationCRRMApplied } from '../IntentAIForm/__tests__/fixtures'
import { EnhancedRecommendation }                                                                               from '../IntentAIForm/services'
========
import { EnhancedRecommendation }                                                                               from '../../../IntentAIForm/services'
import { mockedCRRMGraphs, mockedCRRMGraphsApplied, mockedRecommendationCRRM, mockedRecommendationCRRMApplied } from '../__tests__/fixtures'
>>>>>>>> feature/MLSA-7981:libs/analytics/components/src/IntentAI/IntentAIDetails/AIDrivenRRM/Graph/services.spec.ts

import { useIntentAICRRMQuery } from './services'

describe('useIntentAICRRMQuery', () => {
  afterEach(() => jest.resetAllMocks())
  it('should return correct data', async () => {
    mockGraphqlQuery(recommendationUrl, 'CloudRRMGraph', {
      data: { recommendation: mockedCRRMGraphs }
    })
    const band = recommendationBandMapping[
      mockedRecommendationCRRM.code as keyof typeof recommendationBandMapping]
    const { result } = renderHook(() => useIntentAICRRMQuery(
      mockedRecommendationCRRM as EnhancedRecommendation,
      band
    ), { wrapper: Provider })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toMatchSnapshot()
    expect(result.current.csv).toMatchSnapshot()
  })
  it('should return correct data for applied status', async () => {
    mockGraphqlQuery(recommendationUrl, 'CloudRRMGraph', {
      data: { recommendation: mockedCRRMGraphsApplied }
    })
    const band = recommendationBandMapping[
      mockedRecommendationCRRMApplied.code as keyof typeof recommendationBandMapping]
    const { result } = renderHook(() => useIntentAICRRMQuery(
      mockedRecommendationCRRMApplied as EnhancedRecommendation,
      band
    ), { wrapper: Provider })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toMatchSnapshot()
    expect(result.current.csv).toMatchSnapshot()
  })
})
