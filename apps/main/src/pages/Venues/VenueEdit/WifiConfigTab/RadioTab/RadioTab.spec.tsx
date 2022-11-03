import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { useIsSplitOn }                                                     from '@acx-ui/feature-toggle'
import { venueApi }                                                         from '@acx-ui/rc/services'
import { CommonUrlsInfo, VenueDefaultRegulatoryChannelsForm, WifiUrlsInfo } from '@acx-ui/rc/utils'
import { Provider, store }                                                  from '@acx-ui/store'
import { mockServer, screen, render, waitForElementToBeRemoved, fireEvent } from '@acx-ui/test-utils'

import { VenueEditContext }       from '../..'
import {
  venueData,
  venueSetting,
  validChannelsData,
  venueExternalAntenna,
  radioCustomizationData,
  externalAntennaApModels,
  venueExternalAntennaCap,
  defaultRadioCustomizationData
} from '../../../__tests__/fixtures'

import { RadioTab } from './RadioTab'

const params = { venueId: 'venue-id', tenantId: 'tenant-id' }

describe('RadioTab', () => {
  beforeEach(() => {
    store.dispatch(venueApi.util.resetApiState())
    mockServer.use(
      rest.get(
        CommonUrlsInfo.getVenue.url,
        (_, res, ctx) => res(ctx.json(venueData))),
      rest.get(
        WifiUrlsInfo.GetVenueExternalAntenna.url,
        (_, res, ctx) => res(ctx.json(venueExternalAntenna))),
      rest.get(
        WifiUrlsInfo.GetVenueApCapabilities.url,
        (_, res, ctx) => res(ctx.json(venueExternalAntennaCap))),
      rest.get(
        CommonUrlsInfo.getDashboardOverview.url,
        (_, res, ctx) => res(ctx.json({}))),
      rest.get(
        CommonUrlsInfo.getVenue.url,
        (_, res, ctx) => res(ctx.json(venueData))),
      rest.get(
        CommonUrlsInfo.getVenueSettings.url,
        (_, res, ctx) => res(ctx.json(venueSetting))),
      rest.get(
        WifiUrlsInfo.GetVenueTripleBandRadioSettings.url,
        (_, res, ctx) => res(ctx.json({ enabled: true }))),
      rest.get(
        WifiUrlsInfo.GetDefaultRadioCustomization.url,
        (_, res, ctx) => res(ctx.json(defaultRadioCustomizationData))),
      rest.get(
        WifiUrlsInfo.GetVenueRadioCustomization.url,
        (_, res, ctx) => res(ctx.json(radioCustomizationData))),
      rest.get(
        WifiUrlsInfo.GetVenueDefaultRegulatoryChannels.url,
        (_, res, ctx) => res(ctx.json(validChannelsData))),
      rest.put(
        WifiUrlsInfo.UpdateVenueExternalAntenna.url,
        (_, res, ctx) => res(ctx.json({}))),
      rest.put(
        WifiUrlsInfo.UpdateVenueRadioCustomization.url,
        (_, res, ctx) => res(ctx.json({})))
    )
  })
  xit('should render External Antenna: E510 correctly', async () => {
    render(<Provider>
      <VenueEditContext.Provider value={{
        editContextData: {},
        setEditContextData: jest.fn(),
        editRadioContextData: {
          apiApModels: externalAntennaApModels,
          apModels: externalAntennaApModels,
          radioData: radioCustomizationData as VenueDefaultRegulatoryChannelsForm
        },
        setEditRadioContextData: jest.fn()
      }}>
        <RadioTab />
      </VenueEditContext.Provider>
    </Provider>, { route: { params } })

    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    await screen.findByText('No model selected')
    const apModelSelect = screen.getAllByRole('combobox')[3]
    await userEvent.click(apModelSelect)
    await userEvent.click(screen.getByTitle('E510'))
    expect(await screen.findByText('Enable 2.4 GHz:')).toBeVisible()
    expect(await screen.findByText('Enable 5 GHz:')).toBeVisible()

    const toggle24G = screen.getByRole('switch', { name: /Enable 2.4 GHz:/i })
    await userEvent.click(toggle24G)
    expect(await screen.findByText('2.4 GHz Antenna gain:')).toBeVisible()
    const toggle50G = screen.getByRole('switch', { name: /Enable 5 GHz:/i })
    await userEvent.click(toggle50G)
    expect(await screen.findByText('5 GHz Antenna gain:')).toBeVisible()

    const gain24G = screen.getByTestId('gain24G')
    const gain50G = screen.getByTestId('gain50G')
    await userEvent.type(gain24G, '1')
    await userEvent.type(gain50G, '1')
    await userEvent.click(toggle24G)
    await userEvent.click(toggle50G)

    await userEvent.click(apModelSelect)
    await userEvent.click(screen.getByTitle('T350SE'))
    expect(await screen.findByRole('switch', { name: 'Enable:' })).toBeVisible()

    await userEvent.click(apModelSelect)
    await userEvent.click(screen.getByTitle('E510'))
    expect(await screen.findByRole('switch', { name: 'Enable 2.4 GHz:' })).toBeVisible()
    await userEvent.click(await screen.findByRole('switch', { name: 'Enable 2.4 GHz:' }))
    const gain51024G = screen.getByTestId('gain24G')
    expect(gain51024G).toHaveValue('3') // reset to API value
  }, 20000)

  xit('should render External Antenna: T350SE & T300E correctly', async () => {
    render(<Provider>
      <VenueEditContext.Provider value={{
        editContextData: {},
        setEditContextData: jest.fn(),
        editRadioContextData: {
          apiApModels: externalAntennaApModels,
          apModels: externalAntennaApModels,
          radioData: radioCustomizationData as VenueDefaultRegulatoryChannelsForm
        },
        setEditRadioContextData: jest.fn()
      }}>
        <RadioTab />
      </VenueEditContext.Provider>
    </Provider>, { route: { params } })

    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    await screen.findByText('No model selected')
    const apModelSelect = screen.getAllByRole('combobox')[3]
    await userEvent.click(apModelSelect)
    await userEvent.click(screen.getByTitle('T350SE'))
    expect(await screen.findByText('Enable:')).toBeVisible()
    await userEvent.click(screen.getByRole('switch', { name: /Enable:/i }))

    await userEvent.click(apModelSelect)
    await userEvent.click(screen.getByTitle('T300E'))
    expect(await screen.findByText('Enable:')).toBeVisible()
    await userEvent.click(screen.getByRole('switch', { name: /Enable:/i }))

    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
  }, 20000)

  xit('should render Wi-Fi Radio Settings correctly', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    render(<Provider>
      <VenueEditContext.Provider value={{
        editContextData: {},
        setEditContextData: jest.fn(),
        editRadioContextData: {
          apiApModels: externalAntennaApModels,
          apModels: externalAntennaApModels,
          radioData: radioCustomizationData as VenueDefaultRegulatoryChannelsForm
        },
        setEditRadioContextData: jest.fn()
      }}>
        <RadioTab />
      </VenueEditContext.Provider>
    </Provider>, { route: { params } })

    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))

    const triBand = screen.getAllByRole('switch')[0]
    await userEvent.click(triBand)

    const channelSelect = screen.getAllByRole('combobox')[0]
    await userEvent.click(channelSelect)
    await userEvent.click(screen.getAllByTitle('Channel Fly')[0])
    const scanIntervalInput = screen.getAllByLabelText('Run background scan every:')[0]
    fireEvent.change(scanIntervalInput, { target: { value: '40' } })
    const bandwidthSelect = screen.getAllByRole('combobox')[1]
    await userEvent.click(bandwidthSelect)
    await userEvent.click(screen.getAllByTitle('40MHz')[0])
    const transmitSelect = screen.getAllByRole('combobox')[2]
    await userEvent.click(transmitSelect)
    await userEvent.click(screen.getAllByTitle('Auto')[0])
    await userEvent.click(screen.getAllByRole('button', { name: 'Save' })[0])
  }, 20000)
})
