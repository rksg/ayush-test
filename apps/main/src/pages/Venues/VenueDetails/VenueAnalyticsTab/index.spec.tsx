import '@testing-library/jest-dom'
import { Provider }                  from '@acx-ui/store'
import { render, screen, fireEvent } from '@acx-ui/test-utils'

import { VenueAnalyticsTab } from '.'

const mockedUsedNavigate = jest.fn()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate,
  useParams: () => ({ activeSubTab: 'incidents' })
}))

describe('VenueAnalyticsTab', () => {
  it('should handle tab changes', async () => {
    render(<Provider>
      <VenueAnalyticsTab />
    </Provider>, {
      route: {
        path: '/t/t1/venues/v1/venue-details/analytics/incidents/overview'
      }
    })
    fireEvent.click(await screen.findByText('Health'))
    expect(mockedUsedNavigate.mock.calls[0][0].pathname).toEqual(
      '/t/t1/venues/v1/venue-details/analytics/health/overview'
    )
  })
})
