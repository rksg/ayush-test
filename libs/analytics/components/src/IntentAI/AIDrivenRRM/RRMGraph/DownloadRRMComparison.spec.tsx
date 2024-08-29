import { Provider, recommendationUrl }      from '@acx-ui/store'
import { mockGraphqlQuery, render, screen } from '@acx-ui/test-utils'

import { useIntentContext }                   from '../../IntentContext'
import { transformDetailsResponse }           from '../../useIntentDetailsQuery'
import { mockedCRRMGraphs, mockedIntentCRRM } from '../__tests__/fixtures'

import { DownloadRRMComparison } from './DownloadRRMComparison'

jest.mock('../../IntentContext')

describe('DownloadRRMComparison', () => {
  const intent = transformDetailsResponse(mockedIntentCRRM)
  const params = { recommendationId: intent.id, code: intent.code }

  beforeEach(() => {
    global.URL.createObjectURL = jest.fn().mockReturnValue('blob:csv-url')
    global.URL.revokeObjectURL = jest.fn()

    jest.mocked(useIntentContext).mockReturnValue({ intent, kpis: [] })
    mockGraphqlQuery(recommendationUrl, 'IntentAIRRMGraph', {
      data: { intent: mockedCRRMGraphs }
    })
  })

  it('renders download button', async () => {
    render(<DownloadRRMComparison />, { wrapper: Provider, route: { params } })
    expect(await screen.findByText('Download RRM comparison')).toBeVisible()
  })

  it('renders download button with custom title', async () => {
    render(<DownloadRRMComparison title='Test title' />, { wrapper: Provider, route: { params } })
    expect(await screen.findByText('Test title')).toBeVisible()
  })
})
