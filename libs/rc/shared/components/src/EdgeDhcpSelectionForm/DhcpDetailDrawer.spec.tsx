import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { EdgeDHCPFixtures, EdgeDhcpUrls }     from '@acx-ui/rc/utils'
import { Provider }                           from '@acx-ui/store'
import { mockServer, render, screen, within } from '@acx-ui/test-utils'

import { DhcpDetailDrawer } from './DhcpDetailDrawer'

const { mockDhcpStatsData, mockEdgeDhcpDataList } = EdgeDHCPFixtures

describe('DhcpDetailDrawer', () => {

  beforeEach(() => {
    mockServer.use(
      rest.post(
        EdgeDhcpUrls.getDhcpStats.url,
        (_, res, ctx) => res(ctx.json(mockDhcpStatsData))
      ),
      rest.get(
        EdgeDhcpUrls.getDhcp.url,
        (_, res, ctx) => res(ctx.json(mockEdgeDhcpDataList.content[0]))
      )
    )
  })

  it('should show DhcpDetailDrawer successfully', async () => {
    render(
      <Provider>
        <DhcpDetailDrawer dhcpId='test-id' />
      </Provider>
    )

    await userEvent.click(screen.getByRole('button', { name: 'DHCP Details' }))
    const drawer = await screen.findByRole('dialog')
    expect(await within(drawer).findByText('DHCP Details : TestDhcp-1')).toBeVisible()
    expect(await within(drawer).findByText('DHCP Relay')).toBeVisible()
    expect(within(drawer).getByText('On')).toBeVisible()
    expect(within(drawer).getByText('Domain Name')).toBeVisible()
    expect(within(drawer).getByText('test.com.cc')).toBeVisible()
    expect(within(drawer).getByText('Primary DNS Server')).toBeVisible()
    expect(within(drawer).getAllByText('1.1.1.1').length).toBe(2)
    expect(within(drawer).getByText('Secondary DNS Server')).toBeVisible()
    expect(within(drawer).getByText('2.2.2.2')).toBeVisible()
    expect(within(drawer).getByText('Lease Time')).toBeVisible()
    expect(within(drawer).getByText('24 hours')).toBeVisible()
    // eslint-disable-next-line max-len
    expect(within(drawer).getByRole('row', { name: 'PoolTest1 255.255.255.0 1.1.1.1 - 1.1.1.10 1.1.1.1' })).toBeVisible()
    await userEvent.click(within(drawer).getByLabelText('Close'))
    // eslint-disable-next-line testing-library/no-node-access
    expect(screen.getAllByRole('dialog')[0].parentNode)
      .toHaveClass('ant-drawer-content-wrapper-hidden')
  })
})