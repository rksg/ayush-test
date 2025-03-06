import userEvent     from '@testing-library/user-event'
import { cloneDeep } from 'lodash'
import { rest }      from 'msw'

import { Features }     from '@acx-ui/feature-toggle'
import { edgeSdLanApi } from '@acx-ui/rc/services'
import {
  EdgeDHCPFixtures,
  EdgeDhcpUrls,
  EdgeFirewallFixtures,
  EdgeFirewallUrls,
  EdgeGeneralFixtures,
  EdgePinFixtures,
  EdgeSdLanFixtures,
  EdgeSdLanUrls,
  EdgeUrlsInfo,
  EdgePinUrls,
  PersonaUrls,
  TunnelProfileUrls,
  EdgeMdnsProxyUrls,
  EdgeMdnsFixtures
} from '@acx-ui/rc/utils'
import { Provider, store } from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitForElementToBeRemoved,
  within
} from '@acx-ui/test-utils'

import {
  mockedPersonaGroup,
  mockedTunnelProfileData
} from '../../../__tests__/fixtures'

import { ServiceDetailDrawer } from '.'

const {
  mockEdgeData: currentEdge,
  mockEdgeList,
  mockEdgeServiceList
} = EdgeGeneralFixtures
const { mockedSdLanDataList, mockedSdLanDataListP2, mockedMvSdLanDataList } = EdgeSdLanFixtures
const { mockFirewallData } = EdgeFirewallFixtures
const { mockDhcpStatsData, mockEdgeDhcpDataList } = EdgeDHCPFixtures
const mockPinStatsList = cloneDeep(EdgePinFixtures.mockPinStatsList)
mockPinStatsList.data[0].edgeClusterInfo.segments = 10
const { mockEdgeMdnsViewDataList } = EdgeMdnsFixtures

const mockedSetVisible = jest.fn()
const mockedUseSearchParams = jest.fn()
const mockUseIsEdgeFeatureReady = jest.fn().mockReturnValue(false)

jest.mock('@acx-ui/rc/components', () => ({
  EdgeFirewallGroupedStatsTables: () => <div data-testid='rc-EdgeFirewallGroupedStatsTables' />,
  MdnsProxyForwardingRulesTable: () => <div data-testid='rc-MdnsProxyForwardingRulesTable' />,
  PersonalIdentityNetworkDetailTableGroup: () => <div data-testid='rc-PinTableGroup' />,
  useIsEdgeFeatureReady: (ff: Features) => mockUseIsEdgeFeatureReady(ff)
}))

describe('Edge Detail Services Tab - Service Detail Drawer', () => {
  let params: { tenantId: string, serialNumber: string, activeTab: string } =
  // eslint-disable-next-line max-len
  { tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac', serialNumber: currentEdge.serialNumber, activeTab: 'services' }

  beforeEach(() => {
    mockedSetVisible.mockReset()
    mockedUseSearchParams.mockReset()
    mockedUseSearchParams.mockReturnValue(null)

    store.dispatch(edgeSdLanApi.util.resetApiState())

    mockServer.use(
      rest.post(
        EdgeDhcpUrls.getDhcpStats.url,
        (_req, res, ctx) => res(ctx.json(mockDhcpStatsData))
      ),
      rest.post(
        EdgeUrlsInfo.getEdgeList.url,
        (_req, res, ctx) => res(ctx.json(mockEdgeList))
      ),
      rest.get(
        EdgeFirewallUrls.getEdgeFirewall.url,
        (_req, res, ctx) => res(ctx.json(mockFirewallData))
      ),
      rest.post(
        EdgePinUrls.getEdgePinStatsList.url,
        (_req, res, ctx) => res(ctx.json(mockPinStatsList))
      ),
      rest.get(
        EdgeDhcpUrls.getDhcp.url,
        (_req, res, ctx) => res(ctx.json(mockEdgeDhcpDataList.content[0]))
      ),
      rest.get(
        PersonaUrls.getPersonaGroupById.url,
        (_req, res, ctx) => res(ctx.json(mockedPersonaGroup))
      ),
      rest.get(
        TunnelProfileUrls.getTunnelProfile.url,
        (_req, res, ctx) => res(ctx.json(mockedTunnelProfileData))
      ),
      rest.post(
        EdgeSdLanUrls.getEdgeSdLanViewDataList.url,
        (_, res, ctx) => res(ctx.json({ data: mockedSdLanDataList }))
      ),
      rest.post(
        EdgeMdnsProxyUrls.getEdgeMdnsProxyViewDataList.url,
        (_, res, ctx) => res(ctx.json({ data: mockEdgeMdnsViewDataList }))
      )
    )
  })

  it('should render basic info successfully', async () => {
    render(
      <Provider>
        <ServiceDetailDrawer
          visible={true}
          setVisible={mockedSetVisible}
          serviceData={mockEdgeServiceList.data[0]}
        />
      </Provider>, {
        route: { params }
      })

    expect(await screen.findByText('Service Name')).toBeVisible()
    expect(await screen.findByText('DHCP-1')).toBeVisible()
    expect(await screen.findByText('Service Type')).toBeVisible()
    expect(await screen.findByText('DHCP')).toBeVisible()
    await userEvent.click(await screen.findByRole('button', { name: 'Close' }))
    expect(mockedSetVisible).toBeCalledWith(false)
  })

  it('should render DHCP detail successfully', async () => {
    render(
      <Provider>
        <ServiceDetailDrawer
          visible={true}
          setVisible={mockedSetVisible}
          serviceData={mockEdgeServiceList.data[0]}
        />
      </Provider>, {
        route: { params }
      })

    expect(await screen.findByText('DHCP Relay')).toBeVisible()
    expect(await screen.findByText('ON')).toBeVisible()
    expect(await screen.findByText('DHCP Pool')).toBeVisible()
    expect(await screen.findByText('3')).toBeVisible()
    expect(await screen.findByText('Lease Time')).toBeVisible()
    expect(await screen.findByText('24 hours')).toBeVisible()
  })

  it('should render firewall detail successfully', async () => {
    render(
      <Provider>
        <ServiceDetailDrawer
          visible={true}
          setVisible={mockedSetVisible}
          serviceData={mockEdgeServiceList.data[2]}
        />
      </Provider>, {
        route: { params }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    expect(await screen.findByText('Firewall Details')).toBeVisible()
    // firewall name
    expect(screen.queryByRole('link', { name: 'FIREWALL-1' })).toBeVisible()
    await screen.findByTestId('rc-EdgeFirewallGroupedStatsTables')
  })

  it('should render PIN detail successfully', async () => {
    render(
      <Provider>
        <ServiceDetailDrawer
          visible={true}
          setVisible={mockedSetVisible}
          serviceData={mockEdgeServiceList.data[1]}
        />
      </Provider>, {
        route: { params }
      })
    expect(await screen.findByRole('link', { name: 'NSG-1' })).toBeVisible()
    expect(await screen.findByText('Venue')).toBeVisible()
    expect(await screen.findByRole('link', { name: 'MockVenue1' })).toBeVisible()
    expect(await screen.findByText('Identity Group')).toBeVisible()
    expect(await screen.findByRole('link', { name: 'TestPersona' })).toBeVisible()
    expect(await screen.findByText('Number of Segments')).toBeVisible()
    expect(await screen.findByText('10')).toBeVisible()
    expect(await screen.findByText('Number of devices per segment')).toBeVisible()
    expect(await screen.findByText('253')).toBeVisible()
    expect(await screen.findByText('DHCP Service')).toBeVisible()
    expect(await screen.findByRole('link', { name: 'TestDhcp-1' })).toBeVisible()
    expect(await screen.findByText('Tunnel Profile')).toBeVisible()
    expect(await screen.findByRole('link', { name: /tunnelProfile1/i })).toBeVisible()
    expect(await screen.findByText('Networks')).toBeVisible()
    expect(await screen.findByText('1')).toBeVisible()
    expect(await screen.findByTestId('rc-PinTableGroup')).toBeVisible()
  })

  it('should render SD-LAN detail successfully', async () => {
    render(
      <Provider>
        <ServiceDetailDrawer
          visible={true}
          setVisible={mockedSetVisible}
          serviceData={mockEdgeServiceList.data[3]}
        />
      </Provider>, {
        route: { params }
      })
    expect(await screen.findByRole('link', { name: 'Mocked_tunnel-1' })).toBeVisible()
    expect(screen.queryByText('Tunnel Profile (AP-Cluster)')).toBeNull()
  })

  describe('SD-LAN Phase2', () => {
    beforeEach(() => {
      // mock SDLAN HA(i,e p2) enabled
      jest.mocked(mockUseIsEdgeFeatureReady)
        .mockImplementation((ff) => ff === Features.EDGES_SD_LAN_HA_TOGGLE)
    })

    it('should render DMZ scenario detail successfully', async () => {
      mockServer.use(
        rest.post(
          EdgeSdLanUrls.getEdgeSdLanViewDataList.url,
          (_, res, ctx) => res(ctx.json({ data: mockedSdLanDataListP2 }))
        )
      )

      render(
        <Provider>
          <ServiceDetailDrawer
            visible={true}
            setVisible={mockedSetVisible}
            serviceData={mockEdgeServiceList.data[3]}
          />
        </Provider>, {
          route: { params, path: '/:tenantId/devices/edge/:serialNumber/details/:activeTab' }
        })

      expect(await screen.findByRole('link', { name: 'Mocked_tunnel-1' })).toBeVisible()
      expect(screen.getByRole('link', { name: 'Mocked_tunnel-3' })).toBeVisible()
      expect(screen.getByText('Tunnel Profile (Cluster-DMZ Cluster)')).toBeVisible()
      const networkItemContainer = screen.getByText('Tunneling Networks to DMZ')
        // eslint-disable-next-line testing-library/no-node-access
        .closest('.ant-row.ant-form-item-row')
      expect(within(networkItemContainer as HTMLElement).getByText('1')).toBeVisible()
    })

    it('should render non-DMZ scenario detail successfully', async () => {
      mockServer.use(
        rest.post(
          EdgeSdLanUrls.getEdgeSdLanViewDataList.url,
          (_, res, ctx) => res(ctx.json({ data: mockedSdLanDataListP2.slice(1) }))
        )
      )

      render(
        <Provider>
          <ServiceDetailDrawer
            visible={true}
            setVisible={mockedSetVisible}
            serviceData={mockEdgeServiceList.data[3]}
          />
        </Provider>, {
          route: { params, path: '/:tenantId/devices/edge/:serialNumber/details/:activeTab' }
        })

      expect(await screen.findByRole('link', { name: 'Mocked_tunnel-2' })).toBeVisible()
      const networkItemContainer = screen.getByText('Tunneling Networks')
        // eslint-disable-next-line testing-library/no-node-access
        .closest('.ant-row.ant-form-item-row')
      expect(within(networkItemContainer as HTMLElement).getByText('1')).toBeVisible()
    })
  })

  describe('Multi-venues SD-LAN', () => {
    beforeEach(() => {
      jest.mocked(mockUseIsEdgeFeatureReady)
        .mockImplementation(ff => ff === Features.EDGE_SD_LAN_MV_TOGGLE)
    })

    it('should render DMZ scenario detail successfully', async () => {
      mockServer.use(
        rest.post(
          EdgeSdLanUrls.getEdgeSdLanViewDataList.url,
          (_, res, ctx) => res(ctx.json({ data: [mockedMvSdLanDataList[0]] }))
        )
      )

      render(
        <Provider>
          <ServiceDetailDrawer
            visible={true}
            setVisible={mockedSetVisible}
            serviceData={mockEdgeServiceList.data[3]}
          />
        </Provider>, {
          route: { params, path: '/:tenantId/devices/edge/:serialNumber/details/:activeTab' }
        })

      expect(await screen.findByRole('link', { name: 'Mocked_tunnel-1' })).toBeVisible()
      expect(screen.getByRole('link', { name: 'Mocked_tunnel-3' })).toBeVisible()
      expect(screen.getByText('Tunnel Profile (Cluster-DMZ Cluster)')).toBeVisible()
      const venueItemContainer = screen.getByText('Tunneled Venues')
      // eslint-disable-next-line testing-library/no-node-access
        .closest('.ant-row.ant-form-item-row')
      expect(within(venueItemContainer as HTMLElement).getByText('1')).toBeVisible()

      const networkItemContainer = screen.getByText('Tunneled Networks to DMZ')
        // eslint-disable-next-line testing-library/no-node-access
        .closest('.ant-row.ant-form-item-row')
      expect(within(networkItemContainer as HTMLElement).getByText('1')).toBeVisible()
    })

    it('should render non-DMZ scenario detail successfully', async () => {
      mockServer.use(
        rest.post(
          EdgeSdLanUrls.getEdgeSdLanViewDataList.url,
          (_, res, ctx) => res(ctx.json({ data: [mockedMvSdLanDataList[1]] }))
        )
      )

      render(
        <Provider>
          <ServiceDetailDrawer
            visible={true}
            setVisible={mockedSetVisible}
            serviceData={mockEdgeServiceList.data[3]}
          />
        </Provider>, {
          route: { params, path: '/:tenantId/devices/edge/:serialNumber/details/:activeTab' }
        })

      expect(await screen.findByRole('link', { name: 'Mocked_tunnel-2' })).toBeVisible()
      const networkItemContainer = screen.getByText('Tunneled Venues')
        // eslint-disable-next-line testing-library/no-node-access
        .closest('.ant-row.ant-form-item-row')
      expect(within(networkItemContainer as HTMLElement).getByText('2')).toBeVisible()
    })
  })

  it('should render mDNS detail successfully', async () => {
    render(
      <Provider>
        <ServiceDetailDrawer
          visible={true}
          setVisible={mockedSetVisible}
          serviceData={mockEdgeServiceList.data[4]}
        />
      </Provider>, {
        route: { params }
      })

    expect(await screen.findByText('mDNS Settings')).toBeVisible()
    expect(await screen.findByTestId('rc-MdnsProxyForwardingRulesTable')).toBeVisible()
  })
})
