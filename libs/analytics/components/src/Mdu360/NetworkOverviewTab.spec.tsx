import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import NetworkOverviewTab from './NetworkOverviewTab'

jest.mock('./Widgets/IntentAISummary/services', () => ({
  useIntentAISummaryQuery: jest.fn().mockReturnValue({ isLoading: false })
}))

jest.mock('@acx-ui/utils', () => {
  const reactIntl = jest.requireActual('react-intl')
  const intl = reactIntl.createIntl({
    locale: 'en'
  })
  return {
    ...jest.requireActual('@acx-ui/utils'),
    getIntl: () => intl
  }
})

describe('NetworkOverviewTab', () => {
  afterEach(() => jest.restoreAllMocks())

  it('renders NetworkOverviewTab widgets correctly', async () => {
    render(
      <NetworkOverviewTab
        startDate='2023-02-01T00:00:00.000Z'
        endDate='2023-02-01T00:00:00.000Z'
      />,
      { wrapper: Provider }
    )

    expect(await screen.findByText('IntentAI Summary')).toBeVisible()
  })
})