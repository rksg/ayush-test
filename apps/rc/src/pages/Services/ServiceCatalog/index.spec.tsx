import { Features, useIsSplitOn, useIsTierAllowed } from '@acx-ui/feature-toggle'
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
  })

  it('should render service catalog with feature flag ON', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    jest.mocked(useIsTierAllowed).mockReturnValue(true)

    render(
      <ServiceCatalog />, {
        route: { params, path }
      }
    )

    expect(await screen.findByText('Personal Identity Network')).toBeVisible()
    expect(await screen.findByText('Network Control')).toBeVisible()
    await screen.findAllByText('SD-LAN')
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
    jest.mocked(useIsSplitOn).mockImplementation(featureFlag => {
      return featureFlag === Features.EDGE_HA_TOGGLE
        || featureFlag !== Features.EDGE_DHCP_HA_TOGGLE
    })

    render(
      <ServiceCatalog />, {
        route: { params, path }
      }
    )

    expect(screen.queryByText('DHCP for SmartEdge')).toBeNull()
  })
})
