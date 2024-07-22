import { Provider, recommendationUrl }     from '@acx-ui/store'
import { mockGraphqlQuery, render,screen } from '@acx-ui/test-utils'

import { transformDetailsResponse } from '../../IntentAIForm/services'

import { mockedCRRMGraphs, mockedRecommendationCRRM, mockedRecommendationCRRMnew } from './__tests__/fixtures'
import { CrrmBenefits }                                                            from './CrrmBenefits'

describe('CrrmBenefits', () => {
  beforeEach(() => {
    mockGraphqlQuery(recommendationUrl, 'CloudRRMGraph', {
      data: { recommendation: mockedCRRMGraphs }
    })
  })
  it('should render correctly', async () => {
    const crrmDetails = transformDetailsResponse(mockedRecommendationCRRM)
    render(<CrrmBenefits details={crrmDetails} />, { wrapper: Provider })

    expect(await screen.findByText('Benefits')).toBeVisible()
    expect(await screen.findByText('Interfering links')).toBeVisible()
    expect(await screen.findByText('Average interfering links per AP')).toBeVisible()
    expect(await screen.findByText('-200%')).toBeVisible()
    expect(await screen.findByText('-100%')).toBeVisible()
  })

  it('should render correctly with no interfering link', async () => {
    const crrmDetails = transformDetailsResponse(mockedRecommendationCRRMnew)
    render(<CrrmBenefits details={crrmDetails} />, { wrapper: Provider })

    expect(await screen.findByText('Benefits')).toBeVisible()
    const interferingLinks = expect(await screen.findByTestId('interfering-links'))
    interferingLinks.toBeVisible()
    interferingLinks.toHaveTextContent('0')
    interferingLinks.toHaveTextContent('0%')
    const interferingLinksPerAp = expect(await screen.findByTestId('interfering-links-per-ap'))
    interferingLinksPerAp.toBeVisible()
    interferingLinksPerAp.toHaveTextContent('0')
    interferingLinksPerAp.toHaveTextContent('0%')
  })
})
