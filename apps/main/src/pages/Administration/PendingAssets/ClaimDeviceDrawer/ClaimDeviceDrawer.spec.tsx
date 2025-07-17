import React from 'react'

import { rest } from 'msw'

import { CommonUrlsInfo, WifiUrlsInfo }       from '@acx-ui/rc/utils'
import { Provider }                           from '@acx-ui/store'
import { render, fireEvent, waitFor, screen } from '@acx-ui/test-utils'
import { setUserProfile, UserProfile }        from '@acx-ui/user'

import { ClaimDeviceDrawer } from './ClaimDeviceDrawer'

// eslint-disable-next-line no-console
const originalWarn = console.warn
// eslint-disable-next-line no-console
console.warn = (...args: unknown[]) => {
  const mswWarningMsg = '[MSW] Warning: captured a request without a matching request handler'

  if (typeof args[0] === 'string' && args[0].includes(mswWarningMsg)) {
    return
  }
  originalWarn(...args)
}

// eslint-disable-next-line no-console
const originalError = console.error
// eslint-disable-next-line no-console
console.error = (...args: unknown[]) => {
  const useFormWarning =
    'Warning: Instance created by `useForm` is not connected to any Form element'
  const connectionError = 'Error: connect ECONNREFUSED 127.0.0.1:80'

  if (typeof args[0] === 'string' &&
      (args[0].includes(useFormWarning) || args[0].includes(connectionError))) {
    return
  }
  originalError(...args)
}

const mockVenues = [
  { id: 'venue-1', name: 'Venue 1' },
  { id: 'venue-2', name: 'Venue 2' },
  { id: 'venue-3', name: 'Venue 3' }
]

const mockApGroups = [
  { id: 'group-1', name: 'AP Group 1', venueId: 'venue-1', isDefault: false },
  { id: 'group-2', name: 'AP Group 2', venueId: 'venue-1', isDefault: false },
  { id: 'default-group', name: 'Default Group', venueId: 'venue-1', isDefault: true }
]

const mockDevices = [
  { serial: 'AP-001', model: 'R750' },
  { serial: 'AP-002', model: 'R650' },
  { serial: 'SWITCH-001', model: 'ICX7550-48' }
]

const mockVenuesResponse = {
  data: mockVenues,
  totalElements: 3
}

const mockApGroupsResponse = {
  data: mockApGroups,
  totalElements: 3
}

describe('ClaimDeviceDrawer', () => {
  const defaultProps = {
    onClose: jest.fn(),
    devices: mockDevices,
    visible: true,
    deviceType: 'ap' as const
  }

  beforeEach(() => {
    setUserProfile({
      profile: { dateFormat: 'MMM DD YYYY' } as UserProfile,
      allowedOperations: []
    })

    const { mockServer } = require('@acx-ui/test-utils')
    mockServer.use(
      rest.post(CommonUrlsInfo.getVenuesList.url, (req, res, ctx) => {
        return res(ctx.json(mockVenuesResponse))
      }),
      rest.post(WifiUrlsInfo.getApGroupsList.url, (req, res, ctx) => {
        return res(ctx.json(mockApGroupsResponse))
      }),
      rest.post('/deviceProvisions/venues/:venueId/apGroups/:apGroupId/aps', (req, res, ctx) => {
        return res(ctx.json({ success: true, message: 'AP devices claimed successfully' }))
      }),
      rest.post('/deviceProvisions/venues/:venueId/switches', (req, res, ctx) => {
        return res(ctx.json({ success: true, message: 'Switch devices claimed successfully' }))
      })
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders correctly for AP devices', async () => {
    render(
      <Provider>
        <ClaimDeviceDrawer {...defaultProps} />
      </Provider>
    )

    await waitFor(() => {
      expect(screen.getByText('Claim Device')).toBeInTheDocument()
    })

    await waitFor(() => {
      expect(screen.getByText(/Select a.*to add your new access points:/)).toBeInTheDocument()
    })
    expect(screen.getByText('Venue')).toBeInTheDocument()
    expect(screen.getByText('AP Group')).toBeInTheDocument()
    expect(screen.getByText('Devices (3)')).toBeInTheDocument()
    expect(screen.getByText('Use Prefix/Suffix for Device Names')).toBeInTheDocument()
    expect(screen.getByText('Use Serial # as Custom AP Name')).toBeInTheDocument()
  })

  it('renders correctly for Switch devices', async () => {
    render(
      <Provider>
        <ClaimDeviceDrawer {...defaultProps} deviceType='switch' />
      </Provider>
    )

    await waitFor(() => {
      expect(screen.getByText('Claim Device')).toBeInTheDocument()
    })

    expect(screen.getByText(/Select a.*to add your new switches:/)).toBeInTheDocument()
    expect(screen.getByText('Venue')).toBeInTheDocument()
    expect(screen.getByText('Devices (3)')).toBeInTheDocument()
    expect(screen.getByText('Use Prefix/Suffix for Device Names')).toBeInTheDocument()
    expect(screen.getByText('Use Serial # as Custom Switch Name')).toBeInTheDocument()

    // AP Group should not be visible for switches
    expect(screen.queryByText('AP Group')).not.toBeInTheDocument()
  })

  it('displays device list correctly', async () => {
    render(
      <Provider>
        <ClaimDeviceDrawer {...defaultProps} />
      </Provider>
    )

    await waitFor(() => {
      expect(screen.getByText('1.')).toBeInTheDocument()
    })

    expect(screen.getByText('2.')).toBeInTheDocument()
    expect(screen.getByText('3.')).toBeInTheDocument()

    // Check device serial numbers are displayed in the form
    const customNameInputs = screen.getAllByRole('textbox', { name: 'Custom AP Name' })
    expect(customNameInputs).toHaveLength(3)

    // Check model information is displayed
    expect(screen.getByText('R750')).toBeInTheDocument()
    expect(screen.getByText('R650')).toBeInTheDocument()
    expect(screen.getByText('ICX7550-48')).toBeInTheDocument()
  })

  it('handles venue selection', async () => {
    render(
      <Provider>
        <ClaimDeviceDrawer {...defaultProps} />
      </Provider>
    )

    await waitFor(() => {
      expect(screen.getByText('Venue')).toBeInTheDocument()
    })

    const venueSelect = screen.getByRole('combobox', { name: 'Venue' })
    fireEvent.mouseDown(venueSelect)

    await waitFor(() => {
      expect(screen.getByText('Venue 1')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Venue 1'))

    await waitFor(() => {
      // Check that venue is selected by looking for the selected item
      const venueElements = screen.getAllByTitle('Venue 1')
      expect(venueElements.length).toBeGreaterThan(0)
    })
  })

  it('shows AP groups when venue is selected for AP devices', async () => {
    render(
      <Provider>
        <ClaimDeviceDrawer {...defaultProps} />
      </Provider>
    )

    await waitFor(() => {
      expect(screen.getByText('Venue')).toBeInTheDocument()
    })

    const venueSelect = screen.getByRole('combobox', { name: 'Venue' })
    fireEvent.mouseDown(venueSelect)

    await waitFor(() => {
      expect(screen.getByText('Venue 1')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Venue 1'))

    // Wait for venue selection to complete and AP groups to load
    await waitFor(() => {
      expect(screen.getByText('AP Group')).toBeInTheDocument()
    })

    // Wait for the AP groups query to complete and default value to be set
    await waitFor(() => {
      // Check that AP group select is enabled (not disabled)
      const apGroupSelect = screen.getByRole('combobox', { name: 'AP Group' })
      expect(apGroupSelect).not.toBeDisabled()
    })

    const apGroupSelect = screen.getByRole('combobox', { name: 'AP Group' })
    fireEvent.mouseDown(apGroupSelect)

    // Wait for AP group options to be available
    await waitFor(() => {
      // Check that there are AP group options available
      const apGroupOptions = screen.getAllByRole('option')
      expect(apGroupOptions.length).toBeGreaterThan(0)
    })

    // Now check for specific AP group names
    await waitFor(() => {
      expect(screen.getByText('AP Group 1')).toBeInTheDocument()
    })

    await waitFor(() => {
      expect(screen.getByText('AP Group 2')).toBeInTheDocument()
    })

    // Verify that AP groups are properly loaded and selectable
    await waitFor(() => {
      // Check that we can see the AP group options in the dropdown
      const apGroupOptions = screen.getAllByRole('option')
      expect(apGroupOptions.length).toBeGreaterThanOrEqual(3) // Should have at least 3 options
    })
  })

  it('handles prefix/suffix checkbox', async () => {
    render(
      <Provider>
        <ClaimDeviceDrawer {...defaultProps} />
      </Provider>
    )

    await waitFor(() => {
      expect(screen.getByText('Use Prefix/Suffix for Device Names')).toBeInTheDocument()
    })

    const prefixSuffixCheckbox = screen.getByRole('checkbox', {
      name: 'Use Prefix/Suffix for Device Names'
    })
    fireEvent.click(prefixSuffixCheckbox)

    await waitFor(() => {
      expect(screen.getByText('Prefix')).toBeInTheDocument()
    })

    await waitFor(() => {
      expect(screen.getByText('Suffix')).toBeInTheDocument()
    })

    const prefixInput = screen.getByRole('textbox', { name: 'Prefix' })
    const suffixInput = screen.getByRole('textbox', { name: 'Suffix' })

    fireEvent.change(prefixInput, { target: { value: 'AP.' } })
    fireEvent.change(suffixInput, { target: { value: '.01' } })

    await waitFor(() => {
      expect(screen.getByDisplayValue('AP.')).toBeInTheDocument()
    })

    await waitFor(() => {
      expect(screen.getByDisplayValue('.01')).toBeInTheDocument()
    })
  })

  it('handles use serial as name checkbox', async () => {
    render(
      <Provider>
        <ClaimDeviceDrawer {...defaultProps} />
      </Provider>
    )

    await waitFor(() => {
      expect(screen.getByText('Use Serial # as Custom AP Name')).toBeInTheDocument()
    })

    const serialCheckbox = screen.getByRole('checkbox', { name: 'Use Serial # as Custom AP Name' })
    fireEvent.click(serialCheckbox)

    // Check that custom AP name fields are updated with serial numbers
    await waitFor(() => {
      expect(screen.getByDisplayValue('AP-001')).toBeInTheDocument()
    })
    expect(screen.getByDisplayValue('AP-002')).toBeInTheDocument()
    expect(screen.getByDisplayValue('SWITCH-001')).toBeInTheDocument()
  })

  it('handles form submission for Switch devices', async () => {
    const onCloseMock = jest.fn()

    render(
      <Provider>
        <ClaimDeviceDrawer {...defaultProps} deviceType='switch' onClose={onCloseMock} />
      </Provider>
    )

    await waitFor(() => {
      expect(screen.getByText('Venue')).toBeInTheDocument()
    })

    // Select venue
    const venueSelect = screen.getByRole('combobox', { name: 'Venue' })
    fireEvent.mouseDown(venueSelect)

    await waitFor(() => {
      expect(screen.getByText('Venue 1')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Venue 1'))

    // Fill in custom names
    const customNameInputs = screen.getAllByRole('textbox', { name: 'Custom Switch Name' })
    fireEvent.change(customNameInputs[0], { target: { value: 'Switch001Custom' } })
    fireEvent.change(customNameInputs[1], { target: { value: 'Switch002Custom' } })
    fireEvent.change(customNameInputs[2], { target: { value: 'Switch003Custom' } })

    // Click Claim button
    const claimButton = screen.getByText('Claim')
    fireEvent.click(claimButton)

    // Wait for drawer to close after successful submission
    await waitFor(() => {
      expect(onCloseMock).toHaveBeenCalled()
    })
  })

  it('handles API error during form submission', async () => {
    const onCloseMock = jest.fn()

    // Mock API to return error
    const { mockServer } = require('@acx-ui/test-utils')
    mockServer.use(
      rest.post('/deviceProvisions/venue/:venueId/apGroups/:apGroupId/aps', (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ error: 'Internal server error' }))
      })
    )

    render(
      <Provider>
        <ClaimDeviceDrawer {...defaultProps} onClose={onCloseMock} />
      </Provider>
    )

    await waitFor(() => {
      expect(screen.getByText('Venue')).toBeInTheDocument()
    })

    // Select venue
    const venueSelect = screen.getByRole('combobox', { name: 'Venue' })
    fireEvent.mouseDown(venueSelect)

    await waitFor(() => {
      expect(screen.getByText('Venue 1')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Venue 1'))

    // Wait for AP groups to load
    await waitFor(() => {
      expect(screen.getByText('AP Group')).toBeInTheDocument()
    })

    // Click Claim button
    const claimButton = screen.getByText('Claim')
    fireEvent.click(claimButton)

    // Wait a bit to ensure error handling completes
    await waitFor(() => {
      // Verify drawer is still open (not closed due to error)
      expect(screen.getByText('Claim Device')).toBeInTheDocument()
    })

    // Verify onClose was NOT called after error
    expect(onCloseMock).not.toHaveBeenCalled()
  })

  it('handles form submission', async () => {
    const onCloseMock = jest.fn()

    render(
      <Provider>
        <ClaimDeviceDrawer {...defaultProps} onClose={onCloseMock} />
      </Provider>
    )

    await waitFor(() => {
      expect(screen.getByText('Venue')).toBeInTheDocument()
    })

    // Select venue
    const venueSelect = screen.getByRole('combobox', { name: 'Venue' })
    fireEvent.mouseDown(venueSelect)

    await waitFor(() => {
      expect(screen.getByText('Venue 1')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Venue 1'))

    // Wait for AP groups to load and default value to be set
    await waitFor(() => {
      expect(screen.getByText('AP Group')).toBeInTheDocument()
    })

    // Wait for the AP groups query to complete and default value to be set
    await waitFor(() => {
      // Check that AP group select is enabled (not disabled)
      const apGroupSelect = screen.getByRole('combobox', { name: 'AP Group' })
      expect(apGroupSelect).not.toBeDisabled()
    })

    // Fill in custom names
    const customNameInputs = screen.getAllByRole('textbox', { name: 'Custom AP Name' })
    fireEvent.change(customNameInputs[0], { target: { value: 'AP001Custom' } })
    fireEvent.change(customNameInputs[1], { target: { value: 'AP002Custom' } })
    fireEvent.change(customNameInputs[2], { target: { value: 'Switch001Custom' } })

    // Click Claim button
    const claimButton = screen.getByText('Claim')
    fireEvent.click(claimButton)

    // Wait for drawer to close after successful submission
    await waitFor(() => {
      expect(onCloseMock).toHaveBeenCalled()
    })
  })

  it('handles close button', async () => {
    const onCloseMock = jest.fn()

    render(
      <Provider>
        <ClaimDeviceDrawer {...defaultProps} onClose={onCloseMock} />
      </Provider>
    )

    await waitFor(() => {
      expect(screen.getByText('Claim Device')).toBeInTheDocument()
    })

    const closeButton = screen.getByRole('button', { name: /close/i })
    fireEvent.click(closeButton)

    expect(onCloseMock).toHaveBeenCalled()
  })

  it('handles cancel button', async () => {
    const onCloseMock = jest.fn()

    render(
      <Provider>
        <ClaimDeviceDrawer {...defaultProps} onClose={onCloseMock} />
      </Provider>
    )

    await waitFor(() => {
      expect(screen.getByText('Cancel')).toBeInTheDocument()
    })

    // Fill in some form data first
    const venueSelect = screen.getByRole('combobox', { name: 'Venue' })
    fireEvent.mouseDown(venueSelect)

    await waitFor(() => {
      expect(screen.getByText('Venue 1')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Venue 1'))

    // Check that form has data
    await waitFor(() => {
      const venueElements = screen.getAllByTitle('Venue 1')
      expect(venueElements.length).toBeGreaterThan(0)
    })

    // Click cancel button
    const cancelButton = screen.getByRole('button', { name: 'Cancel' })
    fireEvent.click(cancelButton)

    // Verify onClose was called
    expect(onCloseMock).toHaveBeenCalled()

    // Note: The drawer visibility is controlled by the parent component
    // We can't directly test if it's destroyed from within the component
    // The onClose callback being called is sufficient to verify the cancel functionality
  })

  it('validates required fields', async () => {
    render(
      <Provider>
        <ClaimDeviceDrawer {...defaultProps} />
      </Provider>
    )

    await waitFor(() => {
      expect(screen.getByText('Claim')).toBeInTheDocument()
    })

    const claimButton = screen.getByRole('button', { name: 'Claim' })
    fireEvent.click(claimButton)

    await waitFor(() => {
      // Look for any validation message that contains "select" and "venue"
      const validationMessage = screen.getByText(/select.*venue/i)
      expect(validationMessage).toBeInTheDocument()
    })
  })

  it('handles tags input', async () => {
    render(
      <Provider>
        <ClaimDeviceDrawer {...defaultProps} />
      </Provider>
    )

    await waitFor(() => {
      expect(screen.getAllByText('Tags')).toHaveLength(3)
    })

    const tagInputs = screen.getAllByRole('combobox', { name: 'Tags' })
    const firstTagInput = tagInputs[0]

    fireEvent.change(firstTagInput, { target: { value: 'tag1' } })
    fireEvent.keyDown(firstTagInput, { key: 'Enter' })

    await waitFor(() => {
      // Use getAllByText to handle multiple elements with same text
      const tagElements = screen.getAllByText('tag1')
      expect(tagElements.length).toBeGreaterThan(0)
    })
  })

  it('shows validation error for empty device names', async () => {
    render(
      <Provider>
        <ClaimDeviceDrawer {...defaultProps} />
      </Provider>
    )

    await waitFor(() => {
      expect(screen.getByText('Venue')).toBeInTheDocument()
    })

    // Select venue
    const venueSelect = screen.getByRole('combobox', { name: 'Venue' })
    fireEvent.mouseDown(venueSelect)

    await waitFor(() => {
      expect(screen.getByText('Venue 1')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Venue 1'))

    // Wait for AP groups to load
    await waitFor(() => {
      expect(screen.getByText('AP Group')).toBeInTheDocument()
    })

    // Clear the first device name
    const customNameInputs = screen.getAllByRole('textbox', { name: 'Custom AP Name' })
    fireEvent.change(customNameInputs[0], { target: { value: '' } })

    // Click Claim button to trigger validation
    const claimButton = screen.getByText('Claim')
    fireEvent.click(claimButton)

    // Wait for validation error to appear - use getAllByText since there are multiple errors
    await waitFor(() => {
      const errorMessages = screen.getAllByText('Custom AP Name is required')
      expect(errorMessages.length).toBeGreaterThan(0)
    }, { timeout: 3000 })
  })
})