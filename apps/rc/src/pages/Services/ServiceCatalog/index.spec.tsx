import { Features, useIsSplitOn, useIsTierAllowed } from '@acx-ui/feature-toggle'
import { Provider }                                 from '@acx-ui/store'
import {
  render,
  screen
} from '@acx-ui/test-utils'

import ServiceCatalog from '.'

describe('ServiceCatalog', () => {
  const params = {
    tenantId: '15320bc221d94d2cb537fa0189fee742'
  }

  const path = '/t/:tenantId'

  it('should render service catalog', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)

    render(
      <ServiceCatalog />, {
        route: { params, path }
      }
    )

    expect(await screen.findByText('mDNS Proxy')).toBeVisible()

    expect(screen.queryByText('Personal Identity Network')).toBeNull()
    expect(screen.queryByText('SD-LAN')).toBeNull()
    expect(screen.queryByText('mDNS Proxy for RUCKUS Edge')).toBeNull()
  })

  it('should render service catalog with feature flag ON', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    jest.mocked(useIsTierAllowed).mockReturnValue(true)

    render(<Provider>
      <ServiceCatalog />
    </Provider>, {
      route: { params, path }
    }
    )

    expect(await screen.findByText('Personal Identity Network')).toBeVisible()
    expect(await screen.findByText('Network Control')).toBeVisible()
    expect(screen.getByText('SD-LAN')).toBeVisible()
    expect(screen.getByText('mDNS Proxy for RUCKUS Edge')).toBeVisible()
  })

  it('should not render edge-firewall service with the HA-FF OFF', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(featureFlag => {
      return featureFlag === Features.EDGE_HA_TOGGLE
    })

    render(
      <ServiceCatalog />, {
        route: { params, path }
      }
    )

    expect(screen.queryByText('Firewall')).toBeNull()
  })

  it('should not render edge-dhcp service with the HA-FF ON and dhcp-HA-FF OFF', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => {
      return ff === Features.EDGE_HA_TOGGLE
        || (ff !== Features.EDGE_DHCP_HA_TOGGLE && ff !== Features.EDGE_COMPATIBILITY_CHECK_TOGGLE)
    })

    render(<Provider>
      <ServiceCatalog />
    </Provider>, {
      route: { params, path }
    }
    )

    expect(screen.queryByText('DHCP for SmartEdge')).toBeNull()
  })
})