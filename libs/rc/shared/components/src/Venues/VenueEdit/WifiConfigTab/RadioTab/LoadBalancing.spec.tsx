import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { useIsSplitOn, useIsTierAllowed } from '@acx-ui/feature-toggle'
import { venueApi }                       from '@acx-ui/rc/services'
import { WifiUrlsInfo }                   from '@acx-ui/rc/utils'
import { Provider, store }                from '@acx-ui/store'
import { mockServer,
  render,
  screen,
  waitForElementToBeRemoved } from '@acx-ui/test-utils'

import { VenueEditContext }  from '../..'
import { mockLoadBalabcing } from '../../../__tests__/fixtures'

import { LoadBalancing } from './LoadBalancing'

const params = {
  tenantId: 'tenant-id',
  venueId: 'venue-id',
  activeTab: 'wifi',
  activeSubTab: 'radio'
}

describe('Venue Load Balancing', () => {
  beforeEach(() => {
    store.dispatch(venueApi.util.resetApiState())
    mockServer.use(
      rest.get(
        WifiUrlsInfo.getVenueLoadBalancing.url,
        (_, res, ctx) => res(ctx.json(mockLoadBalabcing)))
    )
  })

  it('should render correctly', async () => {
    jest.mocked(useIsTierAllowed).mockReturnValue(true)
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    render(
      <Provider>
        <Form>
          <LoadBalancing />
        </Form>
      </Provider>, {
        route: { params, path: '/:tenantId/venues/:venueId/edit/:activeTab/:activeSubTab' }
      })
    await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))

    expect(await screen.findByTestId('load-balancing-enabled')).toBeVisible()
    expect(await screen.findByRole('radio', { name: /Based on Client Count/i })).toBeVisible()

    expect(await screen.findByTestId('sticky-client-snr-threshold')).toBeVisible()
    expect(await screen.findByTestId('sticky-client-nbr-percentage-threshold')).toBeVisible()

    expect(await screen.findByTestId('band-balancing-enabled')).toBeVisible()
    expect(await screen.findByRole('slider')).toBeVisible()

    expect(await screen.findByRole('radio', { name: /Strict/i })).toBeVisible()
  })


  it('should handle turn On/Off switch buttons changed', async () => {
    render(
      <Provider>
        <VenueEditContext.Provider value={{
          editContextData: {},
          setEditContextData: jest.fn(),
          setEditRadioContextData: jest.fn()
        }}>
          <Form>
            <LoadBalancing />
          </Form>
        </VenueEditContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/venues/:venueId/edit/:activeTab/:activeSubTab' }
      })
    await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))

    expect(await screen.findByRole('radio', { name: /Based on Client Count/i })).toBeVisible()
    // turn off load balancing switch button
    await userEvent.click((await screen.findByTestId('load-balancing-enabled')))
    expect(screen.queryByRole('radio', { name: /Based on Client Count/i })).toBeNull()

    // turn off band load balancing switch button
    expect(await screen.findByRole('slider')).toBeVisible()
    await userEvent.click((await screen.findByTestId('band-balancing-enabled')))
    expect(screen.queryByRole('slider')).toBeNull()
  })

  it('should handle the load balancing / Steering mode changed', async () => {
    render(
      <Provider>
        <VenueEditContext.Provider value={{
          editContextData: {},
          setEditContextData: jest.fn(),
          setEditRadioContextData: jest.fn()
        }}>
          <Form>
            <LoadBalancing />
          </Form>
        </VenueEditContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/venues/:venueId/edit/:activeTab/:activeSubTab' }
      })
    await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))

    expect(await screen.findByRole('radio', { name: /Based on Client Count/i })).toBeChecked()
    expect(await screen.findByRole('radio', { name: /Based on Capacity/i })).toBeVisible()

    expect(await screen.findByTestId('band-balancing-enabled')).toBeVisible()
    expect(await screen.findByRole('slider')).toBeVisible()

    // change load balancing mode
    await userEvent.click((await screen.findByRole('radio', { name: /Based on Capacity/i })))

    expect(screen.queryByTestId('band-balancing-enabled')).toBeNull()
    expect(screen.queryByRole('slider')).toBeNull()

    await userEvent.click((await screen.findByRole('radio', { name: /Strict/i })))

  })

})
