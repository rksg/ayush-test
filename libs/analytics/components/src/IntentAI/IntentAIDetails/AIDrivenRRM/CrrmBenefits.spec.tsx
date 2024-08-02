import { Provider, recommendationUrl }     from '@acx-ui/store'
import { mockGraphqlQuery, render,screen } from '@acx-ui/test-utils'

import { transformDetailsResponse }           from '../../IntentAIForm/services'
import { mockedCRRMGraphs, mockedIntentCRRM } from '../__tests__/fixtures'

import { CrrmBenefits } from './CrrmBenefits'

describe('CrrmBenefits', () => {
  beforeEach(() => {
    mockGraphqlQuery(recommendationUrl, 'IntentAIRRMGraph', {
      data: { intent: mockedCRRMGraphs }
    })
    jest.spyOn(require('../../utils'), 'isDataRetained').mockImplementation(() => true)
  })
  it('should render correctly', async () => {
    const crrmDetails = transformDetailsResponse(mockedIntentCRRM)
    render(<CrrmBenefits details={crrmDetails} />, { wrapper: Provider })

    expect(await screen.findByText('Benefits')).toBeVisible()
    expect(await screen.findByText('Interfering links')).toBeVisible()
    expect(await screen.findByText('Average interfering links per AP')).toBeVisible()
    expect(await screen.findByText('-200%')).toBeVisible()
    expect(await screen.findByText('=')).toBeVisible()
  })
  it('should handle when beyond data retention', async () => {
    jest.spyOn(require('../../utils'), 'isDataRetained').mockImplementation(() => false)
    const crrmDetails = transformDetailsResponse(mockedIntentCRRM)
    render(<CrrmBenefits details={crrmDetails} />, { wrapper: Provider })
    expect(await screen.findByText('Benefits')).toBeVisible()
    expect(await screen.findByText('Beyond data retention period')).toBeVisible()
  })
})
