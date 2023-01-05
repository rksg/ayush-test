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
    fireEvent.click(await screen.findByRole('tab', { name: 'LAN Port' }))
  })

  it('should show Directed Multicast tab when FF is ON', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    render(<Provider><ApSettingsTab /></Provider>, { route: { params } })
    fireEvent.click(await screen.findByRole('tab', { name: 'Directed Multicast' }))
  })
})