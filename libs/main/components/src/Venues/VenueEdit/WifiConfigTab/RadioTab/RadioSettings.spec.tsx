/* eslint-disable max-len */
import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import { venueApi }               from '@acx-ui/rc/services'
import {
  CommonUrlsInfo,
  VenueRadioCustomization,
  WifiRbacUrlsInfo,
  WifiUrlsInfo
} from '@acx-ui/rc/utils'
import { Provider, store } from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
  within
} from '@acx-ui/test-utils'

import { VenueUtilityContext } from '..'
import { VenueEditContext }    from '../..'
import {
  defaultRadioCustomizationData,
  radioCustomizationData,
  triBandApCap,
  validChannelsData,
  venueData,
  venueSetting
} from '../../../__tests__/fixtures'

import { RadioSettings } from './RadioSettings'

const params = {
  tenantId: 'tenant-id',
  venueId: 'venue-id',
  activeTab: 'wifi',
  activeSubTab: 'radio'
}

const mockRadioSetting = (
  <VenueUtilityContext.Provider value={{
    venueApCaps: triBandApCap,
    isLoadingVenueApCaps: false
  }}>
    <Form>
      <RadioSettings />
    </Form>
  </VenueUtilityContext.Provider>
)

describe.skip('Venue Radio Settings', () => {
  beforeEach(() => {
    store.dispatch(venueApi.util.resetApiState())
    mockServer.use(
      rest.get(
        CommonUrlsInfo.getVenue.url,
        (_, res, ctx) => res(ctx.json(venueData))),
      rest.get(
        WifiUrlsInfo.getVenueApCapabilities.url,
        (_, res, ctx) => res(ctx.json(triBandApCap))),
      rest.get(
        CommonUrlsInfo.getVenueSettings.url,
        (_, res, ctx) => res(ctx.json(venueSetting))),
      rest.get(
        WifiUrlsInfo.getVenueTripleBandRadioSettings.url,
        (_, res, ctx) => res(ctx.json({ enabled: true }))),
      rest.get(
        WifiUrlsInfo.getDefaultRadioCustomization.url.split('?')[0],
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
      // rbac
      rest.put(
        WifiRbacUrlsInfo.updateVenueExternalAntenna.url,
        (_, res, ctx) => res(ctx.json({})))
    )
  })
  it.skip('should render Wi-Fi Radio Settings correctly when on/off tri-band button', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff !== Features.WIFI_SWITCHABLE_RF_TOGGLE)

    render(<Provider>
      <VenueEditContext.Provider value={{
        editRadioContextData: {
          radioData: radioCustomizationData as VenueRadioCustomization
        },
        setEditContextData: jest.fn(),
        setEditRadioContextData: jest.fn()
      }}>
        <RadioSettings />
      </VenueEditContext.Provider>
    </Provider>, { route: { params } })

    // this would only be visible when loader removed
    await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))
    let resetDefaultBtn

    let triBand = await screen.findByTestId('tri-band-switch')
    await waitFor(() => expect(triBand).toBeChecked())

    let dual5gBtn = await screen.findByRole('radio',
      { name: /Split 5GHz into lower and upper bands/i })
    await waitFor(() => expect(dual5gBtn).toBeChecked())

    let radio6gBtn = await screen.findByRole('radio',
      { name: /Use 5 and 6 GHz bands/i })
    await waitFor(() => expect(radio6gBtn).not.toBeChecked())

    // turn on 6 GHz mode
    await userEvent.click(radio6gBtn)
    expect(radio6gBtn).toBeChecked()
    await waitFor(() => expect(dual5gBtn).not.toBeChecked())

    // turn off tri-band radio
    await userEvent.click(triBand)
    await waitFor(() => expect(triBand).not.toBeChecked())

    await userEvent.click(await screen.findByRole('tab', { name: /2.4 GHz/ }))
    const radio24gTabPane = await screen.findByTestId('radio-24g-tab')
    expect(radio24gTabPane).toBeVisible()
    resetDefaultBtn = await within(radio24gTabPane).findByRole('button', { name: /Reset to Default Settings/ } )
    expect(resetDefaultBtn).toBeVisible()
    await userEvent.click(resetDefaultBtn)

    await userEvent.click(await screen.findByRole('tab', { name: /5 GHz/ }))
    const radio5gTabPane = await screen.findByTestId('radio-5g-tab')
    expect(radio5gTabPane).toBeVisible()
    resetDefaultBtn = await within(radio5gTabPane).findByRole('button', { name: /Reset to Default Settings/ } )
    expect(resetDefaultBtn).toBeVisible()
    await userEvent.click(resetDefaultBtn)

    // turn on tri-band radio
    await userEvent.click(triBand)
    expect(await screen.findByRole('tab', { name: /6 GHz/ })).toBeVisible()
    expect(await screen.findByTestId('radio-6g-tab')).toBeInTheDocument()
    expect(triBand).toBeChecked()

    // turn on dual 5 GHz mode
    dual5gBtn = await screen.findByRole('radio',
      { name: /Split 5GHz into lower and upper bands/i })
    await userEvent.click(dual5gBtn)
    expect(await screen.findByRole('tab', { name: /Upper 5 GHz/ })).toBeVisible()
    expect(await screen.findByRole('tab', { name: /Lower 5 GHz/ })).toBeVisible()
    expect(dual5gBtn).toBeChecked()

    await userEvent.click(await screen.findByRole('tab', { name: /Upper 5 GHz/ }))
    const u5gTabPane = await screen.findByTestId('radio-u5g-tab')
    expect(u5gTabPane).toBeVisible()
    await userEvent.click(await screen.findByRole('radio', { name: /Custom Settings/i }))
    const chMethodCombobox = await within(u5gTabPane).findByRole('combobox', { name: /Channel selection method/ } )
    expect(chMethodCombobox).toBeEnabled()
    resetDefaultBtn = await within(u5gTabPane).findByRole('button', { name: /Reset to Default Settings/ } )
    expect(resetDefaultBtn).toBeVisible()
    await userEvent.click(resetDefaultBtn)

    await userEvent.click(await screen.findByRole('tab', { name: /Lower 5 GHz/ }))
    const l5gTabPane = await screen.findByTestId('radio-l5g-tab')
    expect(l5gTabPane).toBeVisible()
    await userEvent.click(await screen.findByRole('radio', { name: /Custom Settings/i }))

    resetDefaultBtn = await within(l5gTabPane).findByRole('button', { name: /Reset to Default Settings/ } )
    expect(resetDefaultBtn).toBeVisible()
    await userEvent.click(resetDefaultBtn)

    radio6gBtn = await screen.findByRole('radio',
      { name: /Use 5 and 6 GHz bands/i })
    await userEvent.click(radio6gBtn)
    await userEvent.click(await screen.findByRole('tab', { name: /6 GHz/ }))
    const radio6gTabPane = await screen.findByTestId('radio-6g-tab')
    expect(radio6gTabPane).toBeVisible()
    resetDefaultBtn = await within(radio6gTabPane).findByRole('button', { name: /Reset to Default Settings/ } )
    expect(resetDefaultBtn).toBeVisible()
    await userEvent.click(resetDefaultBtn)

  })

  describe('given WIFI_SWITCHABLE_RF_TOGGLE enabled', () => {
    beforeEach(() => {
      jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.WIFI_SWITCHABLE_RF_TOGGLE)

      mockServer.use(
        rest.get(
          CommonUrlsInfo.getVenueApModelBandModeSettings.url,
          (_, res, ctx) => res(ctx.json([{
            model: 'R760',
            bandMode: 'TRIPLE'
          }])))
      )
    })
    it('should render VenueBandManagement correctly', async () => {
      render(<Provider>
        <VenueEditContext.Provider value={{
          editRadioContextData: {
            radioData: radioCustomizationData as VenueRadioCustomization
          },
          setEditContextData: jest.fn(),
          setEditRadioContextData: jest.fn()
        }}>
          { mockRadioSetting }
        </VenueEditContext.Provider>
      </Provider>, { route: { params } })

      // this would only be visible when loader removed
      await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))

      expect(screen.queryByTestId('tri-band-switch')).not.toBeInTheDocument()
      expect(screen.queryByRole('radio',
        { name: /Split 5GHz into lower and upper bands/i })).not.toBeInTheDocument()
      expect(screen.queryByRole('radio',
        { name: /Use 5 and 6 GHz bands/i })).not.toBeInTheDocument()

      expect(await screen.findByRole('tab', { name: /6 GHz/ })).toBeVisible()
      expect(await screen.findByRole('tab', { name: /Upper 5 GHz/ })).toBeVisible()
      expect(await screen.findByRole('tab', { name: /Lower 5 GHz/ })).toBeVisible()

      const addModelBtn = screen.getByRole('button', { name: /Add model/ })
      await waitFor(() => expect(addModelBtn).toBeDisabled())

      const table = screen.getByRole('table')
      const tableRowR760 = await within(table).findByRole('row', { name: /R760/ })
      expect(tableRowR760).toBeVisible()
      expect(within(tableRowR760).getByRole('editBtn')).toBeEnabled()
      expect(within(tableRowR760).getByRole('deleteBtn')).toBeEnabled()

      await userEvent.click(within(tableRowR760).getByRole('editBtn'))
      const VenueBandManagementDrawer = await screen.findByRole('dialog',
        { value: { text: /Wi-Fi Band Management/ } })
      expect(VenueBandManagementDrawer).toBeVisible()

      expect(await within(VenueBandManagementDrawer).findByRole('combobox', { name: /Model/ })).toBeDisabled()

      const bandManagementSelect = await within(VenueBandManagementDrawer).findByRole('combobox', { name: /Band Management/ })
      await userEvent.click(bandManagementSelect)
      expect(await screen.findByRole('option', { name: 'Dual-band' })).toBeInTheDocument()
      expect(await screen.findByRole('option', { name: 'Tri-band' })).toBeInTheDocument()
      expect(await screen.findAllByTitle('Dual-band')).toHaveLength(2)
      expect(await screen.findAllByTitle('Tri-band')).toHaveLength(1)
      await userEvent.click(screen.getByTitle('Tri-band'))
      await waitFor(async () => expect(await screen.findByRole('option',
        { name: 'Tri-band', selected: true })).toBeInTheDocument())
      await userEvent.click(await within(VenueBandManagementDrawer).findByRole('button', { name: /Apply/ }))

      await waitFor(() => expect(VenueBandManagementDrawer).not.toBeVisible())

      await waitFor(() =>
        expect(screen.queryByRole('tab', { name: /Upper 5 GHz/ })).not.toBeInTheDocument())
      await waitFor(() =>
        expect(screen.queryByRole('tab', { name: /Lower 5 GHz/ })).not.toBeInTheDocument())

      await userEvent.click(within(tableRowR760).getByRole('deleteBtn'))
      await waitFor(() =>
        expect(screen.queryByRole('row', { name: /R760/ })).not.toBeInTheDocument())
      await waitFor(() => expect(addModelBtn).toBeEnabled())
    })
    it('should render VenueBandManagement with 6G tab in non-supported country correctly', async () => {
      mockServer.use(
        rest.get(
          WifiUrlsInfo.getVenueDefaultRegulatoryChannels.url,
          (_, res, ctx) => res(ctx.json(Object.fromEntries(
            Object.entries(validChannelsData).filter(([key]) => key !== '6GChannels')))))
      )

      render(<Provider>
        <VenueEditContext.Provider value={{
          editRadioContextData: {
            radioData: radioCustomizationData as VenueRadioCustomization
          },
          setEditContextData: jest.fn(),
          setEditRadioContextData: jest.fn()
        }}>
          { mockRadioSetting }
        </VenueEditContext.Provider>
      </Provider>, { route: { params } })

      // this would only be visible when loader removed
      await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))

      expect(screen.queryByTestId('tri-band-switch')).not.toBeInTheDocument()
      expect(screen.queryByRole('radio',
        { name: /Split 5GHz into lower and upper bands/i })).not.toBeInTheDocument()
      expect(screen.queryByRole('radio',
        { name: /Use 5 and 6 GHz bands/i })).not.toBeInTheDocument()
      expect(screen.queryByRole('tab', { name: /6 GHz/ })).not.toBeInTheDocument()

      expect(await screen.findByRole('tab', { name: /Upper 5 GHz/ })).toBeVisible()
      expect(await screen.findByRole('tab', { name: /Lower 5 GHz/ })).toBeVisible()

      const addModelBtn = screen.getByRole('button', { name: /Add model/ })
      await waitFor(() => expect(addModelBtn).toBeDisabled())

      const table = screen.getByRole('table')
      const tableRowR760 = await within(table).findByRole('row', { name: /R760/ })
      expect(tableRowR760).toBeVisible()
      expect(within(tableRowR760).getByRole('editBtn')).toBeEnabled()
      expect(within(tableRowR760).getByRole('deleteBtn')).toBeEnabled()

      await userEvent.click(within(tableRowR760).getByRole('editBtn'))
      const VenueBandManagementDrawer = await screen.findByRole('dialog',
        { value: { text: /Wi-Fi Band Management/ } })
      expect(VenueBandManagementDrawer).toBeVisible()

      expect(await within(VenueBandManagementDrawer).findByRole('combobox', { name: /Model/ })).toBeDisabled()

      const bandManagementSelect = await within(VenueBandManagementDrawer).findByRole('combobox', { name: /Band Management/ })
      await userEvent.click(bandManagementSelect)
      expect(await screen.findByRole('option', { name: 'Dual-band' })).toBeInTheDocument()
      expect(await screen.findByRole('option', { name: 'Tri-band' })).toBeInTheDocument()
      expect(await screen.findAllByTitle('Dual-band')).toHaveLength(2)
      expect(await screen.findAllByTitle('Tri-band')).toHaveLength(1)
      await userEvent.click(screen.getByTitle('Tri-band'))
      await waitFor(async () => expect(await screen.findByRole('option',
        { name: 'Tri-band', selected: true })).toBeInTheDocument())
      await userEvent.click(await within(VenueBandManagementDrawer).findByRole('button', { name: /Apply/ }))

      await waitFor(() => expect(VenueBandManagementDrawer).not.toBeVisible())

      await waitFor(() =>
        expect(screen.queryByRole('tab', { name: /Upper 5 GHz/ })).not.toBeInTheDocument())
      await waitFor(() =>
        expect(screen.queryByRole('tab', { name: /Lower 5 GHz/ })).not.toBeInTheDocument())

      expect(await screen.findByRole('tab', { name: /6 GHz/ })).toBeVisible()

      await userEvent.click(within(tableRowR760).getByRole('deleteBtn'))
      await waitFor(() =>
        expect(screen.queryByRole('row', { name: /R760/ })).not.toBeInTheDocument())
      await waitFor(() => expect(addModelBtn).toBeEnabled())

      await waitFor(() =>
        expect(screen.queryByRole('tab', { name: /6 GHz/ })).not.toBeInTheDocument())
    })
  })
})
