import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { StepsFormLegacy }                       from '@acx-ui/components'
import { AaaUrls, CommonUrlsInfo, WifiUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                              from '@acx-ui/store'
import { mockServer, render, screen, fireEvent } from '@acx-ui/test-utils'
import { UserUrlsInfo }                          from '@acx-ui/user'

import {
  venuesResponse,
  venueListResponse,
  networksResponse,
  successResponse,
  networkDeepResponse,
  dhcpResponse,
  cloudPathDataNone
} from '../__tests__/fixtures'
import NetworkFormContext from '../NetworkFormContext'

import { CloudpathForm } from './CloudpathForm'

describe('CaptiveNetworkForm-Cloudpath', () => {
  beforeEach(() => {
    networkDeepResponse.name = 'Cloudpath network test'
    const wisprRes={ ...networkDeepResponse, enableDhcp: true, type: 'guest',
      guestPortal: cloudPathDataNone.guestPortal,
      wlan: { ...networkDeepResponse.wlan, ...cloudPathDataNone.wlan } }
    mockServer.use(
      rest.get(UserUrlsInfo.getAllUserSettings.url,
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
      rest.get(AaaUrls.getAAAPolicyList.url,
        (_, res, ctx) => res(ctx.json([{ id: '1', name: 'test1' }]))),
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
        editMode: true, cloneMode: true, data: cloudPathDataNone
      }}
    ><StepsFormLegacy><StepsFormLegacy.StepForm><CloudpathForm /></StepsFormLegacy.StepForm>
      </StepsFormLegacy></NetworkFormContext.Provider></Provider>, { route: { params } })
    const insertInput = await screen.findByLabelText(/Enrollment Workflow URL/)
    fireEvent.change(insertInput, { target: { value: 'http://ruckus.abc.com' } })
    fireEvent.blur(insertInput)
    const walledGarden = screen.getByTestId('walled-garden-showed-textarea')
    fireEvent.change(walledGarden, { target: { value: 'test123.com' } })
    fireEvent.blur(walledGarden)
    await userEvent.click(await screen.findByText('Reset to default'))
    await userEvent.click(await screen.findByText('Clear'))
    await userEvent.click(await screen.findByRole('checkbox',
      { name: /Use MAC authentication during reconnection/ }))
    await userEvent.click((await screen.findAllByRole('switch'))[1])
  })
})
