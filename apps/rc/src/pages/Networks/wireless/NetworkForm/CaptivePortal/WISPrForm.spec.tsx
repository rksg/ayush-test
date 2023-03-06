import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { StepsForm }                             from '@acx-ui/components'
import { Urls }                                  from '@acx-ui/rbac'
import { CommonUrlsInfo, WifiUrlsInfo }          from '@acx-ui/rc/utils'
import { Provider }                              from '@acx-ui/store'
import { mockServer, render, screen, fireEvent } from '@acx-ui/test-utils'

import {
  venuesResponse,
  venueListResponse,
  networksResponse,
  successResponse,
  networkDeepResponse,
  dhcpResponse,
  externalProviders,
  wisprDataWPA2
} from '../__tests__/fixtures'
import NetworkFormContext from '../NetworkFormContext'

import { WISPrForm } from './WISPrForm'

describe('CaptiveNetworkForm-WISPr', () => {
  beforeEach(() => {
    networkDeepResponse.name = 'WISPr network test'
    const wisprRes={ ...networkDeepResponse, enableDhcp: true, type: 'guest',
      guestPortal: wisprDataWPA2.guestPortal,
      wlan: { ...networkDeepResponse.wlan, ...wisprDataWPA2.wlan } }
    mockServer.use(
      rest.get(Urls.getAllUserSettings.url,
        (_, res, ctx) => res(ctx.json({ COMMON: '{}' }))),
      rest.post(CommonUrlsInfo.getNetworksVenuesList.url,
        (_, res, ctx) => res(ctx.json(venuesResponse))),
      rest.post(CommonUrlsInfo.getVenuesList.url,
        (_, res, ctx) => res(ctx.json(venueListResponse))),
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
      rest.get(CommonUrlsInfo.getCloudpathList.url, (_, res, ctx) =>
        res(ctx.json([]))
      ),
      rest.post(CommonUrlsInfo.getNetworkDeepList.url,
        (_, res, ctx) => res(ctx.json({ response: [wisprRes] })))
    )
  })

  const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id', action: 'edit' }

  it('should test WISPr network successfully', async () => {
    render(<Provider><NetworkFormContext.Provider
      value={{
        editMode: true, cloneMode: true, data: wisprDataWPA2
      }}
    ><StepsForm><StepsForm.StepForm><WISPrForm /></StepsForm.StepForm>
      </StepsForm></NetworkFormContext.Provider></Provider>, { route: { params } })
    await userEvent.click((await screen.findAllByTitle('Select provider'))[0])
    await userEvent.click((await screen.findAllByTitle('Skyfii'))[0])
    await userEvent.click((await screen.findAllByTitle('Select Region'))[0])
    await userEvent.click((await screen.findAllByTitle('Asia'))[0])
    await userEvent.click((await screen.findAllByTitle('Skyfii'))[0])
    await userEvent.click((await screen.findAllByTitle('SkyWifiRadSec'))[0])
    await userEvent.click((await screen.findAllByTitle('SkyWifiRadSec'))[0])
    await userEvent.click((await screen.findAllByTitle('Other provider'))[0])
    const providerNameInput = await screen.findByLabelText(/Provider Name/)
    fireEvent.change(providerNameInput, { target: { value: 'namep1' } })
    fireEvent.blur(providerNameInput)
    await userEvent.click(await screen.findByText('Finish'))
    await userEvent.click(await screen.findByRole('switch'))

    const insertInput = await screen.findByLabelText(/Captive Portal URL/)
    fireEvent.change(insertInput, { target: { value: 'http://ruckus.abc.com' } })
    fireEvent.blur(insertInput)
    await userEvent.click(await screen.findByText('Copy Key'))
    await userEvent.click((await screen.findAllByTitle('WPA2 (Recommended)'))[0])
    await userEvent.click((await screen.findAllByTitle('WEP'))[0])
    const hexKey = await screen.findByLabelText(/Hex Key/)
    fireEvent.change(hexKey, { target: { value: 'be434651bc9e23f2af29fa75f7' } })
    fireEvent.blur(hexKey)
    await userEvent.click(await screen.findByText('Generate'))
    await userEvent.click((await screen.findAllByTitle('WEP'))[0])
    await userEvent.click((await screen.findAllByTitle('WPA3/WPA2 mixed mode'))[0])
    const wpa2Pass = await screen.findByLabelText(/WPA2 Passphrase/)
    fireEvent.change(wpa2Pass, { target: { value: 'wpa233333333' } })
    fireEvent.blur(wpa2Pass)

    const wpa3Pass = await screen.findByLabelText(/WPA3 SAE Passphrase/)
    fireEvent.change(wpa3Pass, { target: { value: 'wpa3xxxxxxxx' } })
    fireEvent.blur(wpa3Pass)

    const walledGarden = await screen.findByLabelText(/Walled Garden/)
    fireEvent.change(walledGarden, { target: { value: 'test123.com' } })
    fireEvent.blur(walledGarden)
    await userEvent.click(await screen.findByRole('checkbox', { name: /Redirect users to/ }))
    const redirectUrlInput = await screen.findByPlaceholderText('e.g. http://www.example.com')
    fireEvent.change(redirectUrlInput, { target: { value: 'https://www.commscope.com/ruckus/' } })
    await userEvent.click(await screen.findByRole('checkbox', { name: /Redirect users to/ }))
    await userEvent.click(await screen.findByRole('checkbox',
      { name: /Enable Ruckus DHCP service/ }))
    await userEvent.click(await screen.findByRole('checkbox',
      { name: /Enable MAC auth bypass/ }))
    // await userEvent.click(await screen.findByText('More details'))
  })
})
