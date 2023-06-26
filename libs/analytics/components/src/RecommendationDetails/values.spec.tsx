import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import {
  mockedRecommendationCRRM,
  mockedRecommendationPower
} from './__fixtures__'
import { transformDetailsResponse } from './services'
import { Values }                   from './values'

describe('Recommendation Overview', () => {
  it('should render correctly for firmware', async () => {
    const crrmDetails = transformDetailsResponse(mockedRecommendationCRRM)
    render(<Values details={crrmDetails} />, { wrapper: Provider })
    expect(await screen.findByText('Recommendation Details')).toBeVisible()
    expect(await screen.findByText('AI-Driven Cloud RRM')).toBeVisible()
    expect(await screen.findByText('ChannelFly and 80 MHz for 2.4 GHz')).toBeVisible()
  })

  it('should render correctly for tx power', async () => {
    const powerDetails = transformDetailsResponse(mockedRecommendationPower)
    render(<Values details={powerDetails} />, { wrapper: Provider })
    expect(await screen.findByText('Recommendation Details')).toBeVisible()
    expect(await screen.findByText('2.4 GHz TX Power Adjustment')).toBeVisible()
    expect(await screen.findByText('Full')).toBeVisible()
  })
})