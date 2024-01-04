/* eslint-disable max-len */
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { useIsSplitOn }                                                  from '@acx-ui/feature-toggle'
import { venueApi }                                                      from '@acx-ui/rc/services'
import { CommonUrlsInfo, VenueRadioCustomization, WifiUrlsInfo }         from '@acx-ui/rc/utils'
import { Provider, store }                                               from '@acx-ui/store'
import { mockServer, render, screen, waitForElementToBeRemoved, within } from '@acx-ui/test-utils'

import { VenueEditContext }                                                                                                from '../..'
import { defaultRadioCustomizationData, radioCustomizationData, triBandApCap, validChannelsData, venueData, venueSetting } from '../../../__tests__/fixtures'

import { RadioSettings } from './RadioSettings'




const params = {
  tenantId: 'tenant-id',
  venueId: 'venue-id',
  activeTab: 'wifi',
  activeSubTab: 'radio'
}

describe('Venue Radio Settings', () => {
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
        CommonUrlsInfo.getDashboardOverview.url,
        (_, res, ctx) => res(ctx.json({}))),
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
        (_, res, ctx) => res(ctx.json({ data: [] })))
    )
  })
  it('should render Wi-Fi Radio Settings correctly when on/off tri-band button', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)

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

    const triBand = await screen.findByTestId('tri-band-switch')

    // turn off tri-band radio
    await userEvent.click(triBand)

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
    await screen.findByTestId('radio-6g-tab')

    const dual5gBtn = await screen.findByRole('radio',
      { name: /Split 5GHz into lower and upper bands/i })

    const radio6gBtn = await screen.findByRole('radio',
      { name: /Use 5 and 6 GHz bands/i })

    await userEvent.click(dual5gBtn)
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

    await userEvent.click(radio6gBtn)
    await userEvent.click(await screen.findByRole('tab', { name: /6 GHz/ }))
    const radio6gTabPane = await screen.findByTestId('radio-6g-tab')
    expect(radio6gTabPane).toBeVisible()
    resetDefaultBtn = await within(radio6gTabPane).findByRole('button', { name: /Reset to Default Settings/ } )
    expect(resetDefaultBtn).toBeVisible()
    await userEvent.click(resetDefaultBtn)

  })
})