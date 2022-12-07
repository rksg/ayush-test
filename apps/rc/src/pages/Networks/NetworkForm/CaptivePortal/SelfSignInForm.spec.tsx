import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { StepsForm }                             from '@acx-ui/components'
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
  selfsignData
} from '../__tests__/fixtures'
import NetworkFormContext from '../NetworkFormContext'

import { SelfSignInForm } from './SelfSignInForm'



describe('CaptiveNetworkForm-SelfSignIn', () => {
  beforeEach(() => {
    networkDeepResponse.name = 'Self sign in network test'
    const selfSignInRes={ ...networkDeepResponse, enableDhcp: true, type: 'guest',
      guestPortal: selfsignData.guestPortal }
    mockServer.use(
      rest.get(CommonUrlsInfo.getAllUserSettings.url,
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
      rest.get(WifiUrlsInfo.getNetwork.url,
        (_, res, ctx) => res(ctx.json(selfSignInRes))),
      rest.post(CommonUrlsInfo.getNetworkDeepList.url,
        (_, res, ctx) => res(ctx.json({ response: [selfSignInRes] })))
    )
  })

  const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id', action: 'edit' }

  it('should test Self sign in network successfully', async () => {
    const { asFragment } = render(<Provider><NetworkFormContext.Provider
      value={{
        editMode: true, cloneMode: true, data: selfsignData
      }}
    ><StepsForm><StepsForm.StepForm><SelfSignInForm /></StepsForm.StepForm>
      </StepsForm></NetworkFormContext.Provider></Provider>, { route: { params } })
    expect(asFragment()).toMatchSnapshot()


    await userEvent.click(await screen.findByRole('checkbox',
      { name: /SMS Token/ }))
    await userEvent.click(await screen.findByText('Finish'))

    await userEvent.click(await screen.findByRole('checkbox',
      { name: /SMS Token/ }))
    await userEvent.click(await screen.findByRole('checkbox', { name: /Allowed Domains/ }))
    const domainsInput = await screen.findByPlaceholderText('Enter domain(s) separated by comma')
    fireEvent.change(domainsInput, { target: { value: 'www.123.com,222.com' } })
    fireEvent.blur(domainsInput)
    await userEvent.click(await screen.findByRole('checkbox', { name: /email addresses of users/ }))
    const rows = await screen.findAllByTitle('settingicon')

    await userEvent.click(await screen.findByText('Finish'))
    fireEvent.click(rows[0])
    await userEvent.click((await screen.findAllByRole('button', { name: 'Cancel' }))[1])
    fireEvent.click(rows[0])
    const facebookId = await screen.findByLabelText(/App ID/)
    fireEvent.change(facebookId, { target: { value: 'facebook' } })
    fireEvent.blur(facebookId)
    const facebookSecret = await screen.findByLabelText(/App Secret/)
    fireEvent.change(facebookSecret, { target: { value: 'facebook' } })
    fireEvent.blur(facebookSecret)
    await userEvent.click(await screen.findByText('See example'))
    await userEvent.click(await screen.findByRole('button', { name: 'OK' }))
    await userEvent.click(await screen.findByText('Copy to clipboard'))
    await userEvent.click(await screen.findByRole('button', { name: 'Save' }))

    await userEvent.click(await screen.findByText('Finish'))
    fireEvent.click(rows[1])
    await userEvent.click((await screen.findAllByRole('button', { name: 'Cancel' }))[1])
    fireEvent.click(rows[1])
    const googleId = (await screen.findAllByLabelText(/Client ID/))[0]
    fireEvent.change(googleId, { target: { value: 'google' } })
    fireEvent.blur(googleId)
    const googleSecret = (await screen.findAllByLabelText(/Client Secret/))[0]
    fireEvent.change(googleSecret, { target: { value: 'google' } })
    fireEvent.blur(googleSecret)
    await userEvent.click(await screen.findByRole('button', { name: 'Save' }))

    await userEvent.click(await screen.findByText('Finish'))
    fireEvent.click(rows[2])
    await userEvent.click((await screen.findAllByRole('button', { name: 'Cancel' }))[1])
    fireEvent.click(rows[2])
    const twitterId = await screen.findByLabelText(/Consumer Key/)
    fireEvent.change(twitterId, { target: { value: 'twitter' } })
    fireEvent.blur(twitterId)
    const twitterSecret = await screen.findByLabelText(/Consumer Secret/)
    fireEvent.change(twitterSecret, { target: { value: 'twitter' } })
    fireEvent.blur(twitterSecret)
    await userEvent.click(await screen.findByRole('button', { name: 'Save' }))

    await userEvent.click(await screen.findByText('Finish'))
    fireEvent.click(rows[3])
    await userEvent.click((await screen.findAllByRole('button', { name: 'Cancel' }))[1])
    fireEvent.click(rows[3])
    const linkedinId = (await screen.findAllByLabelText(/Client ID/))[1]
    fireEvent.change(linkedinId, { target: { value: 'linedin' } })
    fireEvent.blur(linkedinId)
    const linkedinSecret = (await screen.findAllByLabelText(/Client Secret/))[1]
    fireEvent.change(linkedinSecret, { target: { value: 'linkedin' } })
    fireEvent.blur(linkedinSecret)
    await userEvent.click(await screen.findByRole('button', { name: 'Save' }))

    await userEvent.click(await screen.findByRole('checkbox',
      { name: /Facebook/ }))
    await userEvent.click(await screen.findByRole('checkbox',
      { name: /Google/ }))
    await userEvent.click(await screen.findByRole('checkbox',
      { name: /Twitter/ }))
    await userEvent.click(await screen.findByRole('checkbox',
      { name: /LinkedIn/ }))
  })
})
