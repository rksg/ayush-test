import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { useIsSplitOn }                 from '@acx-ui/feature-toggle'
import { apApi, venueApi }              from '@acx-ui/rc/services'
import { CommonUrlsInfo, WifiUrlsInfo } from '@acx-ui/rc/utils'
import { Provider, store }              from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved } from '@acx-ui/test-utils'

import { ApEditContext }     from '../..'
import { venueData, r760Ap } from '../../../../__tests__/fixtures'

import { DirectedMulticast } from '.'

const params = {
  tenantId: 'tenant-id',
  serialNumber: 'serial-number',
  venueId: 'venue-id'
}

const mockVenueDirectedMulticast = {
  wiredEnabled: true,
  wirelessEnabled: true,
  networkEnabled: true
}

const mockApDirectedMulticast = {
  useVenueSettings: true,
  wiredEnabled: true,
  wirelessEnabled: true,
  networkEnabled: true
}

describe('AP Directed Multicast', () => {
  beforeEach(() => {
    store.dispatch(venueApi.util.resetApiState())
    store.dispatch(apApi.util.resetApiState())
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    mockServer.use(
      rest.get(
        WifiUrlsInfo.getAp.url,
        (_, res, ctx) => res(ctx.json(r760Ap))),
      rest.get(
        CommonUrlsInfo.getVenue.url,
        (_, res, ctx) => res(ctx.json(venueData))),
      rest.get(
        WifiUrlsInfo.getVenueDirectedMulticast.url,
        (_, res, ctx) => res(ctx.json(mockVenueDirectedMulticast))),
      rest.get(
        WifiUrlsInfo.getApDirectedMulticast.url,
        (_, res, ctx) => res(ctx.json(mockApDirectedMulticast)))
    )
  })

  it('should render correctly', async () => {
    render(
      <Provider>
        <DirectedMulticast />
      </Provider>, {
        route: { params, path: '/:tenantId/devices/wifi/:serialNumber/edit/settings/multicast' }
      })

    await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))
    await waitFor(() => screen.findByText('Multicast Traffic from:'))

    expect(await screen.findByRole('button', { name: /Customize/ })).toBeVisible()
    expect(await screen.findByTestId('wired-switch')).toBeVisible()
    expect(await screen.findByTestId('wireless-switch')).toBeVisible()
    expect(await screen.findByTestId('network-switch')).toBeVisible()
  })

  it('should handle click Customize/Use Venue settings link', async () => {
    render(
      <Provider>
        <ApEditContext.Provider value={{
          editContextData: {
            tabTitle: '',
            isDirty: false,
            hasError: false,
            updateChanges: jest.fn(),
            discardChanges: jest.fn()
          },
          setEditContextData: jest.fn()
        }}>
          <DirectedMulticast />
        </ApEditContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/devices/wifi/:serialNumber/edit/settings/multicast' }
      })

    await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))
    await waitFor(() => screen.findByText('Multicast Traffic from:'))

    expect(await screen.findByRole('button', { name: /Customize/ })).toBeVisible()
    expect(await screen.findByTestId('wired-switch')).toBeDisabled()
    expect(await screen.findByTestId('wireless-switch')).toBeDisabled()
    expect(await screen.findByTestId('network-switch')).toBeDisabled()

    await userEvent.click(await screen.findByRole('button', { name: /Customize/ }))

    expect(await screen.findByRole('button', { name: /Use Venue Settings/ })).toBeVisible()
    expect(await screen.findByTestId('wired-switch')).not.toBeDisabled()
    expect(await screen.findByTestId('wireless-switch')).not.toBeDisabled()
    expect(await screen.findByTestId('network-switch')).not.toBeDisabled()


    await userEvent.click(await screen.findByRole('button', { name: /Use Venue Settings/ }))

    expect(await screen.findByTestId('wired-switch')).toBeDisabled()
    expect(await screen.findByTestId('wireless-switch')).toBeDisabled()
    expect(await screen.findByTestId('network-switch')).toBeDisabled()

    await userEvent.click(await screen.findByRole('button', { name: /Apply Directed Multicast/ }))
  })

  it('should handle turn On/Off switch buttons changed', async () => {
    render(
      <Provider>
        <ApEditContext.Provider value={{
          editContextData: {
            tabTitle: '',
            isDirty: false,
            hasError: false,
            updateChanges: jest.fn(),
            discardChanges: jest.fn()
          },
          setEditContextData: jest.fn()
        }}>
          <DirectedMulticast />
        </ApEditContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/devices/wifi/:serialNumber/edit/settings/multicast' }
      })
    await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))

    await userEvent.click(await screen.findByRole('button', { name: /Customize/ }))

    expect(await screen.findByTestId('wired-switch')).toBeChecked()
    await userEvent.click(await screen.findByTestId('wired-switch'))
    expect(await screen.findByTestId('wired-switch')).not.toBeChecked()

    expect(await screen.findByTestId('wireless-switch')).toBeChecked()
    await userEvent.click(await screen.findByTestId('wireless-switch'))
    expect(await screen.findByTestId('wireless-switch')).not.toBeChecked()

    expect(await screen.findByTestId('network-switch')).toBeChecked()
    await userEvent.click(await screen.findByTestId('network-switch'))
    expect(await screen.findByTestId('network-switch')).not.toBeChecked()

    await userEvent.click(await screen.findByRole('button', { name: /Apply Directed Multicast/ }))
  })

  it('should handle turn On/Off switch buttons changed with use venue settings', async () => {
    render(
      <Provider>
        <DirectedMulticast />
      </Provider>, {
        route: { params, path: '/:tenantId/devices/wifi/:serialNumber/edit/settings/multicast' }
      })
    await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))

    await userEvent.click(await screen.findByRole('button', { name: /Customize/ }))

    expect(await screen.findByTestId('wired-switch')).toBeChecked()
    await userEvent.click(await screen.findByTestId('wired-switch'))
    expect(await screen.findByTestId('wired-switch')).not.toBeChecked()

    expect(await screen.findByTestId('wireless-switch')).toBeChecked()
    await userEvent.click(await screen.findByTestId('wireless-switch'))
    expect(await screen.findByTestId('wireless-switch')).not.toBeChecked()

    expect(await screen.findByTestId('network-switch')).toBeChecked()
    await userEvent.click(await screen.findByTestId('network-switch'))
    expect(await screen.findByTestId('network-switch')).not.toBeChecked()

    await userEvent.click(await screen.findByRole('button', { name: /Use Venue Settings/ }))
    expect(await screen.findByTestId('wired-switch')).toBeChecked()
    expect(await screen.findByTestId('wireless-switch')).toBeChecked()
    expect(await screen.findByTestId('network-switch')).toBeChecked()

    await userEvent.click(await screen.findByRole('button', { name: /Customize/ }))
    expect(await screen.findByTestId('wired-switch')).not.toBeChecked()
    expect(await screen.findByTestId('wireless-switch')).not.toBeChecked()
    expect(await screen.findByTestId('network-switch')).not.toBeChecked()

    await userEvent.click(await screen.findByRole('button', { name: /Cancel/ }))
  })

})
