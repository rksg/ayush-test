import userEvent from '@testing-library/user-event'

import { Provider, intentAIUrl }                     from '@acx-ui/store'
import { mockGraphqlQuery, render, screen, waitFor } from '@acx-ui/test-utils'
import { handleBlobDownloadFile }                    from '@acx-ui/utils'

import { mockIntentContext }                                from '../../__tests__/fixtures'
import { mockedIntentEcoFlex, mockedIntentAIPowerSavePlan } from '../__tests__/fixtures'

import { DownloadPowerSavePlan } from '.'

jest.mock('../../IntentContext')

jest.mock('@acx-ui/components', () => ({
  ...jest.requireActual('@acx-ui/components'),
  Tooltip: ({ children, title }: { children: React.ReactNode; title: string }) => (
    <div>
      <div>{title}</div>
      {children}
    </div>
  )
}))

jest.mock('@acx-ui/utils', () => ({
  ...jest.requireActual('@acx-ui/utils'),
  handleBlobDownloadFile: jest.fn()
}))
const mockedDownload = jest.mocked(handleBlobDownloadFile)

describe('DownloadPowerSavePlan', () => {
  const intent = mockedIntentEcoFlex
  const params = {
    root: intent.root,
    sliceId: intent.sliceId,
    code: intent.code
  }

  beforeEach(() => {
    global.URL.createObjectURL = jest.fn().mockReturnValue('blob:csv-url')
    global.URL.revokeObjectURL = jest.fn()

    mockIntentContext({ intent, kpis: [] })
    mockGraphqlQuery(intentAIUrl, 'ApPowerSaveDistribution', {
      data: { intent: mockedIntentAIPowerSavePlan }
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders download button', async () => {
    render(<DownloadPowerSavePlan />, { wrapper: Provider, route: { params } })
    expect(await screen.findByText('Download PowerSave Plan')).toBeVisible()
    expect(await screen.findByText(
      'The CSV is generated based on the last execution of the \'Energy Saving\' model.'
    )).toBeVisible()
    await screen.findByRole('button', { name: 'Download PowerSave Plan' })
    await userEvent.click(await screen.findByText('Download PowerSave Plan'))
    await waitFor(() => expect(mockedDownload).toBeCalled())
  })
})
