import React from 'react'


import userEvent from '@testing-library/user-event'

import { VenueExtended }  from '@acx-ui/rc/utils'
import { render, screen } from '@acx-ui/test-utils'

import {
  ConfigTemplateVenueOverride,
  VenueOverrideDisplayView,
  transformVenueOverrideValueToDisplay
} from './Venue'

jest.mock('../..', () => ({
  VenuesForm: jest.fn(
    ({ modalCallBack }: { modalCallBack: (venue: Record<string, unknown>) => void }) => (
      <button onClick={() => modalCallBack({ name: 'Venue1' })}>MockVenuesForm</button>
    )
  )
}))

jest.mock('@acx-ui/rc/services', () => ({
  useGetVenueTemplateQuery: jest.fn()
}))

jest.mock('@acx-ui/components', () => ({
  Tooltip: ({ title, children }: { title: React.ReactNode; children: React.ReactNode }) => (
    <div>
      <div data-testid='tooltip'>{title}</div>
      {children}
    </div>
  )
}))

describe('ConfigTemplateVenueOverride', () => {
  const mockOnCancel = jest.fn()
  const mockUpdateOverrideValue = jest.fn()
  const mockUseGetVenueTemplateQuery = require('@acx-ui/rc/services').useGetVenueTemplateQuery

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render VenuesForm with correct props and handle modalCallBack', async () => {
    mockUseGetVenueTemplateQuery.mockReturnValue({ data: { name: 'VenueFromApi' } })
    render(
      <ConfigTemplateVenueOverride
        templateId='tid'
        onCancel={mockOnCancel}
        updateOverrideValue={mockUpdateOverrideValue}
      />
    )
    await userEvent.click(screen.getByText('MockVenuesForm'))
    expect(mockUpdateOverrideValue).toHaveBeenCalledWith({ name: 'Venue1' })
    expect(mockOnCancel).toHaveBeenCalled()
  })

  it('should pass merged data to VenuesForm', () => {
    mockUseGetVenueTemplateQuery.mockReturnValue({ data: { name: 'VenueFromApi', foo: 1 } })
    render(
      <ConfigTemplateVenueOverride
        templateId='tid'
        existingOverrideValues={{ foo: 2, bar: 3 } as Record<string, unknown>}
        onCancel={mockOnCancel}
        updateOverrideValue={mockUpdateOverrideValue}
      />
    )
    const VenuesForm = require('../..').VenuesForm
    expect(VenuesForm).toHaveBeenCalledWith(
      expect.objectContaining({
        dataFromParent: { name: 'VenueFromApi', foo: 2, bar: 3 }
      }),
      expect.anything()
    )
  })
})

describe('VenueOverrideDisplayView', () => {
  it('should render display values in tooltip and summary', () => {
    const venue = {
      name: 'Venue1',
      description: 'desc',
      address: { addressLine: '123', countryCode: 'US' }
    }
    render(<VenueOverrideDisplayView entity={venue} />)

    const tooltip = screen.getByTestId('tooltip')
    expect(tooltip.textContent).toContain('Name')
    expect(tooltip.textContent).toContain('Venue1')
    expect(screen.getByText(/Name: Venue1/)).toBeInTheDocument()
    expect(screen.getByText(/Description: desc/)).toBeInTheDocument()
  })

  it('should handle empty entity gracefully', () => {
    render(<VenueOverrideDisplayView entity={{}} />)
    expect(screen.getByTestId('tooltip').textContent).toBe('')
  })
})

describe('transformVenueOverrideValueToDisplay', () => {
  it('should transform venue object to display values', () => {
    const venue: Partial<VenueExtended> = {
      name: 'Test Venue',
      description: 'A test venue description',
      address: {
        addressLine: '123 Test St',
        countryCode: 'US'
      }
    }
    const expectedOutput = [
      { name: 'Name', value: 'Test Venue' },
      { name: 'Description', value: 'A test venue description' },
      { name: 'Address', value: '123 Test St' },
      { name: 'Wi-Fi Country Code', value: 'United States' }
    ]
    const result = transformVenueOverrideValueToDisplay(venue)
    expect(result).toEqual(expectedOutput)
  })

  it('should exclude fields with undefined or null values', () => {
    const venue: Partial<VenueExtended> = {
      name: 'Test Venue',
      address: {
        addressLine: undefined,
        countryCode: 'XX'
      }
    }
    const expectedOutput = [
      { name: 'Name', value: 'Test Venue' }
    ]
    const result = transformVenueOverrideValueToDisplay(venue)
    expect(result).toEqual(expectedOutput)
  })

  it('should handle missing address gracefully', () => {
    const venue: Partial<VenueExtended> = {
      name: 'Test Venue',
      description: 'A test venue description'
    }
    const expectedOutput = [
      { name: 'Name', value: 'Test Venue' },
      { name: 'Description', value: 'A test venue description' }
    ]
    const result = transformVenueOverrideValueToDisplay(venue)
    expect(result).toEqual(expectedOutput)
  })
  it('should handle missing venue object gracefully', () => {
    const venue: Partial<VenueExtended> = {}
    const result = transformVenueOverrideValueToDisplay(venue)
    expect(result).toEqual([])
  })
})
