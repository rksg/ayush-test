import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { StepsFormLegacy }                       from '@acx-ui/components'
import { CommonUrlsInfo, WifiUrlsInfo }          from '@acx-ui/rc/utils'
import { Provider }                              from '@acx-ui/store'
import { mockServer, render, screen, fireEvent } from '@acx-ui/test-utils'
import { UserUrlsInfo }                          from '@acx-ui/user'

import {
  venueListResponse,
  networkDeepResponse,
  dhcpResponse,
  selfsignData
} from '../__tests__/fixtures'
import NetworkFormContext from '../NetworkFormContext'

import { SelfSignInForm } from './SelfSignInForm'

describe.skip('CaptiveNetworkForm-SelfSignIn', () => {
  beforeEach(() => {
    networkDeepResponse.name = 'Self sign in network test'
    const selfSignInRes={ ...networkDeepResponse, enableDhcp: true, type: 'guest',
      guestPortal: selfsignData.guestPortal }
    mockServer.use(
      rest.get(UserUrlsInfo.getAllUserSettings.url,
        (_, res, ctx) => res(ctx.json({ COMMON: '{}' }))),
      rest.post(CommonUrlsInfo.getVenuesList.url,
        (_, res, ctx) => res(ctx.json(venueListResponse))),
      rest.get(WifiUrlsInfo.GetDefaultDhcpServiceProfileForGuestNetwork.url,
        (_, res, ctx) => res(ctx.json(dhcpResponse))),
      rest.get(CommonUrlsInfo.getCloudpathList.url,
        (_, res, ctx) => res(ctx.json([]))),
      rest.get(WifiUrlsInfo.getNetwork.url,
        (_, res, ctx) => res(ctx.json(selfSignInRes))),
      rest.post(CommonUrlsInfo.getNetworkDeepList.url,
        (_, res, ctx) => res(ctx.json({ response: [selfSignInRes] })))
    )
  })

  const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id', action: 'edit' }

  it('should test Self sign in network successfully', async () => {
    render(<Provider><NetworkFormContext.Provider
      value={{
        editMode: false, cloneMode: true, data: selfsignData
      }}
    ><StepsFormLegacy><StepsFormLegacy.StepForm><SelfSignInForm /></StepsFormLegacy.StepForm>
      </StepsFormLegacy></NetworkFormContext.Provider></Provider>, { route: { params } })
    await userEvent.click(await screen.findByRole('checkbox',
      { name: /SMS Token/ }))
    await userEvent.click(await screen.findByRole('checkbox',
      { name: /SMS Token/ }))
    await userEvent.click(await screen.findByRole('checkbox', { name: /Allowed Domains/ }))
    await userEvent.click(await screen.findByRole('checkbox', { name: /Allowed Domains/ }))
    const domainsInput = await screen.findByPlaceholderText('Enter domain(s) separated by comma')
    fireEvent.change(domainsInput, { target: { value: 'www.123.com,222.com' } })
    fireEvent.blur(domainsInput)
    await userEvent.click(await screen.findByRole('checkbox', { name: /email addresses of users/ }))
    await userEvent.click(await screen.findByText('Finish'))
    await userEvent.click(await screen.findByRole('checkbox',
      { name: /Facebook/ }))
    await userEvent.click(await screen.findByText('Finish'))
    await userEvent.click(await screen.findByRole('checkbox',
      { name: /Google/ }))
    await userEvent.click(await screen.findByText('Finish'))
    await userEvent.click(await screen.findByRole('checkbox',
      { name: /Twitter/ }))
    await userEvent.click(await screen.findByText('Finish'))
    await userEvent.click(await screen.findByRole('checkbox',
      { name: /LinkedIn/ }))
    await userEvent.click(await screen.findByText('Finish'))
  })
  it('should create Self sign in network successfully', async () => {
    render(<Provider><NetworkFormContext.Provider
      value={{
        editMode: false, cloneMode: false, data: selfsignData
      }}
    ><StepsFormLegacy><StepsFormLegacy.StepForm><SelfSignInForm /></StepsFormLegacy.StepForm>
      </StepsFormLegacy></NetworkFormContext.Provider></Provider>, { route: { params } })
    await userEvent.click(await screen.findByRole('checkbox',
      { name: /SMS Token/ }))
    await userEvent.click(await screen.findByRole('checkbox',
      { name: /Facebook/ }))
    await userEvent.click(await screen.findByRole('checkbox',
      { name: /Google/ }))
    await userEvent.click(await screen.findByRole('checkbox',
      { name: /Twitter/ }))
    await userEvent.click(await screen.findByRole('checkbox',
      { name: /LinkedIn/ }))
    await userEvent.click(await screen.findByText('Finish'))
  })
})
