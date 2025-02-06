import { fireEvent, screen, waitForElementToBeRemoved } from '@testing-library/react'
import { rest }                                         from 'msw'

import { venueApi }                                               from '@acx-ui/rc/services'
import { CommonRbacUrlsInfo, VenueApUsbStatus, WifiRbacUrlsInfo } from '@acx-ui/rc/utils'
import { Provider, store }                                        from '@acx-ui/store'
import { mockServer, render }                                     from '@acx-ui/test-utils'

import { AdvanceSettingContext }         from '..'
import { VenueUtilityContext }           from '../..'
import { EditContext, VenueEditContext } from '../../..'
import { defaultValue }                  from '../../../../contentsMap'

import { AccessPointUSB } from '.'


const mockVenueWithoutApModels = {
  models: []
}

const mockVenueWithApModels = {
  models: [ 'T670' ]
}

const mockVenueApUsbData = [{
  model: 'T670',
  usbPortEnable: true
}, {
  model: 'R370',
  usbPortEnable: false
}] as VenueApUsbStatus[]

const mockVenueApCap = {
  apModels: [
    {
      model: 'R350',
      version: '7.1.1.520.121',
      ledOn: true,
      isOutdoor: false
    }, {
      model: 'R370',
      version: '7.1.1.520.121',
      ledOn: true,
      isOutdoor: false,
      usbPowerEnable: true
    }, {
      model: 'R560',
      version: '7.1.1.520.121',
      ledOn: true,
      isOutdoor: false
    }, {
      model: 'T670',
      version: '7.1.1.520.121',
      ledOn: true,
      isOutdoor: true,
      usbPowerEnable: true
    }, {
      model: 'T670SN',
      version: '7.1.1.520.121',
      ledOn: true,
      isOutdoor: true,
      usbPowerEnable: true
    }]
}

const params = { venueId: 'venue-id', tenantId: 'tenant-id', activeTab: 'wifi' }

const editContextData = {} as EditContext
const setEditContextData = jest.fn()
let editAdvancedContextData = {} as AdvanceSettingContext
const setEditAdvancedContextData = jest.fn()

const mockAdvancedApUsb = (
  <VenueUtilityContext.Provider value={{
    venueApCaps: mockVenueApCap,
    isLoadingVenueApCaps: false
  }}>
    <AccessPointUSB />
  </VenueUtilityContext.Provider>
)

describe('AdvancedTab - Access Point USB', () => {
  beforeEach(() => {
    store.dispatch(venueApi.util.resetApiState())
    mockServer.use(
      rest.get(CommonRbacUrlsInfo.getVenueApModels.url,
        (_, res, ctx) => res(ctx.json(mockVenueWithoutApModels))),
      rest.get(WifiRbacUrlsInfo.getVenueApUsbStatus.url,
        (_, res, ctx) => res(ctx.json([]))),
      rest.put(WifiRbacUrlsInfo.updateVenueApUsbStatus.url,
        (_, res, ctx) => res(ctx.json({})))
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.restoreAllMocks()
  })

  it('should render correctly with empty data', async () => {
    render(
      <Provider>
        <VenueEditContext.Provider value={{
          ...defaultValue,
          editContextData,
          setEditContextData,
          editAdvancedContextData,
          setEditAdvancedContextData }}>
          {mockAdvancedApUsb}
        </VenueEditContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/t/venues/:venueId/edit/:activeTab' }
      }
    )

    await waitForElementToBeRemoved(() => screen.queryAllByLabelText('loader'))

    expect(await screen.findByText('Model')).toBeInTheDocument()
    expect(await screen.findByText('USB Status')).toBeInTheDocument()

    expect(screen.getByRole('button', { name: 'Add Model' })).toBeVisible()

  })

  it('should render correctly with data', async () => {
    mockServer.use(
      rest.get(CommonRbacUrlsInfo.getVenueApModels.url,
        (_, res, ctx) => res(ctx.json(mockVenueWithApModels))),
      rest.get(WifiRbacUrlsInfo.getVenueApUsbStatus.url,
        (_, res, ctx) => res(ctx.json(mockVenueApUsbData)))
    )

    render(
      <Provider>
        <VenueEditContext.Provider value={{
          ...defaultValue,
          editContextData,
          setEditContextData,
          editAdvancedContextData,
          setEditAdvancedContextData }}>
          {mockAdvancedApUsb}
        </VenueEditContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/t/venues/:venueId/edit/:activeTab' }
      }
    )

    await waitForElementToBeRemoved(() => screen.queryAllByLabelText('loader'))

    expect(await screen.findByText('Model')).toBeInTheDocument()
    expect(await screen.findByText('USB Status')).toBeInTheDocument()

    // Two existed data (R370, T670)
    expect(await screen.findByText(mockVenueApUsbData[0].model)).toBeVisible()
    expect(await screen.findByText(mockVenueApUsbData[1].model)).toBeVisible()

    // T670 joined the venue, so the delete button should be hidden
    let deleteBtns = screen.getAllByRole('deleteBtn')
    expect(deleteBtns.length).toBe(1)

    // Add the new data (T670SN)
    const addBtn = await screen.findByRole('button', { name: 'Add Model' })
    expect(addBtn).toBeEnabled()
    fireEvent.click(addBtn)
    expect(addBtn).toBeDisabled()

    fireEvent.mouseDown(await screen.findByRole('combobox'))
    const allOptions = screen.getAllByRole('option')
    expect(allOptions).toHaveLength(1)
    fireEvent.click(allOptions[0])

    const toggle = screen.getAllByRole('switch')
    fireEvent.click(toggle[0])

    deleteBtns = screen.getAllByRole('deleteBtn')
    expect(deleteBtns.length).toBe(2)
    fireEvent.click(deleteBtns[deleteBtns.length - 1])

    // delete
    deleteBtns = screen.getAllByRole('deleteBtn')
    expect(deleteBtns.length).toBe(1)
  })

})