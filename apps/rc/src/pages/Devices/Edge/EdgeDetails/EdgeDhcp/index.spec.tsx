import userEvent from '@testing-library/user-event'

import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import EdgeDhcp from '.'

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('Edge DHCP', () => {

  let params: { tenantId: string, serialNumber: string, activeTab?: string, activeSubTab?: string }
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      serialNumber: '000000000000',
      activeTab: 'dhcp'
    }
  })

  it('Active Pools tab successfully', async () => {
    params.activeSubTab = 'pools'
    render(
      <Provider>
        <EdgeDhcp />
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/devices/edge/:serialNumber/edge-details/:activeTab/:activeSubTab'
        }
      })
    const poolsTab = screen.getByRole('tab', { name: 'Pools' })
    expect(poolsTab.getAttribute('aria-selected')).toBeTruthy()
  })

  it('Active Leases tab successfully', async () => {
    params.activeSubTab = 'leases'
    render(
      <Provider>
        <EdgeDhcp />
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/devices/edge/:serialNumber/edge-details/:activeTab/:activeSubTab'
        }
      })
    const leasesTab = screen.getByRole('tab', { name: 'Leases ( 2 online )' })
    expect(leasesTab.getAttribute('aria-selected')).toBeTruthy()
  })

  it('switch tab', async () => {
    params.activeSubTab = 'pools'
    const user = userEvent.setup()
    render(
      <Provider>
        <EdgeDhcp />
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/devices/edge/:serialNumber/edge-details/:activeTab/:activeSubTab'
        }
      })
    await user.click(screen.getByRole('tab', { name: 'Leases ( 2 online )' }))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      // eslint-disable-next-line max-len
      pathname: `/t/${params.tenantId}/devices/edge/${params.serialNumber}/edge-details/dhcp/leases`,
      hash: '',
      search: ''
    })
  })

  it('open/close ManageDhcpDrawer', async () => {
    params.activeSubTab = 'pools'
    const user = userEvent.setup()
    render(
      <Provider>
        <EdgeDhcp />
      </Provider>, {
        route: {
          params,
          path: '/:tenantId/devices/edge/:serialNumber/edge-details/:activeTab/:activeSubTab'
        }
      })
    await user.click(screen.getByTestId('setting-icon'))
    await screen.findByText('Manage DHCP for SmartEdge Service')
    await user.click(screen.getByRole('button', { name: 'Close' }))
  })
})