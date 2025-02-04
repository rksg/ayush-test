import userEvent from '@testing-library/user-event'

import { render, screen, within } from '@acx-ui/test-utils'

import { PropertyManagementModal } from './PropertyManagementModal'

jest.mock('@acx-ui/rc/components', () => ({
  VenuePropertyManagementForm: (props: { onCancel: () => void }) =>
    <div data-testid='PropertyManagementForm' >
      <button onClick={props.onCancel}>Cancel</button>
    </div>
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

  it('Shuould successfully cancel PropertyManagementModal', async () => {
    const mockSetVisible = jest.fn()
    render(
      <PropertyManagementModal
        venueId='venue-id'
        venueName='venue-name'
        visible={true}
        setVisible={mockSetVisible}
      />
    )
    expect(screen.getByText('venue-name')).toBeVisible()
    const formContent = screen.getByTestId('PropertyManagementForm')
    expect(formContent).toBeVisible()
    await userEvent.click(within(formContent).getByRole('button', { name: 'Cancel' }))
    expect(mockSetVisible).toBeCalled()
  })
})