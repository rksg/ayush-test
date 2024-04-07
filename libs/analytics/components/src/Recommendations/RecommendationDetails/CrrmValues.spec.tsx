import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import {
  mockedRecommendationCRRM,
  mockedRecommendationCRRMnew
} from './__tests__/fixtures'
import { CrrmValues }                                      from './CrrmValues'
import { RecommendationDetails, transformDetailsResponse } from './services'

describe('CrrmValues', () => {
  it('should render correctly for new crrm', async () => {
    const crrmDetails = transformDetailsResponse(mockedRecommendationCRRMnew)
    render(<CrrmValues details={crrmDetails} />, { wrapper: Provider })
    expect(await screen.findByText('Recommended Configuration')).toBeVisible()
    expect(await screen.findByText('ChannelFly and Auto for 5 GHz with Auto Cell Sizing on'))
      .toBeVisible()
  })
  it('should render correctly for applied crrm', async () => {
    const crrmDetails = transformDetailsResponse(mockedRecommendationCRRM)
    render(<CrrmValues details={crrmDetails} />, { wrapper: Provider })
    expect(await screen.findByText('Original Configuration')).toBeVisible()
    expect(await screen.findByText('ChannelFly and 80 MHz for 2.4 GHz with static AP Tx Power'))
      .toBeVisible()
  })
  it('should render correctly for pull optimized crrm', async () => {
    const crrmDetails = transformDetailsResponse({
      ...mockedRecommendationCRRMnew,
      metadata: { algorithmData: { isCrrmFullOptimization: true } }
    } as unknown as RecommendationDetails)
    render(<CrrmValues details={crrmDetails} />, { wrapper: Provider })
    expect(await screen.findByText('Recommended Configuration')).toBeVisible()
    // eslint-disable-next-line max-len
    expect(await screen.findByText('AI-Driven RRM for channel and bandwidth plan with no change in AP Tx Power'))
      .toBeVisible()
  })
  it('should render correctly for partial optimized crrm', async () => {
    const crrmDetails = transformDetailsResponse({
      ...mockedRecommendationCRRMnew,
      metadata: { algorithmData: { isCrrmFullOptimization: false } }
    } as unknown as RecommendationDetails)
    render(<CrrmValues details={crrmDetails} />, { wrapper: Provider })
    expect(await screen.findByText('Recommended Configuration')).toBeVisible()
    expect(await screen.findByText('AI-Driven RRM for channel plan')).toBeVisible()
  })
  it('should render correctly when data retention period passed', async () => {
    jest.spyOn(require('../utils'), 'isDataRetained').mockImplementation(() => false)
    const crrmDetails = transformDetailsResponse(mockedRecommendationCRRMnew)
    render(<CrrmValues details={crrmDetails} />, { wrapper: Provider })
    expect(await screen.findByText('Beyond data retention period')).toBeVisible()
  })
})
