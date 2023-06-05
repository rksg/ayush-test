/* eslint-disable max-len */
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { EdgeDhcpUrls, EdgeUrlsInfo } from '@acx-ui/rc/utils'
import { Provider  }                  from '@acx-ui/store'
import {
  render,
  screen,
  mockServer,
  within
} from '@acx-ui/test-utils'

import { mockEdgeData as currentEdge, mockDhcpStatsData, mockedEdgeServiceList } from '../../__tests__/fixtures'

import { EdgeServices } from '.'


describe('Edge Detail Services Tab', () => {
  let params: { tenantId: string, serialNumber: string } =
  { tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac', serialNumber: currentEdge.serialNumber }

  beforeEach(() => {
    mockServer.use(
      rest.post(
        EdgeUrlsInfo.getEdgeServiceList.url,
        (req, res, ctx) => res(ctx.json(mockedEdgeServiceList))
      ),
      rest.post(
        EdgeDhcpUrls.getDhcpStats.url,
        (req, res, ctx) => res(ctx.json(mockDhcpStatsData))
      )
    )
  })

  it('should render services tab correctly', async () => {
    render(
      <Provider>
        <EdgeServices />
      </Provider>, {
        route: { params }
      })

    expect(await screen.findByRole('row', { name: /DHCP-1/i })).toBeVisible()
    expect(await screen.findByRole('row', { name: /NSG-1/i })).toBeVisible()
  })

  it('should render service detail drawer when click service name', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <EdgeServices />
      </Provider>, {
        route: { params }
      })

    const row = await screen.findByRole('row', { name: /DHCP-1/i })
    const dhcpName = within(row).getByRole('button', { name: 'DHCP-1' })
    await user.click(dhcpName)
    expect(await screen.findByRole('dialog')).toBeVisible()
  })
})