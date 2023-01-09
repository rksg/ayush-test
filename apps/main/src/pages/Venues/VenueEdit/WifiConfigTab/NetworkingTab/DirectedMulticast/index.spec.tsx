import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { venueApi }                     from '@acx-ui/rc/services'
import { CommonUrlsInfo, WifiUrlsInfo } from '@acx-ui/rc/utils'
import { Provider, store }              from '@acx-ui/store'
import { mockServer,
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved } from '@acx-ui/test-utils'

import { mockDirectedMulticast, venueData } from '../../../../__tests__/fixtures'

import { DirectedMulticast } from '.'

const params = {
  tenantId: 'tenant-id',
  venueId: 'venue-id',
  activeTab: 'wifi',
  activeSubTab: 'networking'
}

describe('Venue Directed Multicast', () => {
  beforeEach(() => {
    store.dispatch(venueApi.util.resetApiState())
    mockServer.use(
      rest.get(
        CommonUrlsInfo.getVenue.url,
        (_, res, ctx) => res(ctx.json(venueData))),
      rest.get(
        WifiUrlsInfo.getVenueDirectedMulticast.url,
        (_, res, ctx) => res(ctx.json(mockDirectedMulticast))),
      rest.get(
        CommonUrlsInfo.getVenueSettings.url,
        (_, res, ctx) => res(ctx.json({})))
    )
  })

  it('should render correctly', async () => {
    render(
      <Provider>
        <Form>
          <DirectedMulticast />
        </Form>
      </Provider>, {
        route: { params, path: '/:tenantId/venues/:venueId/edit/:activeTab/:activeSubTab' }
      })
    await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))

    await waitFor(() => screen.findByText('Multicast Traffic from:'))
    expect(await screen.findByTestId('wired-switch')).toBeVisible()
    expect(await screen.findByTestId('wireless-switch')).toBeVisible()
    expect(await screen.findByTestId('network-switch')).toBeVisible()
  })

  it('should handle turn On/Off switch buttons changed', async () => {
    render(
      <Provider>
        <Form>
          <DirectedMulticast />
        </Form>
      </Provider>, {
        route: { params, path: '/:tenantId/venues/:venueId/edit/:activeTab/:activeSubTab' }
      })
    await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))

    await waitFor(() => screen.findByText('Multicast Traffic from:'))

    expect(await screen.findByTestId('wired-switch')).toBeChecked()
    await userEvent.click(await screen.findByTestId('wired-switch'))
    expect(await screen.findByTestId('wired-switch')).not.toBeChecked()

    expect(await screen.findByTestId('wireless-switch')).toBeChecked()
    await userEvent.click(await screen.findByTestId('wireless-switch'))
    expect(await screen.findByTestId('wireless-switch')).not.toBeChecked()

    expect(await screen.findByTestId('network-switch')).toBeChecked()
    await userEvent.click(await screen.findByTestId('network-switch'))
    expect(await screen.findByTestId('network-switch')).not.toBeChecked()
  })
})