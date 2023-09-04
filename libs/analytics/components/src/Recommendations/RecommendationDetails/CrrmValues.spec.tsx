import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import {
  mockedRecommendationCRRM,
  mockedRecommendationCRRMnew
} from './__tests__/fixtures'
import { CrrmValues }               from './CrrmValues'
import { transformDetailsResponse } from './services'

describe('CrrmValues', () => {
  it('should render correctly for new crrm', async () => {
    const crrmDetails = transformDetailsResponse(mockedRecommendationCRRMnew)
    render(<CrrmValues details={crrmDetails} />, { wrapper: Provider })
    expect(await screen.findByText('Recommended Configuration')).toBeVisible()
  })
  it('should render correctly for applied crrm', async () => {
    const crrmDetails = transformDetailsResponse(mockedRecommendationCRRM)
    render(<CrrmValues details={crrmDetails} />, { wrapper: Provider })
    expect(await screen.findByText('Original Configuration')).toBeVisible()
  })
})
