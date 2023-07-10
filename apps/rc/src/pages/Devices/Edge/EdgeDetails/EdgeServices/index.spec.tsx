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
      ),
      rest.delete(
        EdgeUrlsInfo.deleteService.url,
        (req, res, ctx) => res(ctx.status(202))
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

  it('should delete selected row', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <EdgeServices />
      </Provider>, {
        route: { params }
      })
    const row = await screen.findByRole('row', { name: /DHCP-1/i })
    await user.click(within(row).getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: 'Remove' }))
    const removeDialog = await screen.findByRole('dialog')
    within(removeDialog).getByText('Remove "DHCP-1"?')
    await user.click(within(removeDialog).getByRole('button', { name: 'Remove' }))
  })

  it('should delete selected rows', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <EdgeServices />
      </Provider>, {
        route: { params }
      })
    const row1 = await screen.findByRole('row', { name: /DHCP-1/i })
    await user.click(within(row1).getByRole('checkbox'))
    const row2 = await screen.findByRole('row', { name: /NSG-1/i })
    await user.click(within(row2).getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: 'Remove' }))
    const removeDialog = await screen.findByRole('dialog')
    within(removeDialog).getByText('Remove "2 Services"?')
    await user.click(within(removeDialog).getByRole('button', { name: 'Remove' }))
  })

  it('should show "NA" in [Service Version] field correctly', async () => {
    render(
      <Provider>
        <EdgeServices />
      </Provider>, {
        route: { params }
      })
    const row1 = await screen.findByRole('row', { name: /DHCP-1/i })
    expect(await within(row1).findByText('NA')).toBeValid()
  })
})