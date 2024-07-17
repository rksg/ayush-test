import { Provider, recommendationUrl }     from '@acx-ui/store'
import { mockGraphqlQuery, render,screen } from '@acx-ui/test-utils'

import { transformDetailsResponse } from '../IntentAIForm/services'

import { mockedCRRMGraphs, mockedRecommendationCRRM } from './__tests__/fixtures'
import { CrrmBenefits }                               from './CrrmBenefits'

describe('CrrmBenefits', () => {
  const crrmDetails = transformDetailsResponse(mockedRecommendationCRRM)
  beforeEach(() => {
    mockGraphqlQuery(recommendationUrl, 'CloudRRMGraph', {
      data: { recommendation: mockedCRRMGraphs }
    })
  })
  it('should render correctly', async () => {
    render(<CrrmBenefits details={crrmDetails} />, { wrapper: Provider })

    expect(await screen.findByText('Benefits')).toBeVisible()
    const interferingLinks = expect(await screen.findByTestId('interfering-links'))
    interferingLinks.toBeVisible()
    interferingLinks.toHaveTextContent('2')
    interferingLinks.toHaveTextContent('-100%')
    const interferingLinksPerAp = expect(await screen.findByTestId('interfering-links-per-ap'))
    interferingLinksPerAp.toBeVisible()
    interferingLinksPerAp.toHaveTextContent('1')
    interferingLinksPerAp.toHaveTextContent('-100%')
  })
})