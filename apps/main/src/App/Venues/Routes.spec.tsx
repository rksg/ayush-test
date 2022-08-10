import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import VenueRoutes from './Routes'


test('should navigate to /venues', async () => {
  render(<Provider><VenueRoutes /></Provider>, {
    route: {
      path: '/t/tenantId/venues',
      wrapRoutes: false
    }
  })
  screen.getByText('Venues')
})

test('should navigate to /venue-details/overview', async () => {
  render(<Provider><VenueRoutes /></Provider>, {
    route: {
      path: '/t/tenantId/venues/venueId/venue-details/overview',
      wrapRoutes: false
    }
  })
  expect(screen.getAllByText('Overview')).toHaveLength(2)
})
