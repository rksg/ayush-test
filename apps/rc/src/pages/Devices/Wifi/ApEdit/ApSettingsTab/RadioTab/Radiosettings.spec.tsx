import '@testing-library/jest-dom'
import { rest } from 'msw'

import { CommonUrlsInfo, WifiUrlsInfo }          from '@acx-ui/rc/utils'
import { Provider }                              from '@acx-ui/store'
import { fireEvent, mockServer, render, screen } from '@acx-ui/test-utils'

import { ApEditContext }     from '../..'
import {
  apDeviceRadio,
  apRadioDetail,
  venuelist,
  venueRadioDetail,
  validRadioChannels,
  venueRadioCustomization
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
        (_, res, ctx) => res(ctx.json(venueRadioDetail))),
      rest.get(
        WifiUrlsInfo.getAp.url,
        (_, res, ctx) => res(ctx.json(apRadioDetail))),
      rest.get(
        WifiUrlsInfo.getApRadioCustomization.url,
        (_, res, ctx) => res(ctx.json(apDeviceRadio))),
      rest.get(
        WifiUrlsInfo.getVenueDefaultRegulatoryChannels.url,
        (_, res, ctx) => res(ctx.json(validRadioChannels))),
      rest.get(
        WifiUrlsInfo.getApValidChannel.url,
        (_, res, ctx) => res(ctx.json(validRadioChannels))),
      rest.get(
        WifiUrlsInfo.getVenueRadioCustomization.url,
        (_, res, ctx) => res(ctx.json(venueRadioCustomization))),
      rest.put(
        WifiUrlsInfo.updateApRadioCustomization.url,
        (_, res, ctx) => res(ctx.json({})))
    )
  })
  xit('should render correctly', async () => {
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

    fireEvent.click(await screen.findByRole('tab', { name: '5 GHz' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Lower 5G' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Upper 5G' }))
    fireEvent.click(await screen.findByRole('button', { name: 'DFS' }))
    const transmitSelect = await screen.findByRole('combobox', { name: /Transmit Power/i })
    fireEvent.click(transmitSelect)
    fireEvent.click((await screen.findAllByTitle('Auto'))[0])
    fireEvent.click(await screen.findByRole('button', { name: 'Use Venue Settings' }))

    expect(asFragment()).toMatchSnapshot()
    fireEvent.click(await screen.findByRole('button', { name: 'Apply Radio' }))
  })
  xit('should render correctly with Auto bandwidth', async () => {
    venueRadioCustomization.radioParams50G.channelBandwidth = 'AUTO'
    render(
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

    fireEvent.click(await screen.findByRole('tab', { name: '5 GHz' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Lower 5G' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Upper 5G' }))
    fireEvent.click(await screen.findByRole('button', { name: 'DFS' }))
    const transmitSelect = await screen.findByRole('combobox', { name: /Transmit Power/i })
    fireEvent.click(transmitSelect)
    fireEvent.click((await screen.findAllByTitle('Auto'))[0])
    fireEvent.click(await screen.findByRole('button', { name: 'Use Venue Settings' }))

    fireEvent.click(await screen.findByRole('button', { name: 'Apply Radio' }))
  })
  xit('should render correctly with 40Mhz bandwidth', async () => {
    venueRadioCustomization.radioParams50G.channelBandwidth = '40Mhz'
    render(
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

    fireEvent.click(await screen.findByRole('tab', { name: '5 GHz' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Lower 5G' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Upper 5G' }))
    fireEvent.click(await screen.findByRole('button', { name: 'DFS' }))
    const transmitSelect = await screen.findByRole('combobox', { name: /Transmit Power/i })
    fireEvent.click(transmitSelect)
    fireEvent.click((await screen.findAllByTitle('Auto'))[0])
    fireEvent.click(await screen.findByRole('button', { name: 'Use Venue Settings' }))

    fireEvent.click(await screen.findByRole('button', { name: 'Apply Radio' }))
  })
  xit('should render correctly with 80Mhz bandwidth', async () => {
    venueRadioCustomization.radioParams50G.channelBandwidth = '80Mhz'
    render(
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

    fireEvent.click(await screen.findByRole('tab', { name: '5 GHz' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Lower 5G' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Upper 5G' }))
    fireEvent.click(await screen.findByRole('button', { name: 'DFS' }))
    const transmitSelect = await screen.findByRole('combobox', { name: /Transmit Power/i })
    fireEvent.click(transmitSelect)
    fireEvent.click((await screen.findAllByTitle('Auto'))[0])
    fireEvent.click(await screen.findByRole('button', { name: 'Use Venue Settings' }))

    fireEvent.click(await screen.findByRole('button', { name: 'Apply Radio' }))
  })
  xit('should render correctly with 160Mhz bandwidth', async () => {
    venueRadioCustomization.radioParams50G.channelBandwidth = '160Mhz'
    render(
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

    fireEvent.click(await screen.findByRole('tab', { name: '5 GHz' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Lower 5G' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Upper 5G' }))
    fireEvent.click(await screen.findByRole('button', { name: 'DFS' }))
    const transmitSelect = await screen.findByRole('combobox', { name: /Transmit Power/i })
    fireEvent.click(transmitSelect)
    fireEvent.click((await screen.findAllByTitle('Auto'))[0])
    fireEvent.click(await screen.findByRole('button', { name: 'Use Venue Settings' }))

    fireEvent.click(await screen.findByRole('button', { name: 'Apply Radio' }))
  })
  xit('should render 5GHz channels correctly with MANUAL method', async () => {
    venueRadioCustomization.radioParams50G.channelBandwidth = 'AUTO'
    render(
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

    fireEvent.click(await screen.findByRole('tab', { name: '5 GHz' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Lower 5G' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Upper 5G' }))
    fireEvent.mouseDown(await screen.findByRole('combobox', { name: /channel/i }))
    const option = screen.getByText(/manual/i)
    fireEvent.click(option)
    fireEvent.click(await screen.findByText('36'))

    fireEvent.click(await screen.findByRole('button', { name: 'Apply Radio' }))
  })
  xit('should render 2.4GHz channels correctly with MANUAL method', async () => {
    venueRadioCustomization.radioParams24G.channelBandwidth = 'AUTO'
    render(
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

    fireEvent.click(await screen.findByRole('tab', { name: '2.4 GHz' }))
    fireEvent.mouseDown(await screen.findByRole('combobox', { name: /channel/i }))
    const option = screen.getByText(/manual/i)
    fireEvent.click(option)
    fireEvent.click(await screen.findByText('1'))

    fireEvent.click(await screen.findByRole('button', { name: 'Apply Radio' }))
  })
  it('should render correctly with cancel action', async () => {
    venueRadioCustomization.radioParams50G.channelBandwidth = 'AUTO'
    render(
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

    fireEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
  })
})