import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { apApi, venueApi }     from '@acx-ui/rc/services'
import { WifiRbacUrlsInfo }    from '@acx-ui/rc/utils'
import { Provider, store }     from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved
} from '@acx-ui/test-utils'

import { ApDataContext, ApEditContext } from '../..'


import { ApUsb } from '.'


const params = {
  tenantId: 'tenant-id',
  serialNumber: '__mock_serial_number__',
  venueId: '__mock_venue_id__'
}

const mockVenueUsb = [{
  usbPortEnable: true,
  model: 'T670'
}]

const mockApUsbSettings = {
  usbPortEnable: true,
  useVenueSettings: true
}

const t670Ap = {
  model: 'T670',
  serialNumber: '__mock_serial_number__',
  apGroupId: '__mock_ap_group_id__',
  venueId: '__mock_venue_id__',
  radio: {
    apRadioParams24G: {
      manualChannel: 0,
      channelBandwidth: 'AUTO',
      txPower: 'MAX',
      method: 'BACKGROUND_SCANNING',
      changeInterval: 33
    },
    apRadioParams50G: {
      channelBandwidth: 'AUTO',
      manualChannel: 0,
      txPower: 'MAX',
      method: 'BACKGROUND_SCANNING',
      changeInterval: 33
    },
    apRadioParamsDual5G: {
      enabled: true,
      radioParamsLower5G: {
        channelBandwidth: 'AUTO',
        manualChannel: 0,
        txPower: 'MAX',
        method: 'BACKGROUND_SCANNING',
        changeInterval: 33
      },
      radioParamsUpper5G: {
        channelBandwidth: 'AUTO',
        manualChannel: 0,
        txPower: 'MAX',
        method: 'BACKGROUND_SCANNING',
        changeInterval: 33
      }
    },
    apRadioParams6G: {
      manualChannel: 0,
      method: 'CHANNELFLY',
      channelBandwidth: 'AUTO',
      bssMinRate6G: 'HE_MCS_0',
      mgmtTxRate6G: '6',
      txPower: 'MAX',
      changeInterval: 33
    },
    useVenueSettings: true
  }
}

const venueData = {
  address: {
    addressLine: '1093 Main St, New York, NY, 10044, United States',
    city: 'New York',
    country: 'United States',
    latitude: 40.7690084,
    longitude: -73.9431541,
    timezone: 'America/New_York'
  },
  createdDate: '__mock_venue_id__',
  description: 'My-Venue',
  floorPlans: [],
  id: '4c778ed630394b76b17bce7fe230cf9f',
  name: 'My-Venue',
  updatedDate: '2022-07-08T04:59:22.351+00:00'
}


describe('AP USB', () => {
  const defaultT670ApCtxData = { apData: t670Ap, venueData } //{ apData: t670Ap, venueData }

  beforeEach(() => {
    store.dispatch(venueApi.util.resetApiState())
    store.dispatch(apApi.util.resetApiState())

    mockServer.use(
      rest.get(WifiRbacUrlsInfo.getVenueApUsbStatus.url,
        (_, res, ctx) => res(ctx.json(mockVenueUsb))),
      rest.get(WifiRbacUrlsInfo.getApUsb.url,
        (_, res, ctx) => res(ctx.json(mockApUsbSettings))),
      rest.delete(WifiRbacUrlsInfo.updateApUsb.url,
        (_, res, ctx)=> res(ctx.json({ requestId: '123' })))
    )
  })

  it('should render correctly', async () => {
    render(
      <Provider>
        <ApDataContext.Provider value={defaultT670ApCtxData}>
          <ApUsb />
        </ApDataContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/devices/wifi/:serialNumber/edit/advanced' }
      })

    await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))
    await waitFor(() => screen.findByText('USB Support'))

    expect(await screen.findByRole('button', { name: /Customize/ })).toBeVisible()
    expect(await screen.findByTestId('ApUsb-text')).toBeVisible()
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
            updateApUsb: jest.fn(),
            discardApUsbChanges: jest.fn()
          },
          setEditAdvancedContextData: jest.fn()
        }}>
          <ApDataContext.Provider value={defaultT670ApCtxData}>
            <ApUsb />
          </ApDataContext.Provider>
        </ApEditContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/devices/wifi/:serialNumber/edit/advanced' }
      })

    await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))
    await waitFor(() => screen.findByText('USB Support'))

    expect(await screen.findByRole('button', { name: /Customize/ })).toBeVisible()
    expect(await screen.findByTestId('ApUsb-text')).toBeVisible()
    expect(screen.queryByTestId('ApUsb-switch')).toBeNull()

    await userEvent.click(await screen.findByRole('button', { name: /Customize/ }))

    expect(await screen.findByRole('button', { name: /Use Venue Settings/ })).toBeVisible()
    expect(await screen.findByTestId('ApUsb-switch')).not.toBeDisabled()
    expect(await screen.findByTestId('ApUsb-switch')).toBeVisible()
    expect(screen.queryByTestId('ApUsb-text')).toBeNull()

    await userEvent.click(await screen.findByRole('button', { name: /Use Venue Settings/ }))
    expect(await screen.findByTestId('ApUsb-text')).toBeVisible()
    expect(screen.queryByTestId('ApUsb-switch')).toBeNull()
  })

  it('should handle turn On/Off switch buttons changed with use venue settings', async () => {
    render(
      <Provider>
        <ApDataContext.Provider value={defaultT670ApCtxData}>
          <ApUsb />
        </ApDataContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/devices/wifi/:serialNumber/edit/advanced' }
      })
    await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))

    await userEvent.click(await screen.findByRole('button', { name: /Customize/ }))

    expect(await screen.findByTestId('ApUsb-switch')).toBeChecked()
    await userEvent.click(await screen.findByTestId('ApUsb-switch'))
    expect(await screen.findByTestId('ApUsb-switch')).not.toBeChecked()

    await userEvent.click(await screen.findByRole('button', { name: /Use Venue Settings/ }))
    expect(screen.queryByTestId('ApUsb-switch')).toBeNull()
    expect(await screen.findByTestId('ApUsb-text')).toBeVisible()

    await userEvent.click(await screen.findByRole('button', { name: /Customize/ }))
    expect(await screen.findByTestId('ApUsb-switch')).not.toBeChecked()
    expect(screen.queryByTestId('ApUsb-text')).toBeNull()
  })
})