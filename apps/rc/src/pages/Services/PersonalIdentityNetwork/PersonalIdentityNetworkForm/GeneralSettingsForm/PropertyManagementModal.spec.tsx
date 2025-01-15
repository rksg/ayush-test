import { render, screen } from '@acx-ui/test-utils'

import { PropertyManagementModal } from './PropertyManagementModal'

jest.mock('@acx-ui/rc/components', () => ({
  VenuePropertyManagementForm: () => <div data-testid='PropertyManagementForm' />
}))

describe('PIN GeneralSettings Form - PropertyManagementModal', () => {
  it('Shuould render PropertyManagementModal successfully', async () => {
    render(
      <PropertyManagementModal
        venueId='venue-id'
        venueName='venue-name'
        visible={true}
        setVisible={jest.fn()}
      />
    )
    expect(screen.getByText('venue-name')).toBeVisible()
    expect(screen.getByTestId('PropertyManagementForm')).toBeVisible()
  })
})