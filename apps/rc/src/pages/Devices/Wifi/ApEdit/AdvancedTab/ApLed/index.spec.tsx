import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { apApi, venueApi }                                                from '@acx-ui/rc/services'
import { CommonUrlsInfo, WifiUrlsInfo, getUrlForTest }                    from '@acx-ui/rc/utils'
import { Provider, store }                                                from '@acx-ui/store'
import { mockServer, render, screen, waitFor, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import { ApDataContext, ApEditContext } from '../..'
import { r760Ap, venueData }            from '../../../../__tests__/fixtures'

import { ApLed } from '.'


const params = {
  tenantId: 'tenant-id',
  serialNumber: 'serial-number',
  venueId: 'venue-id'
}

const mockVenueLed = [{
  ledEnabled: true,
  model: 'R760'
}]

const mockApLedSettings = {
  ledEnabled: true,
  useVenueSettings: true
}

const resetApLedSpy = jest.fn()

describe('AP Led', () => {
  beforeEach(() => {
    store.dispatch(venueApi.util.resetApiState())
    store.dispatch(apApi.util.resetApiState())

    resetApLedSpy.mockClear()
    mockServer.use(
      rest.get(
        getUrlForTest(CommonUrlsInfo.getVenue),
        (_, res, ctx) => res(ctx.json(venueData))),
      rest.get(
        getUrlForTest(CommonUrlsInfo.getVenueLedOn),
        (_, res, ctx) => res(ctx.json(mockVenueLed))),
      rest.get(
        getUrlForTest(WifiUrlsInfo.getApLed),
        (_, res, ctx) => res(ctx.json(mockApLedSettings))),
      rest.delete(WifiUrlsInfo.resetApLed.url,
        (_, res, ctx)=>{
          resetApLedSpy()
          return res(ctx.json({ requestId: '123' }))
        }),
      rest.delete(WifiUrlsInfo.updateApLed.url,
        (_, res, ctx)=> res(ctx.json({ requestId: '123' })))
    )
  })

  it('should render correctly', async () => {
    render(
      <Provider>
        <ApDataContext.Provider value={{ apData: r760Ap }}>
          <ApLed />
        </ApDataContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/devices/wifi/:serialNumber/edit/advanced' }
      })

    await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))
    await waitFor(() => screen.findByText('Access Point LED'))

    expect(await screen.findByRole('button', { name: /Customize/ })).toBeVisible()
    expect(await screen.findByTestId('ApLed-text')).toBeVisible()
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
          setEditContextData: jest.fn(),
          editAdvancedContextData: {
            updateApLed: jest.fn(),
            discardApLedChanges: jest.fn()
          },
          setEditAdvancedContextData: jest.fn()
        }}>
          <ApDataContext.Provider value={{ apData: r760Ap }}>
            <ApLed />
          </ApDataContext.Provider>
        </ApEditContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/devices/wifi/:serialNumber/edit/advanced' }
      })

    await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))
    await waitFor(() => screen.findByText('Access Point LED'))

    expect(await screen.findByRole('button', { name: /Customize/ })).toBeVisible()
    expect(await screen.findByTestId('ApLed-text')).toBeVisible()
    expect(screen.queryByTestId('ApLed-switch')).toBeNull()

    await userEvent.click(await screen.findByRole('button', { name: /Customize/ }))

    expect(await screen.findByRole('button', { name: /Use Venue Settings/ })).toBeVisible()
    expect(await screen.findByTestId('ApLed-switch')).not.toBeDisabled()
    expect(await screen.findByTestId('ApLed-switch')).toBeVisible()
    expect(screen.queryByTestId('ApLed-text')).toBeNull()

    await userEvent.click(await screen.findByRole('button', { name: /Use Venue Settings/ }))
    expect(await screen.findByTestId('ApLed-text')).toBeVisible()
    expect(screen.queryByTestId('ApLed-switch')).toBeNull()
  })

  it('should handle turn On/Off switch buttons changed with use venue settings', async () => {
    render(
      <Provider>
        <ApDataContext.Provider value={{ apData: r760Ap }}>
          <ApLed />
        </ApDataContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/devices/wifi/:serialNumber/edit/advanced' }
      })
    await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))

    await userEvent.click(await screen.findByRole('button', { name: /Customize/ }))

    expect(await screen.findByTestId('ApLed-switch')).toBeChecked()
    await userEvent.click(await screen.findByTestId('ApLed-switch'))
    expect(await screen.findByTestId('ApLed-switch')).not.toBeChecked()

    await userEvent.click(await screen.findByRole('button', { name: /Use Venue Settings/ }))
    expect(screen.queryByTestId('ApLed-switch')).toBeNull()
    expect(await screen.findByTestId('ApLed-text')).toBeVisible()

    await userEvent.click(await screen.findByRole('button', { name: /Customize/ }))
    expect(await screen.findByTestId('ApLed-switch')).not.toBeChecked()
    expect(screen.queryByTestId('ApLed-text')).toBeNull()
  })
})
