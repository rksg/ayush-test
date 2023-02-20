import '@testing-library/jest-dom'

import { useIsSplitOn }              from '@acx-ui/feature-toggle'
import { Provider }                  from '@acx-ui/store'
import { fireEvent, render, screen } from '@acx-ui/test-utils'

import { ApSettingsTab } from './'

const params = { tenantId: 'tenant-id', serialNumber: 'serial-number' }

describe('ApSettingsTab', () => {
  it('should render correctly', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    const { asFragment } = render(<Provider><ApSettingsTab /></Provider>, { route: { params } })
    expect(asFragment()).toMatchSnapshot()

    fireEvent.click(await screen.findByRole('tab', { name: 'Radio' }))
  })

  it('should render correctly when feature flag is off', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    render(<Provider><ApSettingsTab /></Provider>, { route: { params } })

    fireEvent.click(await screen.findByRole('tab', { name: 'LAN Port' }))
  })
})
