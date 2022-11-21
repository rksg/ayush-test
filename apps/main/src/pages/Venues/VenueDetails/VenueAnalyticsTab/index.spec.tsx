import '@testing-library/jest-dom'
import * as router from 'react-router-dom'

import { Provider }                  from '@acx-ui/store'
import { render, screen, fireEvent } from '@acx-ui/test-utils'

import { VenueAnalyticsTab } from '.'

const mockedUsedNavigate = jest.fn()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate,
  useParams: jest.fn()
}))

describe('VenueAnalyticsTab', () => {
  beforeEach(() => {
    mockedUsedNavigate.mockReset()
  })
  it('should handle default tab', async () => {
    jest.spyOn(router, 'useParams').mockImplementation(() => ({}))
    render(<Provider>
      <VenueAnalyticsTab />
    </Provider>, {
      route: {
        path: '/t/t1/venues/v1/venue-details/analytics'
      }
    })
    fireEvent.click(await screen.findByText('Health'))
    expect(mockedUsedNavigate.mock.calls[0][0].pathname).toEqual(
      '/t/t1/venues/v1/venue-details/analytics/health/overview'
    )
  })
  it('should handle tab changes', async () => {
    jest.spyOn(router, 'useParams').mockImplementation(() => ({ activeSubTab: 'incidents' }))
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
