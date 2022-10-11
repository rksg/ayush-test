import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { venueApi }                                                                          from '@acx-ui/rc/services'
import { CommonUrlsInfo }                                                                    from '@acx-ui/rc/utils'
import { Provider, store }                                                                   from '@acx-ui/store'
import { fireEvent, mockServer, render, screen, within, waitFor, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import {
  venueData,
  venueCaps,
  venueLanPorts
} from '../../../../__tests__/fixtures'

import { LanPorts } from './index'

const params = {
  tenantId: 'tenant-id',
  venueId: 'venue-id',
  activeTab: 'wifi',
  activeSubTab: 'networking'
}

describe('LanPortsForm', () => {
  beforeEach(() => {
    store.dispatch(venueApi.util.resetApiState())
    mockServer.use(
      rest.get(
        CommonUrlsInfo.getVenue.url,
        (_, res, ctx) => res(ctx.json(venueData))),
      rest.get(
        CommonUrlsInfo.getVenueCapabilities.url,
        (_, res, ctx) => res(ctx.json(venueCaps))),
      rest.get(
        CommonUrlsInfo.getVenueLanPorts.url,
        (_, res, ctx) => res(ctx.json(venueLanPorts))),
      rest.get(
        CommonUrlsInfo.getVenueSettings.url,
        (_, res, ctx) => res(ctx.json({})))
    )
  })

  it('should render correctly', async () => {
    const { asFragment } = render(
      <Provider>
        {/* <VenueEditContext.Provider value={{ editContextData, setEditContextData }}> */}
        <Form>
          <LanPorts />
        </Form>
        {/* </VenueEditContext.Provider> */}
      </Provider>, {
        route: { params, path: '/:tenantId/venues/:venueId/edit/:activeTab/:activeSubTab' }
      })
    await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))
    await waitFor(() => screen.findByText('LAN Ports'))
    await waitFor(() => screen.findByText('AP Model'))
    expect(await screen.findByAltText(/default image/)).toBeVisible()
    expect(asFragment()).toMatchSnapshot()
  })

  it('should handle model changed', async () => {
    render(
      <Provider>
        <Form>
          <LanPorts />
        </Form>
      </Provider>, {
        route: { params, path: '/:tenantId/venues/:venueId/edit/:activeTab/:activeSubTab' }
      })
    await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))
    await waitFor(() => screen.findByText('AP Model'))

    fireEvent.mouseDown(await screen.findByRole('combobox'))
    const option = screen.getByText('H320')
    await userEvent.click(option)

    const tabPanel = screen.getByRole('tabpanel', { hidden: false })
    expect(within(tabPanel).getByLabelText(/Enable port/)).not.toBeChecked()
    expect(within(tabPanel).getByLabelText(/Port type/)).toBeDisabled()
    expect(within(tabPanel).getByLabelText(/VLAN untag ID/)).toBeDisabled()
    expect(within(tabPanel).getByLabelText(/VLAN member/)).toBeDisabled()

    const tabs = await screen.findAllByRole('tab')
    expect(tabs).toHaveLength(3)

    await fireEvent.click(await screen.findByRole('tab', { name: 'LAN 2' }))
    const tabPanel2 = screen.getByRole('tabpanel', { hidden: false })
    expect(within(tabPanel2).getByLabelText(/Enable port/)).toBeChecked()
    expect(within(tabPanel2).getByLabelText(/Port type/)).not.toBeDisabled()

    fireEvent.mouseDown(within(tabPanel2).getByLabelText(/Port type/))
    await userEvent.click(await screen.getAllByText('TRUNK')[1])
    expect(within(tabPanel2).getByLabelText(/VLAN untag ID/)).toHaveValue('1')
    expect(within(tabPanel2).getByLabelText(/VLAN member/)).toHaveValue('1-4094')
    expect(within(tabPanel2).getByLabelText(/VLAN member/)).toBeDisabled()

    fireEvent.mouseDown(within(tabPanel2).getByLabelText(/Port type/))
    await userEvent.click(await screen.getAllByText('GENERAL')[1])
    expect(within(tabPanel2).getByLabelText(/VLAN member/)).not.toBeDisabled()
    fireEvent.change(within(tabPanel2).getByLabelText(/VLAN member/), { target: { value: '2' } })
    expect(within(tabPanel2).getByLabelText(/VLAN member/)).toHaveValue('2')

    await fireEvent.click(await screen.findByRole('tab', { name: 'LAN 3' }))
    const tabPanel3 = screen.getByRole('tabpanel', { hidden: false })
    expect(within(tabPanel3).getByLabelText(/Enable port/)).toBeDisabled()
  })

  it('should handle model, PoE Mode and PoE Out changed', async () => {
    render(
      <Provider>
        <Form>
          <LanPorts />
        </Form>
      </Provider>, {
        route: { params, path: '/:tenantId/venues/:venueId/edit/:activeTab/:activeSubTab' }
      })
    await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))
    await waitFor(() => screen.findByText('AP Model'))

    fireEvent.mouseDown(await screen.findByRole('combobox'))
    const option = screen.getByText('T750')
    await userEvent.click(option)
    expect(await screen.findByAltText(/AP Lan port image - T750/)).toBeVisible()

    const tabPanel = screen.getByRole('tabpanel', { hidden: false })
    fireEvent.mouseDown(within(tabPanel).getByLabelText(/Port type/))
    await userEvent.click(await screen.getAllByText('ACCESS')[1])
    expect(within(tabPanel).getByLabelText(/VLAN untag ID/)).not.toBeDisabled()
  })
})