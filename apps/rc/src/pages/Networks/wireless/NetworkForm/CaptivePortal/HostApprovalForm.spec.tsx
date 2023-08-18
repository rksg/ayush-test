import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { StepsFormLegacy }                       from '@acx-ui/components'
import { useIsSplitOn }                          from '@acx-ui/feature-toggle'
import { CommonUrlsInfo, WifiUrlsInfo }          from '@acx-ui/rc/utils'
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
  hostapprovalData
} from '../__tests__/fixtures'
import NetworkFormContext from '../NetworkFormContext'

import { HostApprovalForm } from './HostApprovalForm'

jest.mock('../NetworkMoreSettings/NetworkMoreSettingsForm', () => ({
  ...jest.requireActual('../NetworkMoreSettings/NetworkMoreSettingsForm'),
  __esModule: true,
  NetworkMoreSettingsForm: () => <div data-testid='NetworkMoreSettingsFormTest'></div>
}))


describe('CaptiveNetworkForm-HostApproval', () => {
  beforeEach(() => {
    networkDeepResponse.name = 'Host approval network test'
    const hostDataRes= { ...networkDeepResponse, enableDhcp: true, type: 'guest',
      guestPortal: hostapprovalData.guestPortal }
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
      rest.get(CommonUrlsInfo.getCloudpathList.url, (_, res, ctx) =>
        res(ctx.json([]))
      ),
      rest.get(WifiUrlsInfo.getNetwork.url,
        (_, res, ctx) => res(ctx.json(hostDataRes))),
      rest.post(CommonUrlsInfo.getNetworkDeepList.url,
        (_, res, ctx) => res(ctx.json({ response: [hostDataRes] })))
    )
  })

  const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id', action: 'edit' }

  it('should test Host approval network successfully', async () => {
    render(<Provider><NetworkFormContext.Provider
      value={{
        editMode: false, cloneMode: true, data: hostapprovalData
      }}
    ><StepsFormLegacy><StepsFormLegacy.StepForm><HostApprovalForm /></StepsFormLegacy.StepForm>
      </StepsFormLegacy></NetworkFormContext.Provider></Provider>, { route: { params } })

    await userEvent.click(await screen.findByRole('checkbox', { name: /Redirect users to/ }))
    await userEvent.click(await screen.findByRole('checkbox', { name: /Redirect users to/ }))
    const redirectUrlInput = await screen.findByPlaceholderText('e.g. http://www.example.com')
    fireEvent.change(redirectUrlInput, { target: { value: 'https://www.commscope.com/ruckus/' } })
    fireEvent.blur(redirectUrlInput)
    await userEvent.click(await screen.findByRole('checkbox',
      { name: /Enable RUCKUS DHCP service/ }))
    // await userEvent.click(await screen.findByText('More details'))
    const insertInput = await screen.findByLabelText(/Host Domains/)
    fireEvent.change(insertInput, { target: { value: 'www.123.com,222.com' } })
    fireEvent.blur(insertInput)
    await userEvent.click(await screen.findByRole('checkbox',
      { name: /1 Hour/ }))
    await userEvent.click(await screen.findByRole('checkbox',
      { name: /4 Hours/ }))
    await userEvent.click(await screen.findByRole('checkbox',
      { name: /1 Hour/ }))
    await userEvent.click(await screen.findByRole('checkbox',
      { name: /1 Day/ }))
  })
  it('should create Host approval network successfully', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    render(
      <Provider><NetworkFormContext.Provider
        value={{
          editMode: false, cloneMode: false, data: hostapprovalData
        }}
      ><StepsFormLegacy><StepsFormLegacy.StepForm><HostApprovalForm /></StepsFormLegacy.StepForm>
        </StepsFormLegacy></NetworkFormContext.Provider></Provider>
      , { route: { params } }
    )

    await userEvent.click(await screen.findByRole('checkbox',
      { name: /1 Hour/ }))
    await userEvent.click(await screen.findByRole('checkbox',
      { name: /4 Hours/ }))

    await screen.findByRole('textbox', {
      name: /walled garden clear/i
    })
  })
})
