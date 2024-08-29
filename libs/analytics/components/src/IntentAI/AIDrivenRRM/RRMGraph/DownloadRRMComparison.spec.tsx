import { Provider, intentAIUrl }            from '@acx-ui/store'
import { mockGraphqlQuery, render, screen } from '@acx-ui/test-utils'

import { useIntentContext }                   from '../../IntentContext'
import { transformDetailsResponse }           from '../../useIntentDetailsQuery'
import { mockedCRRMGraphs, mockedIntentCRRM } from '../__tests__/fixtures'

import { DownloadRRMComparison } from './DownloadRRMComparison'

jest.mock('../../IntentContext')

describe('DownloadRRMComparison', () => {
  const intent = transformDetailsResponse(mockedIntentCRRM)
  const params = {
    root: '33707ef3-b8c7-4e70-ab76-8e551343acb4',
    sliceId: '4e3f1fbc-63dd-417b-b69d-2b08ee0abc52',
    code: intent.code
  }

  beforeEach(() => {
    global.URL.createObjectURL = jest.fn().mockReturnValue('blob:csv-url')
    global.URL.revokeObjectURL = jest.fn()

    jest.mocked(useIntentContext).mockReturnValue({ intent, kpis: [] })
    mockGraphqlQuery(intentAIUrl, 'IntentAIRRMGraph', {
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
