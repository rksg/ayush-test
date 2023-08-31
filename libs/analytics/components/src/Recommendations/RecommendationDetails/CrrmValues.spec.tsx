import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import {
  mockedRecommendationCRRM,
  mockedRecommendationCRRMnew
} from './__tests__/fixtures'
import { CrrmValues }               from './CrrmValues'
import { transformDetailsResponse } from './services'

describe('Recommendation Overview', () => {
  it('should render correctly for new crrm', async () => {
    const crrmDetails = transformDetailsResponse(mockedRecommendationCRRMnew)
    render(<CrrmValues details={crrmDetails} />, { wrapper: Provider })
    expect(await screen.findByText('Recommendation Details')).toBeVisible()
    expect(await screen.findByText('ChannelFly and Auto for 5 GHz with Auto Cell Sizing on'))
      .toBeVisible()
  })
  it('should render correctly for applied crrm', async () => {
    const crrmDetails = transformDetailsResponse(mockedRecommendationCRRM)
    render(<CrrmValues details={crrmDetails} />, { wrapper: Provider })
    expect(await screen.findByText('Recommendation Details')).toBeVisible()
    expect(await screen.findByText('ChannelFly and 80 MHz for 2.4 GHz with static AP Tx Power'))
      .toBeVisible()
  })
})
