import '@testing-library/jest-dom'

import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import { VenueDetailsTab } from './index'

const params = {
  tenantId: '15a04f095a8f4a96acaf17e921e8a6df',
  venueId: 'f892848466d047798430de7ac234e940'
}

jest.mock('../../VenuesForm', () => ({
  VenuesForm: () => <div data-testid={'VenuesForm'}></div>
}))

describe('VenueDetailsTab', () => {
  it('should render correctly', async () => {
    render(<Provider><VenueDetailsTab /></Provider>, { route: { params } })
    expect(await screen.findByTestId('VenuesForm')).toBeVisible()
  })
})
