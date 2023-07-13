import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { useIsSplitOn }                                                   from '@acx-ui/feature-toggle'
import { apApi, venueApi }                                                from '@acx-ui/rc/services'
import { CommonUrlsInfo, WifiUrlsInfo, getUrlForTest }                    from '@acx-ui/rc/utils'
import { Provider, store }                                                from '@acx-ui/store'
import { mockServer, render, screen, waitFor, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import { ApDataContext }     from '..'
import { ApEditContext }     from '../..'
import { r760Ap, venueData } from '../../../../__tests__/fixtures'

import { Advanced } from '.'


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


describe('AP Advanced', () => {
  beforeEach(() => {
    store.dispatch(venueApi.util.resetApiState())
    store.dispatch(apApi.util.resetApiState())
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    mockServer.use(
      rest.get(
        getUrlForTest(CommonUrlsInfo.getVenue),
        (_, res, ctx) => res(ctx.json(venueData))),
      rest.get(
        getUrlForTest(CommonUrlsInfo.getVenueLedOn),
        (_, res, ctx) => res(ctx.json(mockVenueLed))),
      rest.get(
        getUrlForTest(WifiUrlsInfo.getApLed),
        (_, res, ctx) => res(ctx.json(mockApLedSettings)))
    )
  })

  it('should render correctly', async () => {
    render(
      <Provider>
        <ApDataContext.Provider value={{ apData: r760Ap }}>
          <Advanced />
        </ApDataContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/devices/wifi/:serialNumber/edit/settings/advanced' }
      })

    await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))
    await waitFor(() => screen.findByText('Access Point LEDs'))

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
          setEditContextData: jest.fn()
        }}>
          <ApDataContext.Provider value={{ apData: r760Ap }}>
            <Advanced />
          </ApDataContext.Provider>
        </ApEditContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/devices/wifi/:serialNumber/edit/settings/advanced' }
      })

    await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))
    await waitFor(() => screen.findByText('Access Point LEDs'))

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

    await userEvent.click(await screen.findByRole('button', { name: /Apply/ }))
  })
})