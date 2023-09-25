import { rest } from 'msw'

import {
  EdgeDhcpUrls,
  EdgeFirewallUrls,
  EdgeUrlsInfo,
  NetworkSegmentationUrls,
  PersonaUrls,
  TunnelProfileUrls
} from '@acx-ui/rc/utils'
import { Provider }           from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitForElementToBeRemoved
} from '@acx-ui/test-utils'

import {
  mockEdgeData as currentEdge,
  mockDhcpStatsData,
  mockEdgeList,
  mockFirewallData,
  mockedEdgeDhcpDataList,
  mockedEdgeServiceList,
  mockedNsgStatsList,
  mockedPersonaGroup,
  mockedTunnelProfileData
} from '../../../__tests__/fixtures'

import { ServiceDetailDrawer } from '.'

jest.mock('@acx-ui/rc/components', () => ({
  ...jest.requireActual('@acx-ui/rc/components'),
  EdgeFirewallGroupedStatsTables: () => <div data-testid='rc-EdgeFirewallGroupedStatsTables' />,
  NetworkSegmentationDetailTableGroup: () => <div data-testid='rc-NsgTableGroup' />
}))

const mockedSetVisible = jest.fn()

describe('Edge Detail Services Tab - Service Detail Drawer', () => {
  let params: { tenantId: string, serialNumber: string } =
  { tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac', serialNumber: currentEdge.serialNumber }

  beforeEach(() => {
    mockServer.use(
      rest.post(
        EdgeDhcpUrls.getDhcpStats.url,
        (req, res, ctx) => res(ctx.json(mockDhcpStatsData))
      ),
      rest.post(
        EdgeUrlsInfo.getEdgeList.url,
        (req, res, ctx) => res(ctx.json(mockEdgeList))
      ),
      rest.get(
        EdgeFirewallUrls.getEdgeFirewall.url,
        (req, res, ctx) => res(ctx.json(mockFirewallData))
      ),
      rest.post(
        NetworkSegmentationUrls.getNetworkSegmentationStatsList.url,
        (req, res, ctx) => res(ctx.json(mockedNsgStatsList))
      ),
      rest.get(
        EdgeDhcpUrls.getDhcp.url,
        (req, res, ctx) => res(ctx.json(mockedEdgeDhcpDataList.content[0]))
      ),
      rest.get(
        PersonaUrls.getPersonaGroupById.url,
        (req, res, ctx) => res(ctx.json(mockedPersonaGroup))
      ),
      rest.get(
        TunnelProfileUrls.getTunnelProfile.url,
        (req, res, ctx) => res(ctx.json(mockedTunnelProfileData))
      )
    )
  })

  it('should render basic info successfully', async () => {
    render(
      <Provider>
        <ServiceDetailDrawer
          visible={true}
          setVisible={mockedSetVisible}
          serviceData={mockedEdgeServiceList.data[0]}
        />
      </Provider>, {
        route: { params }
      })

    expect(await screen.findByText('Service Name')).toBeVisible()
    expect(await screen.findByText('DHCP-1')).toBeVisible()
    expect(await screen.findByText('Service Type')).toBeVisible()
    expect(await screen.findByText('DHCP')).toBeVisible()
  })

  it('should render DHCP detail successfully', async () => {
    render(
      <Provider>
        <ServiceDetailDrawer
          visible={true}
          setVisible={mockedSetVisible}
          serviceData={mockedEdgeServiceList.data[0]}
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
          serviceData={mockedEdgeServiceList.data[2]}
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

  it('should render nsg detail successfully', async () => {
    render(
      <Provider>
        <ServiceDetailDrawer
          visible={true}
          setVisible={mockedSetVisible}
          serviceData={mockedEdgeServiceList.data[1]}
        />
      </Provider>, {
        route: { params }
      })
    expect(await screen.findByRole('link', { name: 'NSG-1' })).toBeVisible()
    expect(await screen.findByText('Venue')).toBeVisible()
    expect(await screen.findByRole('link', { name: 'MockVenue1' })).toBeVisible()
    expect(await screen.findByText('Persona Group')).toBeVisible()
    expect(await screen.findByRole('link', { name: 'TestPersona' })).toBeVisible()
    expect(await screen.findByText('Number of Segments')).toBeVisible()
    expect(await screen.findByText('Number of devices per segment')).toBeVisible()
    expect((await screen.findAllByText('10')).length).toBe(2)
    expect(await screen.findByText('DHCP Service')).toBeVisible()
    expect(await screen.findByRole('link', { name: 'TestDhcp-1' })).toBeVisible()
    expect(await screen.findByText('Tunnel Profile')).toBeVisible()
    expect(await screen.findByRole('link', { name: /tunnelProfile1/i })).toBeVisible()
    expect(await screen.findByText('Networks')).toBeVisible()
    expect(await screen.findByText('2')).toBeVisible()
    expect(await screen.findByTestId('rc-NsgTableGroup')).toBeVisible()
  })
})