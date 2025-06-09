import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { apApi, venueApi }                                       from '@acx-ui/rc/services'
import { WifiRbacUrlsInfo, WifiUrlsInfo }                        from '@acx-ui/rc/utils'
import { Provider, store }                                       from '@acx-ui/store'
import { mockServer, render, screen, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import { ApDataContext, ApEditContext } from '../..'
import { venuelist }                    from '../../../../__tests__/fixtures'

import { ExternalAntennaSettings } from './ExternalAntennaSettings'


const mockE510ApData = {
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
  name: 'E510',
  softDeleted: false,
  model: 'E510',
  updatedDate: '2022-11-30T01:46:54.199+0000'
}

const mockVenueExtAntenna = [{
  model: 'E510',
  enable24G: true,
  enable50G: true,
  gain24G: 3,
  gain50G: 3,
  coupled: false,
  supportDisable: true
}]

const mockApExtAntenna = {
  externalAntenna: {
    enable24G: true,
    enable50G: true,
    gain24G: 3,
    gain50G: 3,
    coupled: false,
    supportDisable: true
  },
  useVenueSettings: true
}

const params = { tenantId: 'tenant-id', serialNumber: 'serial-number', venueId: 'venue-id' }

describe('AP Ext Antenna Settings', () => {
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

  const defaultE510ApCtxData = { apData: mockE510ApData, venueData: venuelist.data[0] }

  beforeEach(() => {
    store.dispatch(apApi.util.resetApiState())
    store.dispatch(venueApi.util.resetApiState())
    mockServer.use(
      rest.get(
        WifiUrlsInfo.getVenueExternalAntenna.url,
        (_, res, ctx) => res(ctx.json(mockVenueExtAntenna))),
      rest.get(
        WifiRbacUrlsInfo.getApExternalAntennaSettings.url,
        (_, res, ctx) => res(ctx.json(mockApExtAntenna))),
      rest.put(
        WifiRbacUrlsInfo.updateApExternalAntennaSettings.url,
        (_, res, ctx) => res(ctx.json({})))
    )
  })

  it('should render correctly when use venue settings', async () => {
    render(
      <Provider>
        <ApEditContext.Provider value={defaultApEditCtxData}>
          <ApDataContext.Provider value={defaultE510ApCtxData}>
            <Form>
              <ExternalAntennaSettings />
            </Form>
          </ApDataContext.Provider>
        </ApEditContext.Provider>
      </Provider>, { route: { params } })

    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    expect(await screen.findByText(/Test-Venue/)).toBeVisible()
    expect(await screen.findByText(/Customize/)).toBeVisible()

    const enableToggleBtns = await screen.findAllByRole('switch')
    expect(enableToggleBtns.length).toBe(2)

  })

  it('should render correctly when use custom settings', async () => {
    render(
      <Provider>
        <ApEditContext.Provider value={defaultApEditCtxData}>
          <ApDataContext.Provider value={defaultE510ApCtxData}>
            <Form>
              <ExternalAntennaSettings />
            </Form>
          </ApDataContext.Provider>
        </ApEditContext.Provider>
      </Provider>, { route: { params } })

    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))

    await userEvent.click(await screen.findByRole('button', { name: /Customize/ } ))

    const enableToggleBtns = await screen.findAllByRole('switch')
    expect(enableToggleBtns.length).toBe(2)

    const gainSpins = await screen.findAllByRole('spinbutton')
    expect(gainSpins.length).toBe(2)
    await userEvent.click(enableToggleBtns[0])

    await userEvent.click(await screen.findByRole('button', { name: /Use Venue Settings/ } ))
    expect(await screen.findByRole('button', { name: /Customize/ } )).toBeVisible()
  })

})