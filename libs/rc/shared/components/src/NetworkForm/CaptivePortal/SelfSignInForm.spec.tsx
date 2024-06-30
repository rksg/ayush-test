import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { StepsFormLegacy }                                                    from '@acx-ui/components'
import { Features, useIsSplitOn }                                             from '@acx-ui/feature-toggle'
import { AccessControlUrls, CommonUrlsInfo, TunnelProfileUrls, WifiUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                                                           from '@acx-ui/store'
import { mockServer, render, screen, fireEvent }                              from '@acx-ui/test-utils'
import { UserUrlsInfo }                                                       from '@acx-ui/user'

import {
  venueListResponse,
  networkDeepResponse,
  selfsignData,
  mockNotificationSmsResponse
} from '../__tests__/fixtures'
import { MLOContext }     from '../NetworkForm'
import NetworkFormContext from '../NetworkFormContext'

import { SelfSignInForm } from './SelfSignInForm'

const services = require('@acx-ui/rc/services')

describe('CaptiveNetworkForm-SelfSignIn', () => {
  beforeEach(() => {
    networkDeepResponse.name = 'Self sign in network test'
    const selfSignInRes={ ...networkDeepResponse, enableDhcp: true, type: 'guest',
      guestPortal: selfsignData.guestPortal }
    mockServer.use(
      rest.get(AccessControlUrls.getDevicePolicyList.url,
        (req, res, ctx) => res(ctx.json([]))),
      rest.get(AccessControlUrls.getAppPolicyList.url,
        (_, res, ctx) => res(ctx.json([]))),
      rest.get(AccessControlUrls.getAccessControlProfileList.url,
        (_, res, ctx) => res(ctx.json([]))),
      rest.get(AccessControlUrls.getL2AclPolicyList.url,
        (_, res, ctx) => res(ctx.json([]))),
      rest.get(AccessControlUrls.getL3AclPolicyList.url,
        (_, res, ctx) => res(ctx.json([]))),
      rest.post(TunnelProfileUrls.getTunnelProfileViewDataList.url,
        (_, res, ctx) => res(ctx.json([]))),
      rest.get(UserUrlsInfo.getAllUserSettings.url,
        (_, res, ctx) => res(ctx.json({ COMMON: '{}' }))),
      rest.post(CommonUrlsInfo.getVenuesList.url,
        (_, res, ctx) => res(ctx.json(venueListResponse))),
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
    render(
      <Provider>
        <NetworkFormContext.Provider
          value={{
            editMode: false, cloneMode: true, data: selfsignData
          }}
        >
          <MLOContext.Provider value={{
            isDisableMLO: false,
            disableMLO: jest.fn()
          }}>
            <StepsFormLegacy>
              <StepsFormLegacy.StepForm>
                <SelfSignInForm />
              </StepsFormLegacy.StepForm>
            </StepsFormLegacy>
          </MLOContext.Provider>
        </NetworkFormContext.Provider>
      </Provider>, { route: { params } })
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
    await userEvent.click(await screen.findByText('Add'))
    await userEvent.click(await screen.findByRole('checkbox',
      { name: /Facebook/ }))
    await userEvent.click(await screen.findByText('Add'))
    await userEvent.click(await screen.findByRole('checkbox',
      { name: /Google/ }))
    await userEvent.click(await screen.findByText('Add'))
    await userEvent.click(await screen.findByRole('checkbox',
      { name: /X/ }))
    await userEvent.click(await screen.findByText('Add'))
    await userEvent.click(await screen.findByRole('checkbox',
      { name: /LinkedIn/ }))
    await userEvent.click(await screen.findByText('Add'))
  })
  it('should create Self sign in network successfully', async () => {
    render(<Provider>
      <NetworkFormContext.Provider
        value={{
          editMode: false, cloneMode: false, data: selfsignData
        }}
      >
        <MLOContext.Provider value={{
          isDisableMLO: false,
          disableMLO: jest.fn()
        }}>
          <StepsFormLegacy>
            <StepsFormLegacy.StepForm>
              <SelfSignInForm />
            </StepsFormLegacy.StepForm>
          </StepsFormLegacy>
        </MLOContext.Provider>
      </NetworkFormContext.Provider>
    </Provider>, { route: { params } })
    await userEvent.click(await screen.findByRole('checkbox',
      { name: /SMS Token/ }))
    await userEvent.click(await screen.findByRole('checkbox',
      { name: /Facebook/ }))
    await userEvent.click(await screen.findByRole('checkbox',
      { name: /Google/ }))
    await userEvent.click(await screen.findByRole('checkbox',
      { name: /X/ }))
    await userEvent.click(await screen.findByRole('checkbox',
      { name: /LinkedIn/ }))
    await userEvent.click(await screen.findByText('Add'))
  })
  it('should uncheck and disable SMS Token checkbox when clone network', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.NUVO_SMS_PROVIDER_TOGGLE)
    services.useGetNotificationSmsQuery = jest.fn().mockImplementation(() => {
      return { data: mockNotificationSmsResponse }
    })
    render(<Provider>
      <NetworkFormContext.Provider
        value={{
          editMode: false, cloneMode: true, data: selfsignData
        }}
      >
        <MLOContext.Provider value={{
          isDisableMLO: false,
          disableMLO: jest.fn()
        }}>
          <StepsFormLegacy>
            <StepsFormLegacy.StepForm>
              <SelfSignInForm />
            </StepsFormLegacy.StepForm>
          </StepsFormLegacy>
        </MLOContext.Provider>
      </NetworkFormContext.Provider>
    </Provider>, { route: { params } })
    const formItem = screen.getByRole('checkbox', { name: /SMS Token/ })
    expect(formItem).not.toBeChecked()
    expect(formItem).toBeDisabled()
  })
  it('should be checked and editable SMS Token checkbox when clone network with FF off',
    async () => {
      jest.mocked(useIsSplitOn).mockImplementation(ff => ff !== Features.NUVO_SMS_PROVIDER_TOGGLE)
      services.useGetNotificationSmsQuery = jest.fn().mockImplementation(() => {
        return { data: mockNotificationSmsResponse }
      })
      render(<Provider>
        <NetworkFormContext.Provider
          value={{
            editMode: false, cloneMode: true, data: selfsignData
          }}
        >
          <MLOContext.Provider value={{
            isDisableMLO: false,
            disableMLO: jest.fn()
          }}>
            <StepsFormLegacy>
              <StepsFormLegacy.StepForm>
                <SelfSignInForm />
              </StepsFormLegacy.StepForm>
            </StepsFormLegacy>
          </MLOContext.Provider>
        </NetworkFormContext.Provider>
      </Provider>, { route: { params } })
      const formItem = screen.getByRole('checkbox', { name: /SMS Token/ })
      expect(formItem).toBeChecked()
      expect(formItem).not.toBeDisabled()
    })
  it('should disable SMS Token checkbox when create network', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.NUVO_SMS_PROVIDER_TOGGLE)
    services.useGetNotificationSmsQuery = jest.fn().mockImplementation(() => {
      return { data: mockNotificationSmsResponse }
    })
    render(<Provider>
      <NetworkFormContext.Provider
        value={{
          editMode: false, cloneMode: false, data: selfsignData
        }}
      >
        <MLOContext.Provider value={{
          isDisableMLO: false,
          disableMLO: jest.fn()
        }}>
          <StepsFormLegacy>
            <StepsFormLegacy.StepForm>
              <SelfSignInForm />
            </StepsFormLegacy.StepForm>
          </StepsFormLegacy>
        </MLOContext.Provider>
      </NetworkFormContext.Provider>
    </Provider>, { route: { params } })
    const formItem = screen.getByRole('checkbox', { name: /SMS Token/ })
    expect(formItem).not.toBeChecked()
    expect(formItem).toBeDisabled()
  })
  it('should not disable SMS Token checkbox when edit network', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.NUVO_SMS_PROVIDER_TOGGLE)
    services.useGetNotificationSmsQuery = jest.fn().mockImplementation(() => {
      return { data: mockNotificationSmsResponse }
    })
    render(<Provider>
      <NetworkFormContext.Provider
        value={{
          editMode: true, cloneMode: false, data: selfsignData
        }}
      >
        <MLOContext.Provider value={{
          isDisableMLO: false,
          disableMLO: jest.fn()
        }}>
          <StepsFormLegacy>
            <StepsFormLegacy.StepForm>
              <SelfSignInForm />
            </StepsFormLegacy.StepForm>
          </StepsFormLegacy>
        </MLOContext.Provider>
      </NetworkFormContext.Provider>
    </Provider>, { route: { params } })
    const formItem = screen.getByRole('checkbox', { name: /SMS Token/ })
    expect(formItem).toBeChecked()
    expect(formItem).not.toBeDisabled()
  })
})
