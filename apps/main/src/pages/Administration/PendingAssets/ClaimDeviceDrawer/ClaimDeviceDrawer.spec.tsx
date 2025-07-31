import React from 'react'

import { rest } from 'msw'

import { CommonUrlsInfo, WifiUrlsInfo }       from '@acx-ui/rc/utils'
import { Provider }                           from '@acx-ui/store'
import { render, fireEvent, waitFor, screen } from '@acx-ui/test-utils'
import { setUserProfile, UserProfile }        from '@acx-ui/user'

import { ClaimDeviceDrawer } from './ClaimDeviceDrawer'

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
  totalElements: 3,
  page: 0,
  size: 10,
  totalCount: 3
}

const mockApGroupsResponse = {
  data: mockApGroups,
  totalElements: 3,
  page: 0,
  size: 10,
  totalCount: 3
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

  const renderComponent = (props = {}) => {
    return render(
      <Provider>
        <ClaimDeviceDrawer {...defaultProps} {...props} />
      </Provider>
    )
  }

  const selectVenue = async () => {
    const venueSelect = screen.getByRole('combobox', { name: 'Venue' })
    fireEvent.mouseDown(venueSelect)
    await waitFor(() => {
      expect(screen.getByText('Venue 1')).toBeInTheDocument()
    })
    fireEvent.click(screen.getByText('Venue 1'))

    // Wait for venue selection to be applied by checking if AP Group becomes available
    await waitFor(() => {
      expect(screen.getByText('AP Group')).toBeInTheDocument()
    }, { timeout: 5000 })
  }

  const selectVenueForSwitch = async () => {
    const venueSelect = screen.getByRole('combobox', { name: 'Venue' })
    fireEvent.mouseDown(venueSelect)
    await waitFor(() => {
      expect(screen.getByText('Venue 1')).toBeInTheDocument()
    })
    fireEvent.click(screen.getByText('Venue 1'))

    // Wait for venue selection to be applied
    await waitFor(() => {
      expect(screen.getByText('Devices (3)')).toBeInTheDocument()
    }, { timeout: 5000 })
  }

  describe('Rendering', () => {
    it('renders correctly for AP devices', async () => {
      renderComponent()

      await waitFor(() => {
        expect(screen.getByText('Claim Device')).toBeInTheDocument()
      })

      expect(screen.getByText(/Select a.*to add your new access points:/)).toBeInTheDocument()
      expect(screen.getByText('Venue')).toBeInTheDocument()
      expect(screen.getByText('AP Group')).toBeInTheDocument()
      expect(screen.getByText('Devices (3)')).toBeInTheDocument()
      expect(screen.getByText('Use Prefix/Suffix for Device Names')).toBeInTheDocument()
      expect(screen.getByText('Use Serial # as Custom AP Name')).toBeInTheDocument()
    })

    it('renders correctly for Switch devices', async () => {
      renderComponent({ deviceType: 'switch' })

      await waitFor(() => {
        expect(screen.getByText('Claim Device')).toBeInTheDocument()
      })

      expect(screen.getByText(/Select a.*to add your new switches:/)).toBeInTheDocument()
      expect(screen.getByText('Venue')).toBeInTheDocument()
      expect(screen.getByText('Devices (3)')).toBeInTheDocument()
      expect(screen.queryByText('AP Group')).not.toBeInTheDocument()
    })

    it('displays device list correctly', async () => {
      renderComponent()

      await waitFor(() => {
        expect(screen.getByText('1.')).toBeInTheDocument()
      })

      expect(screen.getByText('2.')).toBeInTheDocument()
      expect(screen.getByText('3.')).toBeInTheDocument()

      const customNameInputs = screen.getAllByRole('textbox', { name: 'Custom AP Name' })
      expect(customNameInputs).toHaveLength(3)

      expect(screen.getByText('R750')).toBeInTheDocument()
      expect(screen.getByText('R650')).toBeInTheDocument()
      expect(screen.getByText('ICX7550-48')).toBeInTheDocument()
    })
  })

  describe('Form Interactions', () => {
    it('handles venue selection', async () => {
      renderComponent()

      await waitFor(() => {
        expect(screen.getByText('Venue')).toBeInTheDocument()
      })

      await selectVenue()

      // Check that venue selection was successful by verifying AP Group is available
      await waitFor(() => {
        expect(screen.getByText('AP Group')).toBeInTheDocument()
      })
    })

    it('shows AP groups when venue is selected for AP devices', async () => {
      renderComponent()

      await waitFor(() => {
        expect(screen.getByText('Venue')).toBeInTheDocument()
      })

      await selectVenue()

      await waitFor(() => {
        expect(screen.getByText('AP Group')).toBeInTheDocument()
      })

      // Wait for AP groups to load and be enabled
      await waitFor(() => {
        const apGroupSelect = screen.getByRole('combobox', { name: 'AP Group' })
        expect(apGroupSelect).not.toBeDisabled()
      }, { timeout: 5000 })

      const apGroupSelect = screen.getByRole('combobox', { name: 'AP Group' })
      fireEvent.mouseDown(apGroupSelect)

      await waitFor(() => {
        expect(screen.getByText('AP Group 1')).toBeInTheDocument()
      })

      await waitFor(() => {
        expect(screen.getByText('AP Group 2')).toBeInTheDocument()
      })

      // Check that we can see AP group options in the dropdown
      await waitFor(() => {
        const apGroupOptions = screen.getAllByRole('option')
        expect(apGroupOptions.length).toBeGreaterThanOrEqual(3)
      })
    })

    it('handles prefix/suffix checkbox', async () => {
      renderComponent()

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
      renderComponent()

      await waitFor(() => {
        expect(screen.getByText('Use Serial # as Custom AP Name')).toBeInTheDocument()
      })

      const serialCheckbox = screen.getByRole('checkbox', {
        name: 'Use Serial # as Custom AP Name'
      })
      fireEvent.click(serialCheckbox)

      await waitFor(() => {
        expect(screen.getByDisplayValue('AP-001')).toBeInTheDocument()
      })

      await waitFor(() => {
        expect(screen.getByDisplayValue('AP-002')).toBeInTheDocument()
      })

      await waitFor(() => {
        expect(screen.getByDisplayValue('SWITCH-001')).toBeInTheDocument()
      })
    })
  })

  describe('Form Submission', () => {
    it('handles form submission for AP devices', async () => {
      const onCloseMock = jest.fn()
      renderComponent({ onClose: onCloseMock })

      await waitFor(() => {
        expect(screen.getByText('Venue')).toBeInTheDocument()
      })

      await selectVenue()

      // Wait longer for AP groups to load after venue selection
      await waitFor(() => {
        expect(screen.getByText('AP Group')).toBeInTheDocument()
      }, { timeout: 10000 })

      // Wait for AP groups to load and be enabled
      await waitFor(() => {
        const apGroupSelect = screen.getByRole('combobox', { name: 'AP Group' })
        expect(apGroupSelect).not.toBeDisabled()
      }, { timeout: 10000 })

      // Manually select an AP Group
      const apGroupSelect = screen.getByRole('combobox', { name: 'AP Group' })
      fireEvent.mouseDown(apGroupSelect)

      // Wait for dropdown to open and show options
      await waitFor(() => {
        expect(screen.getByText('AP Group 1')).toBeInTheDocument()
      }, { timeout: 5000 })

      // Click on the first available AP Group
      fireEvent.click(screen.getByText('AP Group 1'))

      // Wait for selection to be applied by checking if the form is ready for submission
      await waitFor(() => {
        const claimButton = screen.getByText('Claim')
        expect(claimButton).toBeInTheDocument()
      }, { timeout: 5000 })

      const customNameInputs = screen.getAllByRole('textbox', { name: 'Custom AP Name' })
      fireEvent.change(customNameInputs[0], { target: { value: 'AP001Custom' } })
      fireEvent.change(customNameInputs[1], { target: { value: 'AP002Custom' } })
      fireEvent.change(customNameInputs[2], { target: { value: 'Switch001Custom' } })

      const claimButton = screen.getByText('Claim')
      fireEvent.click(claimButton)

      // Wait for form submission to complete
      await waitFor(() => {
        expect(onCloseMock).toHaveBeenCalled()
      }, { timeout: 10000 })
    })

    it('handles form submission for Switch devices', async () => {
      const onCloseMock = jest.fn()
      renderComponent({ onClose: onCloseMock, deviceType: 'switch' })

      await waitFor(() => {
        expect(screen.getByText('Venue')).toBeInTheDocument()
      })

      await selectVenueForSwitch()

      const customNameInputs = screen.getAllByRole('textbox', { name: 'Custom Switch Name' })
      fireEvent.change(customNameInputs[0], { target: { value: 'Switch001Custom' } })
      fireEvent.change(customNameInputs[1], { target: { value: 'Switch002Custom' } })
      fireEvent.change(customNameInputs[2], { target: { value: 'Switch003Custom' } })

      const claimButton = screen.getByText('Claim')
      fireEvent.click(claimButton)

      await waitFor(() => {
        expect(onCloseMock).toHaveBeenCalled()
      }, { timeout: 10000 })
    })

    it('validates required fields', async () => {
      renderComponent()

      await waitFor(() => {
        expect(screen.getByText('Claim')).toBeInTheDocument()
      })

      const claimButton = screen.getByRole('button', { name: 'Claim' })
      fireEvent.click(claimButton)

      await waitFor(() => {
        const validationMessage = screen.getByText(/select.*venue/i)
        expect(validationMessage).toBeInTheDocument()
      })
    })
  })

  describe('Form Actions', () => {
    it('handles close button', async () => {
      const onCloseMock = jest.fn()
      renderComponent({ onClose: onCloseMock })

      await waitFor(() => {
        expect(screen.getByText('Claim Device')).toBeInTheDocument()
      })

      const closeButton = screen.getByRole('button', { name: /close/i })
      fireEvent.click(closeButton)

      expect(onCloseMock).toHaveBeenCalled()
    })

    it('handles cancel button', async () => {
      const onCloseMock = jest.fn()
      renderComponent({ onClose: onCloseMock })

      await waitFor(() => {
        expect(screen.getByText('Venue')).toBeInTheDocument()
      })

      await selectVenue()

      // Check that venue selection was successful
      await waitFor(() => {
        expect(screen.getByText('AP Group')).toBeInTheDocument()
      })

      const cancelButton = screen.getByRole('button', { name: 'Cancel' })
      fireEvent.click(cancelButton)

      expect(onCloseMock).toHaveBeenCalled()
    })
  })

  describe('Additional Features', () => {
    it('handles tags input', async () => {
      renderComponent()

      await waitFor(() => {
        expect(screen.getAllByText('Tags')).toHaveLength(3)
      })

      const tagInputs = screen.getAllByRole('combobox', { name: 'Tags' })
      const firstTagInput = tagInputs[0]

      fireEvent.change(firstTagInput, { target: { value: 'tag1' } })
      fireEvent.keyDown(firstTagInput, { key: 'Enter' })

      await waitFor(() => {
        const tagElements = screen.getAllByText('tag1')
        expect(tagElements.length).toBeGreaterThan(0)
      })
    })

    it('handles add venue button click', async () => {
      const onAddVenueMock = jest.fn()
      renderComponent({ onAddVenue: onAddVenueMock })

      await waitFor(() => {
        expect(screen.getByText('Venue')).toBeInTheDocument()
      })

      const addButtons = screen.getAllByText('Add')
      const venueAddButton = addButtons[0]
      fireEvent.click(venueAddButton)

      expect(onAddVenueMock).toHaveBeenCalled()
    })

    it('handles add AP group button click', async () => {
      const onAddApGroupMock = jest.fn()
      renderComponent({ onAddApGroup: onAddApGroupMock })

      await waitFor(() => {
        expect(screen.getByText('Venue')).toBeInTheDocument()
      })

      await selectVenue()

      await waitFor(() => {
        expect(screen.getByText('AP Group')).toBeInTheDocument()
      })

      const addButtons = screen.getAllByText('Add')
      const apGroupAddButton = addButtons[1]
      fireEvent.click(apGroupAddButton)

      expect(onAddApGroupMock).toHaveBeenCalled()
    })
  })

  describe('Edge Cases', () => {
    it('handles empty devices array', async () => {
      renderComponent({ devices: [] })

      await waitFor(() => {
        expect(screen.getByText('Claim Device')).toBeInTheDocument()
      })

      expect(screen.getByText('Devices (0)')).toBeInTheDocument()
    })

    it('handles single device array', async () => {
      const singleDevice = [{ serial: 'AP-001', model: 'R750' }]
      renderComponent({ devices: singleDevice })

      await waitFor(() => {
        expect(screen.getByText('Claim Device')).toBeInTheDocument()
      })

      expect(screen.getByText('Devices (1)')).toBeInTheDocument()
      expect(screen.getByText('1.')).toBeInTheDocument()
      expect(screen.queryByText('2.')).not.toBeInTheDocument()
    })

    it('handles drawer visibility prop', async () => {
      renderComponent({ visible: false })

      expect(screen.queryByText('Claim Device')).not.toBeInTheDocument()
    })
  })
})