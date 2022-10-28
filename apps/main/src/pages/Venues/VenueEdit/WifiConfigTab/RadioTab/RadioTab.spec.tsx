import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { useSplitTreatment }                                                from '@acx-ui/feature-toggle'
import { venueApi }                                                         from '@acx-ui/rc/services'
import { CommonUrlsInfo, VenueDefaultRegulatoryChannelsForm, WifiUrlsInfo } from '@acx-ui/rc/utils'
import { Provider, store }                                                  from '@acx-ui/store'
import { mockServer, screen, render, within }                               from '@acx-ui/test-utils'

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
  it('should render External Antenna: E510 correctly', async () => {
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

    // this would only be visible when loader removed
    const sectionEl = await screen.findByTestId('external-antenna-section')
    const section = within(sectionEl)

    await section.findByText('No model selected')
    const apModelSelect = await section.findByRole('combobox')
    await userEvent.click(apModelSelect)

    await userEvent.click(await screen.findByTitle('E510'))
    expect(await section.findByText('Enable 2.4 GHz:')).toBeVisible()
    expect(await section.findByText('Enable 5 GHz:')).toBeVisible()

    const toggle24G = await section.findByRole('switch', { name: /Enable 2.4 GHz:/i })
    const toggle50G = await section.findByRole('switch', { name: /Enable 5 GHz:/i })
    await userEvent.click(toggle24G)
    await userEvent.click(toggle50G)

    expect(await section.findAllByRole('spinbutton')).toHaveLength(2)

    const gain24G = await section.findByTestId('gain24G')
    const gain50G = await section.findByTestId('gain50G')
    await userEvent.type(gain24G, '1')
    await userEvent.type(gain50G, '1')
    await userEvent.click(toggle24G)
    await userEvent.click(toggle50G)

    await userEvent.click(apModelSelect)
    await userEvent.click(await screen.findByTitle('T350SE'))
    expect(await section.findByRole('switch', { name: 'Enable:' })).toBeVisible()

    await userEvent.click(apModelSelect)
    await userEvent.click(await screen.findByTitle('E510'))
    expect(await section.findByRole('switch', { name: 'Enable 2.4 GHz:' })).toBeVisible()
    await userEvent.click(await section.findByRole('switch', { name: 'Enable 2.4 GHz:' }))
    const gain51024G = await section.findByTestId('gain24G')
    expect(gain51024G).toHaveValue('3') // reset to API value
  }, 20000)

  it('should render External Antenna: T350SE & T300E correctly', async () => {
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

    // this would only be visible when loader removed
    const sectionEl = await screen.findByTestId('external-antenna-section')
    const section = within(sectionEl)

    await section.findByText('No model selected')
    const apModelSelect = await section.findByRole('combobox')
    await userEvent.click(apModelSelect)
    await userEvent.click(await screen.findByTitle('T350SE'))
    expect(await screen.findByText('Enable:')).toBeVisible()
    await userEvent.click(await screen.findByRole('switch', { name: /Enable:/i }))

    await userEvent.click(apModelSelect)
    await userEvent.click(await screen.findByTitle('T300E'))
    expect(await screen.findByText('Enable:')).toBeVisible()
    await userEvent.click(await screen.findByRole('switch', { name: /Enable:/i }))

    await userEvent.click(await screen.findByRole('button', { name: 'Save' }))
  }, 20000)

  it('should render Wi-Fi Radio Settings correctly', async () => {
    jest.mocked(useSplitTreatment).mockReturnValue(true)
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

    // this would only be visible when loader removed
    const sectionEl = await screen.findByTestId('radio-settings')
    const section = within(sectionEl)

    const triBand = await section.findByRole('switch')
    await userEvent.click(triBand)

    const tabEl = await section.findByTestId('radio-24g-tab')
    const tab = within(tabEl)

    const channelSelect = await tab.findByRole('combobox', { name: /Channel selection/i })
    await userEvent.click(channelSelect)
    await userEvent.click((await screen.findAllByTitle('Channel Fly'))[0])

    const scanIntervalInput = await tab.findByLabelText('Run background scan every:')
    await userEvent.type(scanIntervalInput, '40')
    const bandwidthSelect = await tab.findByRole('combobox', { name: /Bandwidth/i })
    await userEvent.click(bandwidthSelect)
    await userEvent.click((await screen.findAllByTitle('40MHz'))[0])
    const transmitSelect = await screen.findByRole('combobox', { name: /Transmit Power/i })
    await userEvent.click(transmitSelect)
    await userEvent.click((await screen.findAllByTitle('Auto'))[0])
    await userEvent.click(await screen.findByRole('button', { name: 'Save' }))
  }, 20000)
})
