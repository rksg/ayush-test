import { rest } from 'msw'

import { EdgeDhcpUrls, EdgeFirewallUrls, EdgeUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                                     from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitForElementToBeRemoved
} from '@acx-ui/test-utils'

import {
  mockEdgeData as currentEdge,
  mockEdgeList,
  mockDhcpStatsData,
  mockedEdgeServiceList,
  mockFirewallData } from '../../../__tests__/fixtures'

import { ServiceDetailDrawer } from '.'

jest.mock('@acx-ui/rc/components', () => ({
  ...jest.requireActual('@acx-ui/rc/components'),
  EdgeFirewallGroupedStatsTables: () => <div data-testid='rc-EdgeFirewallGroupedStatsTables' />
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

    expect(await screen.findByText('Nsg Details')).toBeVisible()
  })
})