import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { apApi, venueApi }                                                from '@acx-ui/rc/services'
import { CommonUrlsInfo, WifiUrlsInfo, getUrlForTest }                    from '@acx-ui/rc/utils'
import { Provider, store }                                                from '@acx-ui/store'
import { mockServer, render, screen, waitFor, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import { ApDataContext, ApEditContext } from '../..'
import { r760Ap, venueData }            from '../../../../__tests__/fixtures'

import { BssColoring } from '.'


const params = {
  tenantId: 'tenant-id',
  serialNumber: 'serial-number',
  venueId: 'venue-id'
}

const mockVenueBssColoringSettings = [{
  bssColoringEnabled: true
}]

const mockApBssColoringSettings = {
  bssColoringEnabled: true,
  useVenueSettings: true
}


describe('AP BSS Coloring', () => {
  beforeEach(() => {
    store.dispatch(venueApi.util.resetApiState())
    store.dispatch(apApi.util.resetApiState())

    mockServer.use(
      rest.get(
        getUrlForTest(CommonUrlsInfo.getVenue),
        (_, res, ctx) => res(ctx.json(venueData))),
      rest.get(
        getUrlForTest(CommonUrlsInfo.getVenueBssColoring),
        (_, res, ctx) => res(ctx.json(mockVenueBssColoringSettings))),
      rest.get(
        getUrlForTest(WifiUrlsInfo.getApBssColoring),
        (_, res, ctx) => res(ctx.json(mockApBssColoringSettings)))
    )
  })

  it('should render correctly', async () => {
    render(
      <Provider>
        <ApDataContext.Provider value={{ apData: r760Ap }}>
          <BssColoring />
        </ApDataContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/devices/wifi/:serialNumber/edit/advanced' }
      })

    await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))
    await waitFor(() => screen.findByText('Enable BSS Coloring'))

    expect(await screen.findByRole('button', { name: /Customize/ })).toBeVisible()
    expect(await screen.findByTestId('ApBssColoring-text')).toBeVisible()
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
            updateBssColoring: jest.fn(),
            discardBssColoringChanges: jest.fn()
          },
          setEditAdvancedContextData: jest.fn()
        }}>
          <ApDataContext.Provider value={{ apData: r760Ap }}>
            <BssColoring />
          </ApDataContext.Provider>
        </ApEditContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/devices/wifi/:serialNumber/edit/advanced' }
      })

    await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))
    await waitFor(() => screen.findByText('Enable BSS Coloring'))

    const customizeButton = await screen.findByRole('button', { name: /Customize/ })
    expect(customizeButton).toBeVisible()
    expect(await screen.findByTestId('ApBssColoring-text')).toBeVisible()
    expect(screen.queryByTestId('ApBssColoring-switch')).toBeNull()

    await userEvent.click(customizeButton)

    const useVenueButton = await screen.findByRole('button', { name: /Use Venue Settings/ })
    expect(useVenueButton).toBeVisible()
    const apBssColoringSwitch = await screen.findByTestId('ApBssColoring-switch')
    expect(apBssColoringSwitch).not.toBeDisabled()
    expect(apBssColoringSwitch).toBeVisible()
    expect(screen.queryByTestId('ApBssColoring-text')).toBeNull()

    await userEvent.click(useVenueButton)
    expect(await screen.findByTestId('ApBssColoring-text')).toBeVisible()
    expect(screen.queryByTestId('ApBssColoring-switch')).toBeNull()
  })

  it('should handle turn On/Off switch buttons changed with use venue settings', async () => {
    render(
      <Provider>
        <ApDataContext.Provider value={{ apData: r760Ap }}>
          <BssColoring />
        </ApDataContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/devices/wifi/:serialNumber/edit/advanced' }
      })
    await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))

    await userEvent.click(await screen.findByRole('button', { name: /Customize/ }))

    const apBssColoringSwitch = await screen.findByTestId('ApBssColoring-switch')
    expect(apBssColoringSwitch).toBeChecked()
    await userEvent.click(apBssColoringSwitch)
    expect(apBssColoringSwitch).not.toBeChecked()

    await userEvent.click(await screen.findByRole('button', { name: /Use Venue Settings/ }))
    expect(screen.queryByTestId('ApBssColoring-switch')).toBeNull()
    expect(await screen.findByTestId('ApBssColoring-text')).toBeVisible()

    await userEvent.click(await screen.findByRole('button', { name: /Customize/ }))
    expect(await screen.findByTestId('ApBssColoring-switch')).not.toBeChecked()
    expect(screen.queryByTestId('ApBssColoring-text')).toBeNull()
  })
})
