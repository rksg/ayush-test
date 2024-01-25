import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { apApi, venueApi }                                       from '@acx-ui/rc/services'
import { ApAntennaTypeEnum, CommonUrlsInfo, WifiUrlsInfo }       from '@acx-ui/rc/utils'
import { Provider, store }                                       from '@acx-ui/store'
import { mockServer, render, screen, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import { ApDataContext, ApEditContext } from '../..'
import { venuelist }                    from '../../../../__tests__/fixtures'

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

const mockApAntennaType = {
  antennaType: ApAntennaTypeEnum.NARROW,
  useVenueSettings: true
}

const params = { tenantId: 'tenant-id', serialNumber: 'serial-number', venueId: 'venue-id' }

describe('AP Antenna Type Section', () => {
  beforeEach(() => {
    store.dispatch(apApi.util.resetApiState())
    store.dispatch(venueApi.util.resetApiState())
    mockServer.use(
      rest.get(
        CommonUrlsInfo.getVenue.url,
        (_, res, ctx) => res(ctx.json(venuelist.data[0]))),
      rest.get(
        WifiUrlsInfo.getVenueAntennaType.url,
        (_, res, ctx) => res(ctx.json(mockVenueAntennaType))),
      rest.get(
        WifiUrlsInfo.getApAntennaTypeSettings.url,
        (_, res, ctx) => res(ctx.json(mockApAntennaType))),
      rest.put(
        WifiUrlsInfo.updateApAntennaTypeSettings.url,
        (_, res, ctx) => res(ctx.json({}))),
      rest.delete(
        WifiUrlsInfo.resetApAntennaTypeSettings.url,
        (_, res, ctx) => res(ctx.json({})))
    )
  })

  it('should render correctly when use venue settings', async () => {
    render(
      <Provider>
        <ApEditContext.Provider value={{
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
        }}
        >
          <ApDataContext.Provider value={{ apData: mockR670ApData }}>
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
    render(
      <Provider>
        <ApEditContext.Provider value={{
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
        }}
        >
          <ApDataContext.Provider value={{ apData: mockR670ApData }}>
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
  })

})