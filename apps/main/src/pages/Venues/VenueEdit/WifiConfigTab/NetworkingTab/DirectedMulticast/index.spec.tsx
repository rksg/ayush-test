import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { venueApi }                    from '@acx-ui/rc/services'
import { getUrlForTest, WifiUrlsInfo } from '@acx-ui/rc/utils'
import { Provider, store }             from '@acx-ui/store'
import { mockServer,
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved } from '@acx-ui/test-utils'

import { VenueEditContext }      from '../../..'
import { mockDirectedMulticast } from '../../../../__tests__/fixtures'

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
        getUrlForTest(WifiUrlsInfo.getVenueDirectedMulticast),
        (_, res, ctx) => res(ctx.json(mockDirectedMulticast)))
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
        <VenueEditContext.Provider value={{
          editContextData: {},
          setEditContextData: jest.fn(),
          setEditNetworkingContextData: jest.fn()
        }}>
          <Form>
            <DirectedMulticast />
          </Form>
        </VenueEditContext.Provider>
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
