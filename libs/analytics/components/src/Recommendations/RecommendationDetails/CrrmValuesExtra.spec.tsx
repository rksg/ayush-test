import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import {
  mockedRecommendationCRRM,
  mockedRecommendationCRRMnew
} from './__tests__/fixtures'
import { CrrmValuesExtra }                                 from './CrrmValuesExtra'
import { RecommendationDetails, transformDetailsResponse } from './services'

describe('CrrmValuesExtra', () => {
  it('should render correctly for new crrm', async () => {
    const crrmDetails = transformDetailsResponse(mockedRecommendationCRRMnew)
    render(<CrrmValuesExtra details={crrmDetails} />, { wrapper: Provider })
    expect(await screen
      .findByText(/^Based on our AI Analytics, enabling AI-Driven Cloud RRM will/)).toBeVisible()
  })
  it('should render correctly for applied crrm', async () => {
    const crrmDetails = transformDetailsResponse(mockedRecommendationCRRM)
    render(<CrrmValuesExtra details={crrmDetails} />, { wrapper: Provider })
    expect(await screen
      .findByText(/^AI-Driven Cloud RRM will constantly monitor the network/)).toBeVisible()
  })
  it('should render correctly for full crrm', async () => {
    const crrmDetails = transformDetailsResponse({
      ...mockedRecommendationCRRM,
      metadata: { algorithmData: { isCrrmFullOptimization: true } }
    } as RecommendationDetails)
    render(<CrrmValuesExtra details={crrmDetails} />, { wrapper: Provider })
    expect(await screen
      .findByText(/^AI-Driven Cloud RRM will constantly monitor the network/)).toBeVisible()
    expect(await screen
      // eslint-disable-next-line max-len
      .findByText(/and adjust the channel plan, bandwidth and AP transmit power when necessary/)).toBeVisible()
  })
  it('should render correctly for partial optimized crrm', async () => {
    const crrmDetails = transformDetailsResponse({
      ...mockedRecommendationCRRM,
      metadata: { algorithmData: { isCrrmFullOptimization: false } }
    } as RecommendationDetails)
    render(<CrrmValuesExtra details={crrmDetails} />, { wrapper: Provider })
    expect(await screen
      .findByText(/^AI-Driven Cloud RRM will constantly monitor the network/)).toBeVisible()
    expect(await screen
      .findByText(/and adjust the channel plan when necessary/)).toBeVisible()
  })
})
