import { flow } from 'lodash'

import { BandEnum, deriveInterferingGraphs, deriveTxPowerHighlight, pairGraphs } from '@acx-ui/components'
import { Provider, recommendationUrl }                                           from '@acx-ui/store'
import { mockGraphqlQuery, renderHook, waitFor }                                 from '@acx-ui/test-utils'

import { mockedCRRMGraphs, mockedRecommendationCRRM } from '../__tests__/fixtures'

import { useCRRMQuery } from './services'

describe('useConfigChangeQuery', () => {
  afterEach(() => jest.resetAllMocks())
  it('should return correct data', async () => {
    const params = { id: mockedRecommendationCRRM.id }
    mockGraphqlQuery(recommendationUrl, 'ConfigRecommendationDetails', {
      data: { recommendation: mockedRecommendationCRRM }
    })
    mockGraphqlQuery(recommendationUrl, 'CloudRRMGraph', {
      data: { recommendation: mockedCRRMGraphs }
    })
    const { result } = renderHook(() => useCRRMQuery(), { wrapper: Provider, route: { params } })
    await waitFor(() => expect(result.current.recommendation.isSuccess).toBe(true))
    await waitFor(() => expect(result.current.queryResult.isSuccess).toBe(true))

    const band = result.current.recommendation.data.band
    expect(band).toEqual(BandEnum._2_4_GHz)
    expect(result.current.recommendation.data.monitoring).toEqual(null)
    const expectedData = flow(
      [ deriveInterferingGraphs, pairGraphs, deriveTxPowerHighlight]
    )(Object.values(mockedCRRMGraphs.graph).filter(Boolean), band)
    expect(result.current.queryResult.data).toEqual(expectedData)
    expect(result.current.queryResult.csv).toMatchSnapshot()
  })
  it('should handle monitering', async () => {
    const original = Date.now
    Date.now = jest.fn(() => new Date('2023-06-25T00:00:25.772Z').getTime())
    const params = { id: 'ad336e2a-63e4-4651-a9ac-65f5df4f4c47' }
    mockGraphqlQuery(recommendationUrl, 'ConfigRecommendationDetails', {
      data: { recommendation: { ...mockedRecommendationCRRM, status: 'applied' } }
    })
    mockGraphqlQuery(recommendationUrl, 'CloudRRMGraph', {
      data: { recommendation: mockedCRRMGraphs }
    })
    const { result } = renderHook(() => useCRRMQuery(), { wrapper: Provider, route: { params } })
    await waitFor(() => expect(result.current.recommendation.isSuccess).toBe(true))
    await waitFor(() => expect(result.current.queryResult.isSuccess).toBe(true))
    expect(result.current.recommendation.data.monitoring)
      .toEqual({ until: '2023-06-26T00:00:25.772Z' })
    Date.now = original
  })
})