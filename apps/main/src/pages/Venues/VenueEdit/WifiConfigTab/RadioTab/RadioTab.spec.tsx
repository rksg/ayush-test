import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { useIsSplitOn }                                          from '@acx-ui/feature-toggle'
import { venueApi }                                              from '@acx-ui/rc/services'
import { CommonUrlsInfo, VenueRadioCustomization, WifiUrlsInfo } from '@acx-ui/rc/utils'
import { Provider, store }                                       from '@acx-ui/store'
import { mockServer, screen, render, within, waitFor }           from '@acx-ui/test-utils'

import { VenueEditContext }         from '../..'
import {
  venueData,
  venueSetting,
  validChannelsData,
  venueExternalAntenna,
  radioCustomizationData,
  externalAntennaApModels,
  venueExternalAntennaCap,
  defaultRadioCustomizationData,
  mockLoadBalabcing,
  mockVenueClientAdmissionControl
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
        WifiUrlsInfo.getVenueExternalAntenna.url,
        (_, res, ctx) => res(ctx.json(venueExternalAntenna))),
      rest.get(
        WifiUrlsInfo.getVenueApCapabilities.url,
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
        WifiUrlsInfo.getVenueTripleBandRadioSettings.url,
        (_, res, ctx) => res(ctx.json({ enabled: true }))),
      rest.get(
        WifiUrlsInfo.getDefaultRadioCustomization.url,
        (_, res, ctx) => res(ctx.json(defaultRadioCustomizationData))),
      rest.get(
        WifiUrlsInfo.getVenueRadioCustomization.url,
        (_, res, ctx) => res(ctx.json(radioCustomizationData))),
      rest.get(
        WifiUrlsInfo.getVenueDefaultRegulatoryChannels.url,
        (_, res, ctx) => res(ctx.json(validChannelsData))),
      rest.put(
        WifiUrlsInfo.updateVenueExternalAntenna.url,
        (_, res, ctx) => res(ctx.json({}))),
      rest.put(
        WifiUrlsInfo.updateVenueRadioCustomization.url,
        (_, res, ctx) => res(ctx.json({}))),
      rest.post(
        CommonUrlsInfo.getApsList.url,
        (_, res, ctx) => res(ctx.json({ data: [] }))),
      rest.get(
        WifiUrlsInfo.getVenueLoadBalancing.url,
        (_, res, ctx) => res(ctx.json(mockLoadBalabcing))),
      rest.put(
        WifiUrlsInfo.updateVenueLoadBalancing.url,
        (_, res, ctx) => res(ctx.json({}))),
      rest.get(
        WifiUrlsInfo.getVenueClientAdmissionControl.url,
        (_, res, ctx) => res(ctx.json(mockVenueClientAdmissionControl))),
      rest.put(
        WifiUrlsInfo.updateVenueClientAdmissionControl.url,
        (_, res, ctx) => res(ctx.json({})))
    )
  })
  it.skip('should render External Antenna: E510 correctly', async () => {
    render(<Provider>
      <VenueEditContext.Provider value={{
        editContextData: {},
        setEditContextData: jest.fn(),
        editRadioContextData: {
          apiApModels: externalAntennaApModels,
          apModels: externalAntennaApModels,
          radioData: radioCustomizationData as VenueRadioCustomization
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
  })

  it.skip('should render External Antenna: T350SE & T300E correctly', async () => {
    render(<Provider>
      <VenueEditContext.Provider value={{
        editContextData: {},
        setEditContextData: jest.fn(),
        editRadioContextData: {
          apiApModels: externalAntennaApModels,
          apModels: externalAntennaApModels,
          radioData: radioCustomizationData as VenueRadioCustomization
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
  })

  it.skip('should render Wi-Fi Radio Settings correctly when on/off tri-band button', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)

    render(<Provider>
      <VenueEditContext.Provider value={{
        editContextData: {},
        setEditContextData: jest.fn(),
        editRadioContextData: {
          apiApModels: externalAntennaApModels,
          apModels: externalAntennaApModels,
          radioData: radioCustomizationData as VenueRadioCustomization
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
    // turn off tri-band radio
    await userEvent.click(triBand)

    await section.findByTestId('radio-24g-tab')
    await section.findByTestId('radio-5g-tab')

    // turn on tri-band radio
    await userEvent.click(triBand)
    await section.findByTestId('radio-6g-tab')

    const dual5gBtn = await section.findByRole('radio',
      { name: /Split 5GHz into lower and upper bands/i })

    await userEvent.click(dual5gBtn)
    expect(dual5gBtn).toBeChecked()

    await section.findByTestId('radio-u5g-tab')
    await userEvent.click(await section.findByRole('tab', { name: /Lower 5 GHz/ }))
    await section.findByRole('radio', { name: /Custom Settings/i })

    await section.findByTestId('radio-l5g-tab')
    await userEvent.click(await section.findByRole('tab', { name: /Lower 5 GHz/ }))
    await section.findByRole('radio', { name: /Custom Settings/i })
  })

  it.skip('should render Wi-Fi Radio 24G Settings correctly', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    render(<Provider>
      <VenueEditContext.Provider value={{
        editContextData: {},
        setEditContextData: jest.fn(),
        editRadioContextData: {
          apiApModels: externalAntennaApModels,
          apModels: externalAntennaApModels,
          radioData: radioCustomizationData as VenueRadioCustomization
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

    // radio 2.4g settings
    const tabEl = await section.findByTestId('radio-24g-tab')
    const tab = within(tabEl)

    const channelSelect = await tab.findByRole('combobox', { name: /Channel selection/i })
    await userEvent.click(channelSelect)
    await userEvent.click((await tab.findAllByTitle('Channel Fly'))[0])

    const scanIntervalInput = await tab.findByLabelText('Run background scan every:')
    await userEvent.type(scanIntervalInput, '40')

    const bandwidthSelect = await tab.findByRole('combobox', { name: /Bandwidth/i })
    await userEvent.click(bandwidthSelect)
    await userEvent.click((await screen.findByRole('option', { name: '20 MHz' })))

    const transmitSelect = await tab.findByRole('combobox', { name: /Transmit Power/i })
    await userEvent.click(transmitSelect)
    await userEvent.click((await tab.findAllByTitle('Full'))[0])

    await userEvent.click(await screen.findByRole('button', { name: 'Save' }))

  })

  it.skip('should render Wi-Fi Radio 5G Settings correctly', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    render(<Provider>
      <VenueEditContext.Provider value={{
        editContextData: {},
        setEditContextData: jest.fn(),
        editRadioContextData: {
          apiApModels: externalAntennaApModels,
          apModels: externalAntennaApModels,
          radioData: radioCustomizationData as VenueRadioCustomization
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

    // radio 5g settings
    await userEvent.click(await section.findByRole('tab', { name: /5 GHz/ }))
    const tab5gEl = await section.findByTestId('radio-5g-tab')
    const tab5g = within(tab5gEl)

    const channelSelect5g = await tab5g.findByRole('combobox', { name: /Channel selection/i })
    await userEvent.click(channelSelect5g)
    await userEvent.click((await tab5g.findAllByTitle('Background Scanning'))[0])

    const scanIntervalInput5g = await tab5g.findByLabelText('Run background scan every:')
    await userEvent.type(scanIntervalInput5g, '40')

    const bandwidthSelect5g = await tab5g.findByRole('combobox', { name: /Bandwidth/i })
    await userEvent.click(bandwidthSelect5g)
    await userEvent.click((await screen.findByRole('option', { name: '20 MHz' })))

    const transmitSelect5g = await tab5g.findByRole('combobox', { name: /Transmit Power/i })
    await userEvent.click(transmitSelect5g)
    await userEvent.click((await tab5g.findAllByTitle('Auto'))[0])

    await userEvent.click(await screen.findByRole('button', { name: 'Save' }))
  })

  it('should render Load balabcing correctly', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    render(<Provider>
      <VenueEditContext.Provider value={{
        editContextData: {},
        setEditContextData: jest.fn(),
        editRadioContextData: {
          isLoadBalancingDataChanged: true
        },
        setEditRadioContextData: jest.fn()
      }}>
        <RadioTab />
      </VenueEditContext.Provider>
    </Provider>, { route: { params } })

    // this would only be visible when loader removed
    await waitFor(() => screen.findByText('Use Load Balancing'))

    const loadBalancingEnable = await screen.findByTestId('load-balancing-enabled')
    await userEvent.click(loadBalancingEnable)

    await userEvent.click(await screen.findByRole('button', { name: 'Save' }))
  })

  it('should render Client Admission Control correctly', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    render(<Provider>
      <VenueEditContext.Provider value={{
        editContextData: {},
        setEditContextData: jest.fn(),
        editRadioContextData: {
          isLoadBalancingDataChanged: true
        },
        setEditRadioContextData: jest.fn()
      }}>
        <RadioTab />
      </VenueEditContext.Provider>
    </Provider>, { route: { params } })

    // this would only be visible when loader removed
    await waitFor(() => screen.findByText('Use Load Balancing'))

    const enable24G =
      await screen.findByTestId('client-admission-control-enable-24g')
    const enable50G =
      await screen.findByTestId('client-admission-control-enable-50g')
    await userEvent.click(enable24G)
    await userEvent.click(enable50G)

    await userEvent.click(await screen.findByRole('button', { name: 'Save' }))
  })
})
