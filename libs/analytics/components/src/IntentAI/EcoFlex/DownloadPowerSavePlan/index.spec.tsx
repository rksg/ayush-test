import { Provider, intentAIUrl }            from '@acx-ui/store'
import { mockGraphqlQuery, render, screen } from '@acx-ui/test-utils'

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

  it('renders download button', async () => {
    render(<DownloadPowerSavePlan />, { wrapper: Provider, route: { params } })
    expect(await screen.findByText('Download PowerSave Plan')).toBeVisible()
    expect(await screen.findByText(
      'The CSV is generated based on the last execution of the \'Energy Saving\' model.'
    )).toBeVisible()
  })
})
