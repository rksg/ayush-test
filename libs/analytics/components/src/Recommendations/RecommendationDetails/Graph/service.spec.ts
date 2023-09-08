import { flow } from 'lodash'

import {
  deriveInterferingGraphs,
  deriveTxPowerHighlight,
  pairGraphs,
  recommendationBandMapping
} from '@acx-ui/components'
import { Provider, recommendationUrl }           from '@acx-ui/store'
import { mockGraphqlQuery, renderHook, waitFor } from '@acx-ui/test-utils'

import { mockedCRRMGraphs, mockedCRRMGraphsApplied, mockedRecommendationCRRM, mockedRecommendationCRRMApplied } from '../__tests__/fixtures'
import { EnhancedRecommendation }                                                                               from '../services'

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
  it('should return correct data for applied status', async () => {
    mockGraphqlQuery(recommendationUrl, 'CloudRRMGraph', {
      data: { recommendation: mockedCRRMGraphsApplied }
    })
    const band = recommendationBandMapping[
      mockedRecommendationCRRMApplied.code as keyof typeof recommendationBandMapping]
    const { result } = renderHook(() => useCRRMQuery(
      mockedRecommendationCRRMApplied as EnhancedRecommendation,
      band
    ), { wrapper: Provider })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const expectedData = flow(
      [ deriveInterferingGraphs, pairGraphs, deriveTxPowerHighlight]
    )(Object.values(mockedCRRMGraphsApplied.graph).filter(Boolean), band)
    expect(result.current.data[1]).toEqual(expectedData[0])
    expect(result.current.data[0]).toEqual(expectedData[1])
    expect(result.current.csv).toMatchSnapshot()
  })
})
