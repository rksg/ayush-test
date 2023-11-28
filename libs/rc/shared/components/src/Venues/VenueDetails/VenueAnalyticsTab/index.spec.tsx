import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import { VenueAnalyticsTab } from '.'

jest.mock('@acx-ui/analytics/components', () => ({
  ...jest.requireActual('@acx-ui/analytics/components'),
  AnalyticsTabs: () => <div data-testid='AnalyticsTabs'></div>
}))

describe('VenueAnalyticsTab', () => {
  it('should handle default tab', async () => {
    render(<Provider>
      <VenueAnalyticsTab />
    </Provider>, {
      route: {
        path: '/t1/t/venues/v1/venue-details/analytics'
      }
    })
    expect(await screen.findByTestId('AnalyticsTabs')).toBeVisible()
  })
})
