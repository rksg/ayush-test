import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'

import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import { ConfigTemplateContext }  from '@acx-ui/rc/utils'
import { Provider }               from '@acx-ui/store'
import { mockServer,
  render,
  screen
} from '@acx-ui/test-utils'


import { configTemplateHandlers, handlers } from './__tests__/fixtures'

import DHCPInstance from '.'

jest.mock('./PoolTable', () => () => <div>PoolTable</div>)

describe('Venue DHCP Instance', () => {
  it('should render DHCP instance correctly', async () => {
    mockServer.use(...handlers)

    const params = { tenantId: 'tenant-id', venueId: '3b11bcaffd6f4f4f9b2805b6fe24bf8b' }
    render(<Provider><DHCPInstance /></Provider>, {
      route: { params, path: '/:tenantId/t/venues/:venueId/venue-details/services' }
    })

    await screen.findByText('abcd')
    const buttonmanage = screen.getByRole('button', { name: 'Manage Local Service' })
    await userEvent.click(buttonmanage)
    await userEvent.click(screen.getByRole('button', { name: 'Add gateway' }))
    await screen.findAllByText('Select AP...')

    await userEvent.click(screen.getByRole('button', { name: 'Apply' }))
    await userEvent.click(screen.getByRole('button', { name: 'Manage Local Service' }))
    await screen.findByText(/manage local dhcp for wi-fi service/i)
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    const radioButton = screen.getByRole('radio', { name: 'Lease Table (1 Online)' })
    await userEvent.click(radioButton)

    await screen.findByRole('cell', {
      name: /dhcp-3/i
    })

    expect(radioButton).toBeChecked()
  })

  it('should call rbac apis and render correctly', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.RBAC_SERVICE_POLICY_TOGGLE)
    mockServer.use(
      ...handlers
    )

    const params = { tenantId: 'tenant-id', venueId: '7bf824f4b7f949f2b64e18fb6d05b0f4' }
    render(<Provider><DHCPInstance /></Provider>, {
      route: { params, path: '/:tenantId/t/venues/:venueId/venue-details/services' }
    })

    expect(await screen.findByText('abcd')).toBeVisible()
    expect(screen.getByText('Multiple APs')).toBeVisible()
    expect(screen.getByText('ON')).toBeVisible()
    expect(screen.getByText('922102020872')).toBeVisible()
    expect(screen.getByRole('radio', { name: 'Pools (2)' })).toBeVisible()
    expect(screen.getByRole('radio', { name: 'Lease Table (1 Online)' })).toBeVisible()
  })

  it('should call rbac apis and render correctly for config template', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.RBAC_CONFIG_TEMPLATE_TOGGLE)
    mockServer.use(
      ...configTemplateHandlers
    )

    const params = { tenantId: 'tenant-id', venueId: 'f6b580778ca54db78611ba4dcf2e29ba' }
    render(<ConfigTemplateContext.Provider value={{ isTemplate: true }}>
      <Provider><DHCPInstance /></Provider></ConfigTemplateContext.Provider>, {
      route: { params, path: '/:tenantId/t/venues/:venueId/venue-details/services' }
    })

    expect(await screen.findByText('dhcpConfigTemplate1')).toBeVisible()
    expect(screen.getByText('Each APs')).toBeVisible()
    expect(screen.getByText('ON')).toBeVisible()
  })
})
