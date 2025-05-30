import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { StepsFormLegacy }                                                                                                         from '@acx-ui/components'
import { CommonUrlsInfo, GuestNetworkTypeEnum, PortalUrlsInfo, WifiUrlsInfo, NetworkSaveData, NetworkTypeEnum, AccessControlUrls } from '@acx-ui/rc/utils'
import { Provider }                                                                                                                from '@acx-ui/store'
import { mockServer, render, screen, fireEvent, waitFor, waitForElementToBeRemoved }                                               from '@acx-ui/test-utils'
import { UserUrlsInfo }                                                                                                            from '@acx-ui/user'

import {
  enhancedLayer2PolicyListResponse,
  enhancedLayer3PolicyListResponse,
  enhancedDevicePolicyListResponse,
  enhancedAccessControlList,
  enhancedApplicationPolicyListResponse
} from '../../policies/AccessControl/__tests__/fixtures'
import {
  venuesResponse,
  venueListResponse,
  networksResponse,
  successResponse,
  networkDeepResponse,
  portalList,
  externalProviders
} from '../__tests__/fixtures'
import { NetworkForm, MLOContext } from '../NetworkForm'
import NetworkFormContext          from '../NetworkFormContext'

import { OnboardingForm } from './OnboardingForm'

async function fillInBeforeSettings (networkName: string) {
  const insertInput = await screen.findByLabelText(/Network Name/)
  fireEvent.change(insertInput, { target: { value: networkName } })
  fireEvent.blur(insertInput)
  const validating = await screen.findByRole('img', { name: 'loading' })
  await waitForElementToBeRemoved(validating, { timeout: 7000 })
  await userEvent.click(await screen.findByRole('button', { name: 'Next' }))
  await waitFor(async () => {
    expect(await screen.findByRole('heading', { level: 3, name: 'Portal Type' })).toBeVisible()
  })
  await userEvent.click(await screen.findByRole('button', { name: 'Next' }))
}
describe('CaptiveNetworkForm-ClickThrough', () => {
  beforeEach(() => {
    networkDeepResponse.name = 'Click through network test'
    const clickThroughData = { ...networkDeepResponse, enableDhcp: true, type: 'guest',
      guestPortal: { redirectUrl: 'dbaidu.com', guestNetworkType: GuestNetworkTypeEnum.ClickThrough
      } }
    mockServer.use(
      rest.get(UserUrlsInfo.getAllUserSettings.url,
        (_, res, ctx) => res(ctx.json({ COMMON: '{}' }))),
      rest.post(CommonUrlsInfo.getVenuesList.url,
        (_, res, ctx) => res(ctx.json(venuesResponse))),
      rest.post(CommonUrlsInfo.getVenuesList.url,
        (_, res, ctx) => res(ctx.json(venueListResponse))),
      rest.post(CommonUrlsInfo.getVMNetworksList.url,
        (_, res, ctx) => res(ctx.json(networksResponse))),
      rest.post(WifiUrlsInfo.addNetworkDeep.url.replace('?quickAck=true', ''),
        (_, res, ctx) => res(ctx.json(successResponse))),
      rest.post(CommonUrlsInfo.getVenuesList.url,
        (_, res, ctx) => res(ctx.json(venueListResponse))),
      rest.get(WifiUrlsInfo.getNetwork.url,
        (_, res, ctx) => res(ctx.json(clickThroughData))),
      rest.get(CommonUrlsInfo.getExternalProviders.url,
        (_, res, ctx) => res(ctx.json(externalProviders))),
      rest.post(PortalUrlsInfo.getEnhancedPortalProfileList.url,
        (_, res, ctx) => res(ctx.json({ content: portalList }))
      ),
      rest.post(PortalUrlsInfo.createPortal.url,
        (_, res, ctx) => res(ctx.json({
          requestId: 'request-id', id: 'test', serviceName: 'test' }))
      ),
      rest.get(PortalUrlsInfo.getPortalLang.url,
        (_, res, ctx) => {
          return res(ctx.json({ acceptTermsLink: 'terms & conditions',
            acceptTermsMsg: 'I accept the' }))
        }),
      // Add missing handlers for enhanced policies
      rest.post(AccessControlUrls.getEnhancedL2AclPolicies.url,
        (_, res, ctx) => res(ctx.json(enhancedLayer2PolicyListResponse))),
      rest.post(AccessControlUrls.getEnhancedL3AclPolicies.url,
        (_, res, ctx) => res(ctx.json(enhancedLayer3PolicyListResponse))),
      rest.post(AccessControlUrls.getEnhancedDevicePolicies.url,
        (_, res, ctx) => res(ctx.json(enhancedDevicePolicyListResponse))),
      rest.post(AccessControlUrls.getEnhancedAccessControlProfiles.url,
        (_, res, ctx) => res(ctx.json(enhancedAccessControlList))),
      rest.post(AccessControlUrls.getEnhancedApplicationPolicies.url,
        (_, res, ctx) => res(ctx.json(enhancedApplicationPolicyListResponse)))
    )
  })

  const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id', action: 'edit' }

  it.skip('should test Click through network successfully', async () => {
    render(<Provider><NetworkForm /></Provider>, { route: { params } })
    await fillInBeforeSettings('Click through network test')

    await userEvent.click(await screen.findByRole('checkbox', { name: /Redirect users to/ }))
    const redirectUrlInput = await screen.findByPlaceholderText('e.g. http://www.example.com')
    fireEvent.change(redirectUrlInput, { target: { value: 'https://www.commscope.com/ruckus/' } })
    await userEvent.click(await screen.findByRole('checkbox', { name: /Redirect users to/ }))
    await userEvent.click(await screen.findByRole('checkbox',
      { name: /Enable RUCKUS DHCP service/ }))
  })

  describe('RedirectUrlInput functionality', () => {
    // Mock data for testing
    const mockNetworkWithRedirectUrl: NetworkSaveData = {
      type: NetworkTypeEnum.CAPTIVEPORTAL,
      guestPortal: {
        redirectUrl: 'http://example.com',
        guestNetworkType: GuestNetworkTypeEnum.ClickThrough
      },
      tenantId: 'tenant-id',
      id: 'network-id'
    }

    const mockNetworkWithoutRedirectUrl: NetworkSaveData = {
      ...mockNetworkWithRedirectUrl,
      guestPortal: {
        ...mockNetworkWithRedirectUrl.guestPortal,
        redirectUrl: undefined
      }
    }

    it('should set redirectCheckbox to true when in edit mode and redirectUrl exists', async () => {
      render(
        <Provider>
          <NetworkFormContext.Provider
            value={{
              editMode: true,
              cloneMode: false,
              data: mockNetworkWithRedirectUrl,
              isRuckusAiMode: false
            }}
          >
            <MLOContext.Provider value={{
              isDisableMLO: false,
              disableMLO: jest.fn()
            }}>
              <StepsFormLegacy>
                <StepsFormLegacy.StepForm>
                  <OnboardingForm />
                </StepsFormLegacy.StepForm>
              </StepsFormLegacy>
            </MLOContext.Provider>
          </NetworkFormContext.Provider>
        </Provider>
      )

      // Check if the redirectCheckbox is checked
      const checkbox = await screen.findByRole('checkbox', { name: /Redirect users to/ })
      await waitFor(() => {
        expect(checkbox).toBeChecked()
      })
    })

    it('should set redirectCheckbox to true when in clone mode and redirectUrl exists',
      async () => {
        render(
          <Provider>
            <NetworkFormContext.Provider
              value={{
                editMode: false,
                cloneMode: true,
                data: mockNetworkWithRedirectUrl,
                isRuckusAiMode: false
              }}
            >
              <MLOContext.Provider value={{
                isDisableMLO: false,
                disableMLO: jest.fn()
              }}>
                <StepsFormLegacy>
                  <StepsFormLegacy.StepForm>
                    <OnboardingForm />
                  </StepsFormLegacy.StepForm>
                </StepsFormLegacy>
              </MLOContext.Provider>
            </NetworkFormContext.Provider>
          </Provider>
        )

        // Check if the redirectCheckbox is checked
        const checkbox = await screen.findByRole('checkbox', { name: /Redirect users to/ })
        await waitFor(() => {
          expect(checkbox).toBeChecked()
        })
      })

    it('should not set redirectCheckbox to true when not in edit or clone mode', async () => {
      render(
        <Provider>
          <NetworkFormContext.Provider
            value={{
              editMode: false,
              cloneMode: false,
              data: mockNetworkWithRedirectUrl,
              isRuckusAiMode: false
            }}
          >
            <MLOContext.Provider value={{
              isDisableMLO: false,
              disableMLO: jest.fn()
            }}>
              <StepsFormLegacy>
                <StepsFormLegacy.StepForm>
                  <OnboardingForm />
                </StepsFormLegacy.StepForm>
              </StepsFormLegacy>
            </MLOContext.Provider>
          </NetworkFormContext.Provider>
        </Provider>
      )

      // Check if the redirectCheckbox is not checked
      const checkbox = await screen.findByRole('checkbox', { name: /Redirect users to/ })
      expect(checkbox).not.toBeChecked()
    })

    it('should not set redirectCheckbox to true when in edit mode but redirectUrl does not exist',
      async () => {
        render(
          <Provider>
            <NetworkFormContext.Provider
              value={{
                editMode: true,
                cloneMode: false,
                data: mockNetworkWithoutRedirectUrl,
                isRuckusAiMode: false
              }}
            >
              <MLOContext.Provider value={{
                isDisableMLO: false,
                disableMLO: jest.fn()
              }}>
                <StepsFormLegacy>
                  <StepsFormLegacy.StepForm>
                    <OnboardingForm />
                  </StepsFormLegacy.StepForm>
                </StepsFormLegacy>
              </MLOContext.Provider>
            </NetworkFormContext.Provider>
          </Provider>
        )

        // Check if the redirectCheckbox is not checked
        const checkbox = await screen.findByRole('checkbox', { name: /Redirect users to/ })
        expect(checkbox).not.toBeChecked()
      })
  })
})
