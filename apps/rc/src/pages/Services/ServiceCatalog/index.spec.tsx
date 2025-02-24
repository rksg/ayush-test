import userEvent from '@testing-library/user-event'

import { Features, TierFeatures, useIsBetaEnabled, useIsSplitOn, useIsTierAllowed } from '@acx-ui/feature-toggle'
import { useIsEdgeFeatureReady }                                                    from '@acx-ui/rc/components'
import { IncompatibilityFeatures }                                                  from '@acx-ui/rc/utils'
import { Provider }                                                                 from '@acx-ui/store'
import {
  render,
  screen
} from '@acx-ui/test-utils'

import ServiceCatalog from '.'

jest.mock('@acx-ui/rc/components', () => ({
  ...jest.requireActual('@acx-ui/rc/components'),
  ApCompatibilityToolTip: (props: { onClick: () => void }) =>
    <div data-testid='ApCompatibilityToolTip' onClick={props.onClick}/>,
  EdgeCompatibilityDrawer: (props: { featureName: IncompatibilityFeatures }) =>
    <div data-testid='EdgeCompatibilityDrawer'>
      {props.featureName}
    </div>,
  useIsEdgeFeatureReady: jest.fn().mockReturnValue(false)
}))

jest.mock('@acx-ui/feature-toggle', () => ({
  ...jest.requireActual('@acx-ui/feature-toggle'),
  useIsSplitOn: jest.fn(),
  useIsTierAllowed: jest.fn(),
  useIsBetaEnabled: jest.fn().mockReturnValue(false)
}))

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
    expect(screen.queryByText('Thirdparty Network Management')).toBeNull()
  })

  it('should render service catalog with feature flag ON', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    jest.mocked(useIsTierAllowed).mockReturnValue(true)
    jest.mocked(useIsEdgeFeatureReady).mockReturnValue(true)

    render(<Provider>
      <ServiceCatalog />
    </Provider>, {
      route: { params, path }
    }
    )

    expect(await screen.findByText('Personal Identity Network')).toBeVisible()
    expect(await screen.findByText('Network Control')).toBeVisible()
    expect(screen.getByText('SD-LAN')).toBeVisible()
    expect(screen.getByText('Thirdparty Network Management')).toBeVisible()
  })

  it('should not render edge-firewall service with the HA-FF OFF', async () => {
    jest.mocked(useIsEdgeFeatureReady)
      .mockImplementation(ff => ff === Features.EDGE_HA_TOGGLE)

    render(
      <ServiceCatalog />, {
        route: { params, path }
      }
    )

    expect(screen.queryByText('Firewall')).toBeNull()
  })

  it('should not render edge-dhcp service with the HA-FF ON and dhcp-HA-FF OFF', async () => {
    jest.mocked(useIsEdgeFeatureReady)
      .mockImplementation(ff => ff === Features.EDGE_HA_TOGGLE
        || (ff !== Features.EDGE_DHCP_HA_TOGGLE
          && ff !== Features.EDGE_COMPATIBILITY_CHECK_TOGGLE))

    render(<Provider>
      <ServiceCatalog />
    </Provider>, {
      route: { params, path }
    })

    expect(screen.queryByText('DHCP for RUCKUS Edge')).toBeNull()
  })

  describe('Edge SD-LAN', () => {
    beforeEach(() => {
      jest.mocked(useIsEdgeFeatureReady)
        .mockImplementation(ff => ff === Features.EDGES_SD_LAN_HA_TOGGLE
          || ff === Features.EDGES_TOGGLE
          || ff === Features.EDGE_COMPATIBILITY_CHECK_TOGGLE)
    })

    it('should render Edge SD-LAN with feature flag ON', async () => {
      render(<Provider>
        <ServiceCatalog />
      </Provider>, {
        route: { params, path }
      })

      expect(screen.getByText('SD-LAN')).toBeVisible()
    })
    it('should show Edge SD-LAN compatibility component', async () => {
      render(<Provider>
        <ServiceCatalog />
      </Provider>, {
        route: { params, path }
      })

      const toolTips = await screen.findAllByTestId('ApCompatibilityToolTip')
      expect(toolTips.length).toBe(1)
      toolTips.forEach(t => expect(t).toBeVisible())
      await userEvent.click(toolTips[0])
      const compatibilityDrawer = await screen.findByTestId('EdgeCompatibilityDrawer')
      expect(compatibilityDrawer).toBeVisible()
      expect(compatibilityDrawer).toHaveTextContent(IncompatibilityFeatures.SD_LAN)
    })
  })

  describe('Edge DHCP', () => {
    beforeEach(() => {
      jest.mocked(useIsEdgeFeatureReady)
        .mockImplementation(ff => ff === Features.EDGE_DHCP_HA_TOGGLE
          || ff === Features.EDGE_HA_TOGGLE
          || ff === Features.EDGES_TOGGLE
          || ff === Features.EDGE_COMPATIBILITY_CHECK_TOGGLE)
    })

    it('should render Edge DHCP with feature flag ON', async () => {
      render(<Provider>
        <ServiceCatalog />
      </Provider>, {
        route: { params, path }
      })

      expect(screen.getByText('DHCP for RUCKUS Edge')).toBeVisible()
    })
    it('should show Edge DHCP compatibility component', async () => {
      render(<Provider>
        <ServiceCatalog />
      </Provider>, {
        route: { params, path }
      })

      const toolTips = await screen.findAllByTestId('ApCompatibilityToolTip')
      expect(toolTips.length).toBe(1)
      toolTips.forEach(t => expect(t).toBeVisible())
      await userEvent.click(toolTips[0])
      const compatibilityDrawer = await screen.findByTestId('EdgeCompatibilityDrawer')
      expect(compatibilityDrawer).toBeVisible()
      expect(compatibilityDrawer).toHaveTextContent(IncompatibilityFeatures.DHCP)
    })
  })

  describe('Edge PIN', () => {
    beforeEach(() => {
      jest.mocked(useIsTierAllowed).mockImplementation(ff => ff === TierFeatures.EDGE_ADV)
      jest.mocked(useIsEdgeFeatureReady)
        .mockImplementation(ff => ff === Features.EDGE_PIN_HA_TOGGLE
          || ff === Features.EDGES_TOGGLE
          || ff === Features.EDGE_COMPATIBILITY_CHECK_TOGGLE)
    })

    it('should render Edge PIN with feature flag ON', async () => {
      render(<Provider>
        <ServiceCatalog />
      </Provider>, {
        route: { params, path }
      })

      expect(screen.getByText('Personal Identity Network')).toBeVisible()
    })
    it('should show Edge PIN compatibility component', async () => {
      render(<Provider>
        <ServiceCatalog />
      </Provider>, {
        route: { params, path }
      })

      const toolTips = await screen.findAllByTestId('ApCompatibilityToolTip')
      expect(toolTips.length).toBe(1)
      toolTips.forEach(t => expect(t).toBeVisible())
      await userEvent.click(toolTips[0])
      const compatibilityDrawer = await screen.findByTestId('EdgeCompatibilityDrawer')
      expect(compatibilityDrawer).toBeVisible()
      expect(compatibilityDrawer).toHaveTextContent(IncompatibilityFeatures.PIN)
    })
  })

  describe('Edge mDNS', () => {
    beforeEach(() => {
      jest.mocked(useIsEdgeFeatureReady)
        .mockImplementation(ff => ff === Features.EDGE_MDNS_PROXY_TOGGLE
          || ff === Features.EDGES_TOGGLE
          || ff === Features.EDGE_COMPATIBILITY_CHECK_TOGGLE)
    })

    it('should render Edge mDNS with feature flag ON', async () => {
      render(<Provider>
        <ServiceCatalog />
      </Provider>, {
        route: { params, path }
      })

      expect(screen.getByText('mDNS Proxy for RUCKUS Edge')).toBeVisible()
    })
    it('should show Edge mDNS compatibility component', async () => {
      render(<Provider>
        <ServiceCatalog />
      </Provider>, {
        route: { params, path }
      })

      const toolTips = await screen.findAllByTestId('ApCompatibilityToolTip')
      expect(toolTips.length).toBe(1)
      toolTips.forEach(t => expect(t).toBeVisible())
      await userEvent.click(toolTips[0])
      const compatibilityDrawer = await screen.findByTestId('EdgeCompatibilityDrawer')
      expect(compatibilityDrawer).toBeVisible()
      expect(compatibilityDrawer).toHaveTextContent(IncompatibilityFeatures.EDGE_MDNS_PROXY)
    })

    it('should show BetaIndicator when Edge mDNS is beta feature', async () => {
      jest.mocked(useIsBetaEnabled).mockReturnValue(true)

      render(<Provider>
        <ServiceCatalog />
      </Provider>, {
        route: { params, path }
      })

      expect(await screen.findByTestId('RocketOutlined')).toBeVisible()
    })
  })


  describe('Edge OLT', () => {
    it('should render Edge OLT when FF is ON', async () => {
      // eslint-disable-next-line max-len
      jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.EDGE_NOKIA_OLT_MGMT_TOGGLE)

      render(<Provider>
        <ServiceCatalog />
      </Provider>, {
        route: { params, path }
      })

      await screen.findByText('NOKIA GPON Services')
    })

    it('should not render Edge OLT when FF is OFF', async () => {
      jest.mocked(useIsSplitOn).mockReturnValue(false)

      render(<Provider>
        <ServiceCatalog />
      </Provider>, {
        route: { params, path }
      })

      expect(screen.queryByText('NOKIA GPON Services')).toBeNull()
    })
  })
})