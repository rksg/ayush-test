import { screen, fireEvent } from '@testing-library/react'

// import { BrowserDialog } from './browser-dialog' // Import the module you want to test

jest.mock('react-router-dom', () => ({
  useParams: () => ({ tenantId: 'mockTenantId' })
}))

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: jest.fn()
}))

// jest.mock('path-to-modal-module', () => ({
//   showActionModal: jest.fn()
// }))

describe.skip('BrowserDialog', () => {
  it('renders correctly', () => {
    // Mock the necessary values for the test
    // useState.mockReturnValue([true, jest.fn()]) // Mock isOpen state

    // Assertions
    // Add your assertions here
  })

  it('handles the confirmation action', () => {
    // Mock the necessary values for the test
    // useState.mockReturnValue([true, jest.fn()]) // Mock isOpen state
    // useState.mockReturnValue(['false', jest.fn()]) // Mock isActionConfirmed state
    const mockUpdateUserProfileMutation = jest.fn()

    // Mock the dependencies' behaviors
    require('path-to-your-api-module').useUpdateUserProfileMutation.mockReturnValue([
      mockUpdateUserProfileMutation
    ])
    // require('path-to-intl-module').getIntl.mockReturnValue(mockGetIntl)

    // Render the component
    // render(<BrowserDialog browserLang='en-US' />)

    // Simulate button click to trigger action
    fireEvent.click(screen.getByText('Change to English'))

    // Assertions
    expect(mockUpdateUserProfileMutation).toHaveBeenCalledWith({
      payload: {
        dateFormat: 'mm/dd/yyyy',
        detailLevel: 'it',
        preferredLanguage: 'en-US'
      },
      params: { tenantId: 'mockTenantId' }
    })
  })
})
