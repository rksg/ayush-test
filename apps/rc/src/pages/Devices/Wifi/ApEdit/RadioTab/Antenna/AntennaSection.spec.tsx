import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { Features, useIsSplitOn }                                from '@acx-ui/feature-toggle'
import { apApi, venueApi }                                       from '@acx-ui/rc/services'
import { ApAntennaTypeEnum, WifiRbacUrlsInfo, WifiUrlsInfo }     from '@acx-ui/rc/utils'
import { Provider, store }                                       from '@acx-ui/store'
import { mockServer, render, screen, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import { ApDataContext, ApEditContext } from '../..'
import { venueList }                    from '../../../../__tests__/fixtures'

import { AntennaSection } from './AntennaSection'

const mockR670ApData = {
  serialNumber: 'serial-number',
  apGroupId: 'c4d022174e8347a0b2c5a52fa11eb85a',
  venueId: 'venue-id',
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
  },
  name: 'R670',
  softDeleted: false,
  model: 'R670',
  updatedDate: '2022-11-30T01:46:54.199+0000'
}

const mockVenueAntennaType = [{
  model: 'R670',
  antennaType: ApAntennaTypeEnum.NARROW
}]

const mockApGroupAntennaType = {
  antennaTypeSettings: [{
    model: 'R670',
    antennaType: ApAntennaTypeEnum.NARROW
  }],
  useVenueSettings: true
}

const mockApAntennaType = {
  antennaType: ApAntennaTypeEnum.NARROW,
  useVenueSettings: true
}

const mockApAntennaTypeV1001 = {
  antennaType: ApAntennaTypeEnum.NARROW,
  useVenueOrApGroupSettings: true
}

const params = { tenantId: 'tenant-id', serialNumber: 'serial-number', venueId: 'venue-id' }

describe('AP Antenna Type Section', () => {
  const defaultApEditCtxData = {
    editContextData: {
      unsavedTabKey: 'radio',
      tabTitle: 'Radio',
      isDirty: false
    },
    setEditContextData: jest.fn(),
    editRadioContextData: {
      updateApAntennaType: jest.fn()
    },
    setEditRadioContextData: jest.fn()
  }

  const defaultR760ApCtxData = { apData: mockR670ApData, venueData: venueList.data[0] }

  beforeEach(() => {
    store.dispatch(apApi.util.resetApiState())
    store.dispatch(venueApi.util.resetApiState())
    mockServer.use(
      rest.get(
        WifiRbacUrlsInfo.getVenueAntennaType.url,
        (_, res, ctx) => res(ctx.json(mockVenueAntennaType))),
      rest.get(
        WifiRbacUrlsInfo.getApGroupAntennaType.url,
        (_, res, ctx) => res(ctx.json(mockApGroupAntennaType))),
      rest.put(
        WifiRbacUrlsInfo.updateApAntennaTypeSettingsV1001.url,
        (_, res, ctx) => res(ctx.json({}))),
      rest.get(
        WifiRbacUrlsInfo.getApAntennaTypeSettings.url,
        (_, res, ctx) => res(ctx.json(mockApAntennaType))),
      rest.put(
        WifiRbacUrlsInfo.updateApAntennaTypeSettings.url,
        (_, res, ctx) => res(ctx.json({})))
    )
  })

  it('should render correctly when use venue settings', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    render(
      <Provider>
        <ApEditContext.Provider value={defaultApEditCtxData}>
          <ApDataContext.Provider value={defaultR760ApCtxData}>
            <Form>
              <AntennaSection />
            </Form>
          </ApDataContext.Provider>
        </ApEditContext.Provider>
      </Provider>, { route: { params } })

    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    expect(await screen.findByText(/Test-Venue/)).toBeVisible()
    expect(await screen.findByText(/Customize/)).toBeVisible()

    expect(await screen.findByText('Narrow')).toBeVisible()
  })

  it('should render correctly when use custom settings', async () => {
    // eslint-disable-next-line max-len
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff !== Features.WIFI_AP_GROUP_MORE_PARAMETER_PHASE3_TOGGLE)
    render(
      <Provider>
        <ApEditContext.Provider value={defaultApEditCtxData}>
          <ApDataContext.Provider value={defaultR760ApCtxData}>
            <Form>
              <AntennaSection />
            </Form>
          </ApDataContext.Provider>
        </ApEditContext.Provider>
      </Provider>, { route: { params } })

    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))

    await userEvent.click(await screen.findByRole('button', { name: /Customize/ } ))

    const antTypeCombobox = await screen.findByRole('combobox', { name: /Antenna Type/ })
    expect(antTypeCombobox).toBeInTheDocument()

    const narrow = screen.queryByText('Narrow')
    expect(narrow).toBeVisible()
    const sector = screen.queryByText('Sector')
    expect(sector).not.toBeInTheDocument()

    await userEvent.click(antTypeCombobox)
    await userEvent.click(await screen.findByText('Sector'))

    await userEvent.click(await screen.findByRole('button', { name: /Use Venue Settings/ } ))
    expect(await screen.findByRole('button', { name: /Customize/ } )).toBeVisible()
  })

})

describe('AP Antenna Type Section with WIFI_AP_GROUP_MORE_PARAMETER_PHASE3_TOGGLE', () => {
  const defaultApEditCtxData = {
    editContextData: {
      unsavedTabKey: 'radio',
      tabTitle: 'Radio',
      isDirty: false
    },
    setEditContextData: jest.fn(),
    editRadioContextData: {
      updateApAntennaType: jest.fn()
    },
    setEditRadioContextData: jest.fn()
  }

  const defaultR760ApCtxData = { apData: mockR670ApData, venueData: venueList.data[0] }

  beforeEach(() => {
    store.dispatch(apApi.util.resetApiState())
    store.dispatch(venueApi.util.resetApiState())
    mockServer.use(
      rest.get(
        WifiUrlsInfo.getVenueAntennaType.url,
        (_, res, ctx) => res(ctx.json(mockVenueAntennaType))),
      rest.get(
        WifiRbacUrlsInfo.getApGroupAntennaType.url,
        (_, res, ctx) => res(ctx.json(mockApGroupAntennaType))),
      rest.get(
        WifiRbacUrlsInfo.getApAntennaTypeSettingsV1001.url,
        (_, res, ctx) => res(ctx.json(mockApAntennaTypeV1001))),
      rest.put(
        WifiRbacUrlsInfo.updateApAntennaTypeSettingsV1001.url,
        (_, res, ctx) => res(ctx.json({})))
    )
  })

  it('should render correctly when use venue or apgroup settings', async () => {
    // eslint-disable-next-line max-len
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.WIFI_AP_GROUP_MORE_PARAMETER_PHASE3_TOGGLE)
    render(
      <Provider>
        <ApEditContext.Provider value={defaultApEditCtxData}>
          <ApDataContext.Provider value={defaultR760ApCtxData}>
            <Form>
              <AntennaSection />
            </Form>
          </ApDataContext.Provider>
        </ApEditContext.Provider>
      </Provider>, { route: { params } })

    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    expect(await screen.findByText(/Use inherited settings from AP Group/)).toBeVisible()
    expect(await screen.findByText(/Customize/)).toBeVisible()

    expect(await screen.findByText('Narrow')).toBeVisible()
  })

  it('should render correctly when use custom settings', async () => {
    // eslint-disable-next-line max-len
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.WIFI_AP_GROUP_MORE_PARAMETER_PHASE3_TOGGLE)
    render(
      <Provider>
        <ApEditContext.Provider value={defaultApEditCtxData}>
          <ApDataContext.Provider value={defaultR760ApCtxData}>
            <Form>
              <AntennaSection />
            </Form>
          </ApDataContext.Provider>
        </ApEditContext.Provider>
      </Provider>, { route: { params } })

    //await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))

    await userEvent.click(await screen.findByText(/Customize settings/))

    const antTypeCombobox = await screen.findByRole('combobox', { name: /Antenna Type/ })
    expect(antTypeCombobox).toBeInTheDocument()

    const narrow = screen.queryByText('Narrow')
    expect(narrow).toBeVisible()
    const sector = screen.queryByText('Sector')
    expect(sector).not.toBeInTheDocument()

    await userEvent.click(antTypeCombobox)
    await userEvent.click(await screen.findByText('Sector'))

    // eslint-disable-next-line max-len
    await userEvent.click(await screen.findByText(/Use inherited settings from AP Group/))
    expect(await screen.findByText(/Customize settings/)).toBeVisible()
  })

})
