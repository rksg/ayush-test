import '@testing-library/jest-dom'
import { Provider } from '@acx-ui/store'
import { render }   from '@acx-ui/test-utils'

import { VenueDetailsTab } from './index'

const params = { venueId: 'venue-id', tenantId: 'tenant-id' }

describe('VenueDetailsTab', () => {
  it('should render correctly', async () => {
    const { asFragment } = render(<Provider><VenueDetailsTab /></Provider>, { route: { params } })
    expect(asFragment()).toMatchSnapshot()
  })
})
