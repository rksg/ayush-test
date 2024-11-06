/* eslint-disable max-len */
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { Features, useIsSplitOn }                                                        from '@acx-ui/feature-toggle'
import { edgeApi }                                                                       from '@acx-ui/rc/services'
import { EdgeDHCPFixtures, EdgeDhcpUrls, EdgeGeneralFixtures, EdgeStatus, EdgeUrlsInfo } from '@acx-ui/rc/utils'
import { Provider, store }                                                               from '@acx-ui/store'
import {
  fireEvent,
  mockServer,
  render,
  screen,
  waitFor,
  within
} from '@acx-ui/test-utils'

import { EdgeDetailsDataContext } from '../EdgeDetailsDataProvider'

import { EdgeServices } from '.'

jest.mock('./ServiceDetailDrawer/SdLanDetailsP2', () => ({
  ...jest.requireActual('./ServiceDetailDrawer/SdLanDetailsP2'),
  SdLanDetailsP2: () => <div data-testid='rc-SdLanDetailsP2'/>
}))

const { mockEdgeData: currentEdge, mockEdgeServiceList, mockEdgeList } = EdgeGeneralFixtures
const { mockDhcpStatsData } = EdgeDHCPFixtures

describe('Edge Detail Services Tab', () => {
  let params: { tenantId: string, serialNumber: string } =
    { tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac', serialNumber: currentEdge.serialNumber }

  beforeEach(() => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    store.dispatch(edgeApi.util.resetApiState())

    mockServer.use(
      rest.post(
        EdgeUrlsInfo.getEdgeServiceList.url,
        (_req, res, ctx) => res(ctx.json(mockEdgeServiceList))
      ),
      rest.post(
        EdgeDhcpUrls.getDhcpStats.url,
        (_req, res, ctx) => res(ctx.json(mockDhcpStatsData))
      ),
      rest.delete(
        EdgeUrlsInfo.deleteService.url,
        (_req, res, ctx) => res(ctx.status(202))
      )
    )
  })

  it('should render services tab correctly', async () => {
    render(
      <Provider>
        <EdgeDetailsDataContext.Provider
          value={{
            currentEdgeStatus: mockEdgeList.data[0] as EdgeStatus,
            isEdgeStatusLoading: false
          }}
        >
          <EdgeServices />
        </EdgeDetailsDataContext.Provider>
      </Provider>, {
        route: { params }
      })

    const rows = await screen.findAllByRole('row')
    expect(within(rows[1]).getByRole('cell', { name: /DHCP-1/i })).toBeVisible()
    expect(within(rows[2]).getByRole('cell', { name: /NSG-1/i })).toBeVisible()
    expect(within(rows[5]).getByRole('cell', { name: /Mock mDNS/i })).toBeVisible()
  })

  it('should render service detail drawer when click service name', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <EdgeDetailsDataContext.Provider
          value={{
            currentEdgeStatus: mockEdgeList.data[0] as EdgeStatus,
            isEdgeStatusLoading: false
          }}
        >
          <EdgeServices />
        </EdgeDetailsDataContext.Provider>
      </Provider>, {
        route: { params }
      })

    const row = await screen.findByRole('row', { name: /DHCP-1/i })
    const dhcpName = within(row).getByRole('button', { name: 'DHCP-1' })
    await user.click(dhcpName)
    expect(await screen.findByRole('dialog')).toBeVisible()
  })

  it('when HA OFF and click DHCP service, should not render DHCP service detail drawer', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff !== Features.EDGE_HA_TOGGLE)

    const user = userEvent.setup()
    render(
      <Provider>
        <EdgeDetailsDataContext.Provider
          value={{
            currentEdgeStatus: mockEdgeList.data[0] as EdgeStatus,
            isEdgeStatusLoading: false
          }}
        >
          <EdgeServices />
        </EdgeDetailsDataContext.Provider>
      </Provider>, {
        route: { params }
      })

    const row = await screen.findByRole('row', { name: /DHCP-1/i })
    const dhcpName = within(row).getByRole('button', { name: 'DHCP-1' })
    await user.click(dhcpName)
    expect(screen.queryByText('Service Details')).toBeNull()
  })

  it('should delete selected row', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <EdgeDetailsDataContext.Provider
          value={{
            currentEdgeStatus: mockEdgeList.data[0] as EdgeStatus,
            isEdgeStatusLoading: false
          }}
        >
          <EdgeServices />
        </EdgeDetailsDataContext.Provider>
      </Provider>, {
        route: { params }
      })
    const row = await screen.findByRole('row', { name: /FIREWALL-1/i })
    await user.click(within(row).getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: 'Remove' }))
    const removeDialog = await screen.findByRole('dialog')
    within(removeDialog).getByText('Remove "FIREWALL-1"?')
    await user.click(within(removeDialog).getByRole('button', { name: 'Remove' }))
    await waitFor(() => { expect(removeDialog).not.toBeVisible() })
  })

  it('should delete selected rows', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <EdgeDetailsDataContext.Provider
          value={{
            currentEdgeStatus: mockEdgeList.data[0] as EdgeStatus,
            isEdgeStatusLoading: false
          }}
        >
          <EdgeServices />
        </EdgeDetailsDataContext.Provider>
      </Provider>, {
        route: { params }
      })
    const rows = await screen.findAllByRole('row')
    expect(within(rows[1]).getByRole('cell', { name: /DHCP-1/i })).toBeVisible()
    await user.click(within(rows[1]).getByRole('checkbox')) //DHCP-1
    expect(within(rows[2]).getByRole('cell', { name: /NSG-1/i })).toBeVisible()
    await user.click(within(rows[2]).getByRole('checkbox')) //NSG-1
    await user.click(screen.getByRole('button', { name: 'Remove' }))
    const removeDialog = await screen.findByRole('dialog')
    within(removeDialog).getByText('Remove "2 Services"?')
    await user.click(within(removeDialog).getByRole('button', { name: 'Remove' }))
    await waitFor(() => { expect(removeDialog).not.toBeVisible() })
  })

  it('should show "NA" in [Service Version] field correctly', async () => {
    render(
      <Provider>
        <EdgeDetailsDataContext.Provider
          value={{
            currentEdgeStatus: mockEdgeList.data[0] as EdgeStatus,
            isEdgeStatusLoading: false
          }}
        >
          <EdgeServices />
        </EdgeDetailsDataContext.Provider>
      </Provider>, {
        route: { params }
      })
    const row1 = await screen.findByRole('row', { name: /DHCP-1/i })
    expect(await within(row1).findByText('NA')).toBeValid()
  })

  it('should disable remove button and show tooltip', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <EdgeDetailsDataContext.Provider
          value={{
            currentEdgeStatus: mockEdgeList.data[0] as EdgeStatus,
            isEdgeStatusLoading: false
          }}
        >
          <EdgeServices />
        </EdgeDetailsDataContext.Provider>
      </Provider>, {
        route: { params }
      })

    const rows = await screen.findAllByRole('row')
    expect(within(rows[1]).getByRole('cell', { name: /DHCP-1/i })).toBeVisible()
    await user.click(within(rows[1]).getByRole('checkbox'))

    const removeBtn = await screen.findByRole('button', { name: 'Remove' })
    expect(removeBtn).toBeDisabled()

    fireEvent.mouseOver(removeBtn)
    expect(await screen.findByRole('tooltip'))
      .toHaveTextContent('DHCP cannot be removed')
  })

  it('should disable restart button and show tooltip', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <EdgeDetailsDataContext.Provider
          value={{
            currentEdgeStatus: mockEdgeList.data[0] as EdgeStatus,
            isEdgeStatusLoading: false
          }}
        >
          <EdgeServices />
        </EdgeDetailsDataContext.Provider>
      </Provider>, {
        route: { params }
      })

    const rows = await screen.findAllByRole('row')
    expect(within(rows[2]).getByRole('cell', { name: /NSG-1/i })).toBeVisible()
    await user.click(within(rows[2]).getByRole('checkbox'))

    const restartBtn = await screen.findByRole('button', { name: 'Restart' })
    expect(restartBtn).toBeDisabled()

    fireEvent.mouseOver(restartBtn)
    expect(await screen.findByRole('tooltip'))
      .toHaveTextContent('Only DHCP can be restarted')
  })

  it('when DHCP_HA OFF, should disable restart button', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff !== Features.EDGE_DHCP_HA_TOGGLE)
    const user = userEvent.setup()
    render(
      <Provider>
        <EdgeDetailsDataContext.Provider
          value={{
            currentEdgeStatus: mockEdgeList.data[0] as EdgeStatus,
            isEdgeStatusLoading: false
          }}
        >
          <EdgeServices />
        </EdgeDetailsDataContext.Provider>
      </Provider>, {
        route: { params }
      })

    const rows = await screen.findAllByRole('row')
    expect(within(rows[2]).getByRole('cell', { name: /NSG-1/i })).toBeVisible()
    await user.click(within(rows[2]).getByRole('checkbox'))

    const restartBtn = await screen.findByRole('button', { name: 'Restart' })
    expect(restartBtn).toBeDisabled()
  })

  it('should enable the restart button when DHCP checked only, but disable when also others checked', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <EdgeDetailsDataContext.Provider
          value={{
            currentEdgeStatus: mockEdgeList.data[0] as EdgeStatus,
            isEdgeStatusLoading: false
          }}
        >
          <EdgeServices />
        </EdgeDetailsDataContext.Provider>
      </Provider>, {
        route: { params }
      })

    const rows = await screen.findAllByRole('row')
    expect(within(rows[1]).getByRole('cell', { name: /DHCP-1/i })).toBeVisible()
    await user.click(within(rows[1]).getByRole('checkbox')) //DHCP-1

    let restartBtn = await screen.findByRole('button', { name: 'Restart' })
    expect(restartBtn).toBeEnabled()

    expect(within(rows[2]).getByRole('cell', { name: /NSG-1/i })).toBeVisible()
    await user.click(within(rows[3]).getByRole('checkbox')) //NSG-1

    restartBtn = await screen.findByRole('button', { name: 'Restart' })
    expect(restartBtn).toBeDisabled()

    fireEvent.mouseOver(restartBtn)
    expect(await screen.findByRole('tooltip'))
      .toHaveTextContent('Only DHCP can be restarted')

  })

})
