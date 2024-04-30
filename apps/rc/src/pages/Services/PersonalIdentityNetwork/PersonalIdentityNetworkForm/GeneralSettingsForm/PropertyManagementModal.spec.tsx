import { render, screen } from '@acx-ui/test-utils'

import { PropertyManagementModal } from './PropertyManagementModal'

const mockedSetVisible = jest.fn()

jest.mock('@acx-ui/rc/components', () => ({
  ...jest.requireActual('@acx-ui/rc/components'),
  PropertyManagementForm: () => <div data-testid='PropertyManagementForm' />
}))

describe('NSG GeneralSettings Form - PropertyManagementModal', () => {
  it('Shuould render PropertyManagementModal successfully', async () => {
    render(
      <PropertyManagementModal
        venueId='venue-id'
        venueName='venue-name'
        visible={true}
        setVisible={mockedSetVisible}
      />
    )
    expect(screen.getByText('venue-name')).toBeVisible()
    expect(screen.getByTestId('PropertyManagementForm')).toBeVisible()
  })
})