import '@testing-library/jest-dom'
import { rest } from 'msw'


import { CommonUrlsInfo, WifiUrlsInfo }          from '@acx-ui/rc/utils'
import { Provider }                              from '@acx-ui/store'
import { fireEvent, mockServer, render, screen } from '@acx-ui/test-utils'

import { ApEditContext } from '../..'
import {
  apRadio,
  apDetail,
  venuelist,
  venueDetail,
  validChannels,
  radioCustomization
} from '../../../../__tests__/fixtures'

import { RadioSettings } from './RadioSettings'


const params = { tenantId: 'tenant-id', serialNumber: 'serial-number', venueId: 'venue-id' }

describe('RadioSettingsTab', () => {
  beforeEach(() => {
    mockServer.use(
      rest.get(
        CommonUrlsInfo.getDashboardOverview.url,
        (_, res, ctx) => res(ctx.json({}))),
      rest.get(
        CommonUrlsInfo.getVenuesList.url,
        (_, res, ctx) => res(ctx.json(venuelist))),
      rest.get(
        CommonUrlsInfo.getVenue.url,
        (_, res, ctx) => res(ctx.json(venueDetail))),
      rest.get(
        WifiUrlsInfo.getAp.url,
        (_, res, ctx) => res(ctx.json(apDetail))),
      rest.get(
        WifiUrlsInfo.getApRadio.url,
        (_, res, ctx) => res(ctx.json(apRadio))),
      rest.get(
        WifiUrlsInfo.getVenueDefaultRegulatoryChannels.url,
        (_, res, ctx) => res(ctx.json(validChannels))),
      rest.get(
        WifiUrlsInfo.getVenueRadioCustomization.url,
        (_, res, ctx) => res(ctx.json(radioCustomization))),
      rest.put(
        WifiUrlsInfo.updateApRadio.url,
        (_, res, ctx) => res(ctx.json({})))
    )
  })
  it('should render correctly', async () => {
    const { asFragment } = render(
      <Provider>
        <ApEditContext.Provider value={{
          editContextData: {
            tabTitle: '',
            isDirty: false,
            updateChanges: jest.fn(),
            discardChanges: jest.fn()
          },
          setEditContextData: jest.fn(),
          editRadioContextData: {},
          setEditRadioContextData: jest.fn()
        }}
        >
          <RadioSettings />
        </ApEditContext.Provider>
      </Provider>, { route: { params } })

    expect(asFragment()).toMatchSnapshot()

    fireEvent.click(await screen.findByRole('tab', { name: '5 GHz' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Lower 5G' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Upper 5G' }))
    fireEvent.click(await screen.findByRole('button', { name: 'DFS' }))
    const transmitSelect = await screen.findByRole('combobox', { name: /Transmit Power/i })
    fireEvent.click(transmitSelect)
    fireEvent.click((await screen.findAllByTitle('Auto'))[0])
    fireEvent.click(await screen.findByRole('button', { name: 'Customize' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Apply Radio' }))
  })
  it('should render correctly with Auto bandwidth', async () => {
    radioCustomization.radioParams50G.channelBandwidth = 'AUTO'
    const { asFragment } = render(
      <Provider>
        <ApEditContext.Provider value={{
          editContextData: {
            tabTitle: '',
            isDirty: false,
            updateChanges: jest.fn(),
            discardChanges: jest.fn()
          },
          setEditContextData: jest.fn(),
          editRadioContextData: {},
          setEditRadioContextData: jest.fn()
        }}
        >
          <RadioSettings />
        </ApEditContext.Provider>
      </Provider>, { route: { params } })

    expect(asFragment()).toMatchSnapshot()

    fireEvent.click(await screen.findByRole('tab', { name: '5 GHz' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Lower 5G' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Upper 5G' }))
    fireEvent.click(await screen.findByRole('button', { name: 'DFS' }))
    const transmitSelect = await screen.findByRole('combobox', { name: /Transmit Power/i })
    fireEvent.click(transmitSelect)
    fireEvent.click((await screen.findAllByTitle('Auto'))[0])
    fireEvent.click(await screen.findByRole('button', { name: 'Customize' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Apply Radio' }))
  })
})