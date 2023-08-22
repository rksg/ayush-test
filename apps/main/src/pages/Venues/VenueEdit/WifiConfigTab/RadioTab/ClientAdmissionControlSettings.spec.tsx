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

import { VenueEditContext }                from '../..'
import { mockVenueClientAdmissionControl } from '../../../__tests__/fixtures'

import { ClientAdmissionControlSettings } from './ClientAdmissionControlSettings'


const params = {
  tenantId: 'tenant-id',
  venueId: 'venue-id',
  activeTab: 'wifi',
  activeSubTab: 'radio'
}

describe('Venue Client Admission Control', () => {
  beforeEach(() => {
    jest.mocked(useIsTierAllowed).mockReturnValue(true)
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    store.dispatch(venueApi.util.resetApiState())
    mockServer.use(
      rest.get(
        WifiUrlsInfo.getVenueClientAdmissionControl.url,
        (_, res, ctx) => res(ctx.json(mockVenueClientAdmissionControl)))
    )
  })

  it('should render correctly', async () => {
    render(
      <Provider>
        <VenueEditContext.Provider value={{
          editContextData: {},
          setEditContextData: jest.fn(),
          setEditRadioContextData: jest.fn()
        }}>
          <Form>
            <ClientAdmissionControlSettings />
          </Form>
        </VenueEditContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/venues/:venueId/edit/:activeTab/:activeSubTab' }
      })
    await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))
    const enable24gBtn = await screen.findByTestId('client-admission-control-enable-24g')
    const enable50gBtn = await screen.findByTestId('client-admission-control-enable-50g')
    expect(enable24gBtn).toBeVisible()
    expect(enable50gBtn).toBeVisible()
    expect(await screen.findByTestId('client-admission-control-min-client-count-24g')).toBeVisible()
    expect(await screen.findByTestId('client-admission-control-max-client-load-24g')).toBeVisible()
    expect(await screen.findByTestId('client-admission-control-min-client-throughput-24g'))
      .toBeVisible()
    expect(screen.queryByTestId('client-admission-control-min-client-count-50g'))
      .not.toBeInTheDocument()
    expect(screen.queryByTestId('client-admission-control-max-client-load-50g'))
      .not.toBeInTheDocument()
    expect(screen.queryByTestId('client-admission-control-min-client-throughput-50g'))
      .not.toBeInTheDocument()
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
            <ClientAdmissionControlSettings />
          </Form>
        </VenueEditContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/venues/:venueId/edit/:activeTab/:activeSubTab' }
      })
    await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))
    const enable24gBtn = await screen.findByTestId('client-admission-control-enable-24g')
    const enable50gBtn = await screen.findByTestId('client-admission-control-enable-50g')

    await userEvent.click(enable24gBtn)
    await userEvent.click(enable50gBtn)
    expect(enable24gBtn).toHaveAttribute('aria-checked', 'false')
    expect(enable50gBtn).toHaveAttribute('aria-checked', 'true')

    expect(screen.queryByTestId('client-admission-control-min-client-count-24g'))
      .not.toBeInTheDocument()
    expect(screen.queryByTestId('client-admission-control-max-client-load-24g'))
      .not.toBeInTheDocument()
    expect(screen.queryByTestId('client-admission-control-min-client-throughput-24g'))
      .not.toBeInTheDocument()
    expect(await screen.findByTestId('client-admission-control-min-client-count-50g')).toBeVisible()
    expect(await screen.findByTestId('client-admission-control-max-client-load-50g')).toBeVisible()
    expect(await screen.findByTestId('client-admission-control-min-client-throughput-50g'))
      .toBeVisible()
  })

  it(`should turned off and grayed out switch buttons when 
    load balancing is enabled`, async () => {
    render(
      <Provider>
        <VenueEditContext.Provider value={{
          editContextData: {},
          editRadioContextData: {
            isLoadBalancingEnabled: true
          },
          setEditContextData: jest.fn(),
          setEditRadioContextData: jest.fn()
        }}>
          <Form>
            <ClientAdmissionControlSettings />
          </Form>
        </VenueEditContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/venues/:venueId/edit/:activeTab/:activeSubTab' }
      })
    await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))
    const enable24gBtn = await screen.findByTestId('client-admission-control-enable-24g')
    const enable50gBtn = await screen.findByTestId('client-admission-control-enable-50g')

    expect(enable24gBtn).toHaveAttribute('aria-checked', 'false')
    expect(enable24gBtn).toHaveClass('ant-switch-disabled')
    expect(enable50gBtn).toHaveAttribute('aria-checked', 'false')
    expect(enable50gBtn).toHaveClass('ant-switch-disabled')

    expect(screen.queryByTestId('client-admission-control-min-client-count-24g'))
      .not.toBeInTheDocument()
    expect(screen.queryByTestId('client-admission-control-max-client-load-24g'))
      .not.toBeInTheDocument()
    expect(screen.queryByTestId('client-admission-control-min-client-throughput-24g'))
      .not.toBeInTheDocument()
    expect(screen.queryByTestId('client-admission-control-min-client-count-50g'))
      .not.toBeInTheDocument()
    expect(screen.queryByTestId('client-admission-control-max-client-load-50g'))
      .not.toBeInTheDocument()
    expect(screen.queryByTestId('client-admission-control-min-client-throughput-50g'))
      .not.toBeInTheDocument()
  })

  it(`should turned off and grayed out switch buttons when 
  band balancing is enabled`, async () => {
    render(
      <Provider>
        <VenueEditContext.Provider value={{
          editContextData: {},
          editRadioContextData: {
            isBandBalancingEnabled: true
          },
          setEditContextData: jest.fn(),
          setEditRadioContextData: jest.fn()
        }}>
          <Form>
            <ClientAdmissionControlSettings />
          </Form>
        </VenueEditContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/venues/:venueId/edit/:activeTab/:activeSubTab' }
      })
    await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))
    const enable24gBtn = await screen.findByTestId('client-admission-control-enable-24g')
    const enable50gBtn = await screen.findByTestId('client-admission-control-enable-50g')

    expect(enable24gBtn).toHaveAttribute('aria-checked', 'false')
    expect(enable24gBtn).toHaveClass('ant-switch-disabled')
    expect(enable50gBtn).toHaveAttribute('aria-checked', 'false')
    expect(enable50gBtn).toHaveClass('ant-switch-disabled')

    expect(screen.queryByTestId('client-admission-control-min-client-count-24g'))
      .not.toBeInTheDocument()
    expect(screen.queryByTestId('client-admission-control-max-client-load-24g'))
      .not.toBeInTheDocument()
    expect(screen.queryByTestId('client-admission-control-min-client-throughput-24g'))
      .not.toBeInTheDocument()
    expect(screen.queryByTestId('client-admission-control-min-client-count-50g'))
      .not.toBeInTheDocument()
    expect(screen.queryByTestId('client-admission-control-max-client-load-50g'))
      .not.toBeInTheDocument()
    expect(screen.queryByTestId('client-admission-control-min-client-throughput-50g'))
      .not.toBeInTheDocument()
  })
})
