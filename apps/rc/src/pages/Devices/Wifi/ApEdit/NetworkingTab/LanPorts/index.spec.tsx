import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { Features, useIsSplitOn }                                             from '@acx-ui/feature-toggle'
import { apApi, venueApi }                                                    from '@acx-ui/rc/services'
import { CommonRbacUrlsInfo, CommonUrlsInfo, WifiRbacUrlsInfo, WifiUrlsInfo } from '@acx-ui/rc/utils'
import { Provider, store }                                                    from '@acx-ui/store'
import {
  mockServer,
  render,
  waitForElementToBeRemoved,
  screen
}   from '@acx-ui/test-utils'

import { ApNetworkingContext }                                                                    from '..'
import { ApDataContext, ApEditContext }                                                           from '../..'
import { ApCap_T750SE, ApData_T750SE, ApLanPorts_T750SE, venueData, venueLanPorts, venueSetting } from '../../../../__tests__/fixtures'

import { LanPorts } from '.'

const params = { tenantId: 'tenant-id', serialNumber: 'serial-number', venueId: 'venue-id' }
const mockedUsedNavigate = jest.fn()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('AP Lan port settings', () => {
  const defaultT750SeApCtxData = {
    apData: ApData_T750SE,
    apCapabilities: ApCap_T750SE,
    venueData
  }

  beforeEach(() => {
    store.dispatch(venueApi.util.resetApiState())
    store.dispatch(apApi.util.resetApiState())

    mockServer.use(
      rest.get(CommonUrlsInfo.getVenueSettings.url,
        (_, res, ctx) => res(ctx.json(venueSetting))),
      rest.get(CommonUrlsInfo.getVenueLanPorts.url,
        (_, res, ctx) => res(ctx.json(venueLanPorts))),
      rest.get(CommonRbacUrlsInfo.getVenueLanPorts.url,
        (_, res, ctx) => res(ctx.json(venueLanPorts))),
      rest.get(WifiUrlsInfo.getApLanPorts.url,
        (_, res, ctx) => res(ctx.json(ApLanPorts_T750SE))),
      rest.get(WifiRbacUrlsInfo.getApLanPorts.url,
        (_, res, ctx) => res(ctx.json(ApLanPorts_T750SE))),
      rest.put(WifiUrlsInfo.updateApLanPorts.url,
        (_, res, ctx) => res(ctx.json({}))),
      rest.put(WifiRbacUrlsInfo.updateApLanPorts.url,
        (_, res, ctx) => res(ctx.json({}))),
      rest.delete(WifiUrlsInfo.resetApLanPorts.url,
        (_, res, ctx) => res(ctx.json({})))
    )
  })

  it ('Should render correctly with AP model T750SE', async () => {
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
          editNetworkingContextData: {} as ApNetworkingContext,
          setEditNetworkingContextData: jest.fn()
        }}>
          <ApDataContext.Provider value={defaultT750SeApCtxData}>
            <LanPorts />
          </ApDataContext.Provider>
        </ApEditContext.Provider>
      </Provider>,{
        route: { params, path: '/:tenantId/devices/wifi/:serialNumber/edit/networking' }
      }
    )

    await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))

    const tabs = await screen.findAllByRole('tab')
    // T750SE have 3 Lan ports
    expect(tabs.length).toBe(3)
    await userEvent.click(tabs[1])

    await userEvent.click(await screen.findByRole('button', { name: 'Customize' }))

    expect(screen.queryByRole('button', { name: 'Reset to default' })).not.toBeInTheDocument()

    /* Waiting for backend support AP PoE mode settings
    const poeCombobox = await screen.findByRole('combobox', { name: 'PoE Operating Mode' })
    await userEvent.click(poeCombobox)


    // T750SE have 5 PoE modes:[ 'Auto', '802.3at', '802.3bt-Class_5', '802.3bt-Class_6', '802.3bt-Class_7']
    expect(await screen.findByTitle('802.3at')).toBeInTheDocument()
    expect(await screen.findByTitle('802.3bt/Class 5')).toBeInTheDocument()
    expect(await screen.findByTitle('802.3bt/Class 6')).toBeInTheDocument()
    expect(await screen.findByTitle('802.3bt/Class 7')).toBeInTheDocument()
    await userEvent.click(await screen.findByTitle('802.3bt/Class 5'))
    const option802_3bt_5 = await screen.findByRole('option', { name: '802.3bt/Class 5' })
    expect(option802_3bt_5.getAttribute('aria-selected')).toBe('true')
    */
    await userEvent.click(await screen.findByRole('switch', { name: 'Enable port' }))


    await userEvent.click(await screen.findByRole('button', { name: 'Use Venue Settings' }))

    const venueLink = await screen.findByRole('button', { name: 'My-Venue' })
    expect(venueLink).toBeInTheDocument()
    await userEvent.click(venueLink)
    expect(mockedUsedNavigate).toBeCalled()
  })

  it ('Should render LAN ports reset to default correctly with AP', async () => {
    // Given
    jest.mocked(useIsSplitOn).mockImplementation(ff =>
      ff === Features.WIFI_RESET_AP_LAN_PORT_TOGGLE)
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
          editNetworkingContextData: {} as ApNetworkingContext,
          setEditNetworkingContextData: jest.fn()
        }}>
          <ApDataContext.Provider value={defaultT750SeApCtxData}>
            <LanPorts />
          </ApDataContext.Provider>
        </ApEditContext.Provider>
      </Provider>,{
        route: { params, path: '/:tenantId/devices/wifi/:serialNumber/edit/networking' }
      }
    )

    await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))

    const tabs = await screen.findAllByRole('tab')
    await userEvent.click(tabs[1])

    await userEvent.click(await screen.findByRole('button', { name: 'Customize' }))

    const enablePort = await screen.findByRole('switch', { name: 'Enable port' })
    expect(enablePort).toBeEnabled()
    expect(enablePort).toHaveAttribute('aria-checked', 'true')
    await userEvent.click(enablePort)
    expect(await screen.findByRole('switch', { name: 'Enable port' }))
      .toHaveAttribute('aria-checked', 'false')

    // When
    const resetBtn = await screen.findByRole('button', { name: 'Reset to default' })
    expect(resetBtn).toBeInTheDocument()
    await userEvent.click(resetBtn)

    // Then
    expect(await screen.findByRole('switch', { name: 'Enable port' }))
      .toHaveAttribute('aria-checked', 'true')

    // When
    await userEvent.click(await screen.findByRole('button', { name: 'Use Venue Settings' }))

    // Then
    expect(screen.queryByRole('button', { name: 'Reset to default' })).not.toBeInTheDocument()

    const venueLink = await screen.findByRole('button', { name: 'My-Venue' })
    expect(venueLink).toBeInTheDocument()
    await userEvent.click(venueLink)
    expect(mockedUsedNavigate).toBeCalled()
  })
})
