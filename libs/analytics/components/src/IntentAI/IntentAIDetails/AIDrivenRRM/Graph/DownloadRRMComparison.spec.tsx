import { Provider, recommendationUrl }      from '@acx-ui/store'
import { mockGraphqlQuery, render, screen } from '@acx-ui/test-utils'

<<<<<<<< HEAD:libs/analytics/components/src/IntentAI/RRMGraph/DownloadRRMComparison.spec.tsx
import { mockedCRRMGraphs, mockedRecommendationCRRM } from '../IntentAIForm/__tests__/fixtures'
import { EnhancedRecommendation }                     from '../IntentAIForm/services'
========
import { EnhancedRecommendation }                     from '../../../IntentAIForm/services'
import { mockedCRRMGraphs, mockedRecommendationCRRM } from '../__tests__/fixtures'
>>>>>>>> feature/MLSA-7981:libs/analytics/components/src/IntentAI/IntentAIDetails/AIDrivenRRM/Graph/DownloadRRMComparison.spec.tsx

import { DownloadRRMComparison } from './DownloadRRMComparison'

describe('DownloadRRMComparison', () => {
  beforeEach(() => {
    global.URL.createObjectURL = jest.fn().mockReturnValue('blob:csv-url')
    global.URL.revokeObjectURL = jest.fn()

    mockGraphqlQuery(recommendationUrl, 'CloudRRMGraph', {
      data: { recommendation: mockedCRRMGraphs }
    })
  })

  it('renders download button', async () => {
    const details = mockedRecommendationCRRM as EnhancedRecommendation
    render(<DownloadRRMComparison details={details} />, { wrapper: Provider })
    expect(await screen.findByText('Download RRM comparison')).toBeVisible()
  })

  it('renders download button with custom title', async () => {
    const details = mockedRecommendationCRRM as EnhancedRecommendation
    render(<DownloadRRMComparison details={details} title='Test title' />, { wrapper: Provider })
    expect(await screen.findByText('Test title')).toBeVisible()
  })
})
