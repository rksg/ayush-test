import { flow } from 'lodash'

import {
  deriveInterferingGraphs,
  deriveTxPowerHighlight,
  pairGraphs,
  recommendationBandMapping
} from '@acx-ui/components'
import { Provider, recommendationUrl }           from '@acx-ui/store'
import { mockGraphqlQuery, renderHook, waitFor } from '@acx-ui/test-utils'

import { mockedCRRMGraphs, mockedRecommendationCRRM } from '../__tests__/fixtures'
import { EnhancedRecommendation }                     from '../services'

import { useCRRMQuery } from './services'

describe('useConfigChangeQuery', () => {
  afterEach(() => jest.resetAllMocks())
  it('should return correct data', async () => {
    mockGraphqlQuery(recommendationUrl, 'CloudRRMGraph', {
      data: { recommendation: mockedCRRMGraphs }
    })
    const band = recommendationBandMapping[
      mockedRecommendationCRRM.code as keyof typeof recommendationBandMapping]
    const { result } = renderHook(() => useCRRMQuery(
      mockedRecommendationCRRM as EnhancedRecommendation,
      band
    ), { wrapper: Provider })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const expectedData = flow(
      [ deriveInterferingGraphs, pairGraphs, deriveTxPowerHighlight]
    )(Object.values(mockedCRRMGraphs.graph).filter(Boolean), band)
    expect(result.current.data).toEqual(expectedData)
    expect(result.current.csv).toMatchSnapshot()
  })
})
