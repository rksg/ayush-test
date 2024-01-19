import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { StepsFormLegacy }                                                      from '@acx-ui/components'
import { CommonUrlsInfo, GuestNetworkTypeEnum, WifiUrlsInfo, WlanSecurityEnum } from '@acx-ui/rc/utils'
import { Provider }                                                             from '@acx-ui/store'
import { mockServer, render, screen, fireEvent }                                from '@acx-ui/test-utils'
import { UserUrlsInfo }                                                         from '@acx-ui/user'

import {
  venuesResponse,
  venueListResponse,
  networksResponse,
  successResponse,
  networkDeepResponse,
  dhcpResponse,
  externalProviders
} from '../__tests__/fixtures'
import NetworkFormContext from '../NetworkFormContext'

import { WISPrForm } from './WISPrForm'
const wisprDataWPA2 = {
  guestPortal: {
    guestNetworkType: GuestNetworkTypeEnum.WISPr,
    wisprPage: {
      captivePortalUrl: 'http://aa.bb',
      externalProviderName: 'Select provider',
      authRadius: {},
      accountingRadius: {}
    }
  },
  wlan: {
    bypassCPUsingMacAddressAuthentication: true,
    wlanSecurity: WlanSecurityEnum.None,
    passphrase: 'aaaaaaaaaa'
  }
}
describe.skip('CaptiveNetworkForm-WISPr', () => {
  beforeEach(() => {
    networkDeepResponse.name = 'WISPr network test'
    const wisprRes={ ...networkDeepResponse, enableDhcp: true, type: 'guest',
      guestPortal: wisprDataWPA2.guestPortal,
      wlan: { ...networkDeepResponse.wlan, ...wisprDataWPA2.wlan } }
    mockServer.use(
      rest.get(UserUrlsInfo.getAllUserSettings.url,
        (_, res, ctx) => res(ctx.json({ COMMON: '{}' }))),
      rest.post(CommonUrlsInfo.getNetworksVenuesList.url,
        (_, res, ctx) => res(ctx.json(venuesResponse))),
      rest.post(CommonUrlsInfo.getVMNetworksList.url,
        (_, res, ctx) => res(ctx.json(networksResponse))),
      rest.post(WifiUrlsInfo.addNetworkDeep.url.replace('?quickAck=true', ''),
        (_, res, ctx) => res(ctx.json(successResponse))),
      rest.get(WifiUrlsInfo.GetDefaultDhcpServiceProfileForGuestNetwork.url,
        (_, res, ctx) => res(ctx.json(dhcpResponse))),
      rest.post(CommonUrlsInfo.validateRadius.url,
        (_, res, ctx) => res(ctx.json(successResponse))),
      rest.post(CommonUrlsInfo.getVenuesList.url,
        (_, res, ctx) => res(ctx.json(venueListResponse))),
      rest.get(CommonUrlsInfo.getExternalProviders.url,
        (_, res, ctx) => res(ctx.json( externalProviders ))),
      rest.get(WifiUrlsInfo.getNetwork.url,
        (_, res, ctx) => res(ctx.json(wisprRes))),
      rest.post(CommonUrlsInfo.getNetworkDeepList.url,
        (_, res, ctx) => res(ctx.json({ response: [wisprRes] })))
    )
  })

  const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id', action: 'edit' }

  it('should test WISPr network successfully', async () => {
    render(<Provider><NetworkFormContext.Provider
      value={{
        editMode: false, cloneMode: true, data: wisprDataWPA2
      }}
    ><StepsFormLegacy><StepsFormLegacy.StepForm><WISPrForm /></StepsFormLegacy.StepForm>
      </StepsFormLegacy></NetworkFormContext.Provider></Provider>, { route: { params } })
    await userEvent.click((await screen.findAllByTitle('Select provider'))[0])
    await userEvent.click((await screen.findAllByTitle('Skyfii'))[0])
    await userEvent.click((await screen.findAllByTitle('Select Region'))[0])
    await userEvent.click((await screen.findAllByTitle('Asia'))[0])
    await userEvent.click((await screen.findAllByTitle('Skyfii'))[0])
    await userEvent.click((await screen.findAllByTitle('SkyWifiRadSecTest'))[0])
    await userEvent.click((await screen.findAllByTitle('SkyWifiRadSecTest'))[0])
    await userEvent.click((await screen.findAllByTitle('Custom Provider'))[0])
    const providerNameInput = await screen.findByLabelText(/Provider Name/)
    fireEvent.change(providerNameInput, { target: { value: 'namep1' } })
    fireEvent.blur(providerNameInput)
  })
})
