import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { StepsFormLegacy } from '@acx-ui/components'
import {
  CommonUrlsInfo,
  GuestNetworkTypeEnum,
  PortalUrlsInfo,
  WifiUrlsInfo,
  NetworkSaveData,
  AccessControlUrls
} from '@acx-ui/rc/utils'
import { Provider }                                                                  from '@acx-ui/store'
import { mockServer, render, screen, fireEvent, waitFor, waitForElementToBeRemoved } from '@acx-ui/test-utils'
import { UserUrlsInfo }                                                              from '@acx-ui/user'

import {
  enhancedLayer2PolicyListResponse,
  enhancedLayer3PolicyListResponse,
  enhancedDevicePolicyListResponse,
  enhancedAccessControlList
} from '../../policies/AccessControl/__tests__/fixtures'
import {
  venuesResponse,
  venueListResponse,
  networksResponse,
  successResponse,
  networkDeepResponse,
  externalProviders,
  portalList
} from '../__tests__/fixtures'
import { NetworkForm, MLOContext } from '../NetworkForm'
import NetworkFormContext          from '../NetworkFormContext'

import { GuestPassForm } from './GuestPassForm'

async function fillInBeforeSettings (networkName: string) {
  const insertInput = await screen.findByLabelText(/Network Name/)
  fireEvent.change(insertInput, { target: { value: networkName } })
  fireEvent.blur(insertInput)
  const validating = await screen.findByRole('img', { name: 'loading' })
  await waitForElementToBeRemoved(validating, { timeout: 7000 })

  //await userEvent.click(await screen.findByRole('radio', { name: /through a captive portal/ }))
  await userEvent.click(await screen.findByRole('button', { name: 'Next' }))

  await waitFor(async () => {
    expect(await screen.findByRole('heading', { level: 3, name: 'Portal Type' })).toBeVisible()
  })
  //await userEvent.click(await screen.findByRole('radio', { name: /with personal password/ }))
  await userEvent.click(await screen.findByRole('button', { name: 'Next' }))
}

describe('CaptiveNetworkForm-GuestPass', () => {
  beforeEach(() => {
    networkDeepResponse.name = 'Guest Pass network test'
    const guestPassData = { ...networkDeepResponse, enableDhcp: true, type: 'guest', guestPortal: {
      redirectUrl: 'dbaidu.com', guestNetworkType: GuestNetworkTypeEnum.GuestPass
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
        (_, res, ctx) => res(ctx.json(guestPassData))),
      rest.get(CommonUrlsInfo.getExternalProviders.url,
        (_, res, ctx) => res(ctx.json( externalProviders ))),
      rest.post(PortalUrlsInfo.getEnhancedPortalProfileList.url,
        (_, res, ctx) => res(ctx.json({ content: portalList }))),
      // Add missing handlers for enhanced policies
      rest.post(AccessControlUrls.getEnhancedL2AclPolicies.url,
        (_, res, ctx) => res(ctx.json(enhancedLayer2PolicyListResponse))),
      rest.post(AccessControlUrls.getEnhancedL3AclPolicies.url,
        (_, res, ctx) => res(ctx.json(enhancedLayer3PolicyListResponse))),
      rest.post(AccessControlUrls.getEnhancedDevicePolicies.url,
        (_, res, ctx) => res(ctx.json(enhancedDevicePolicyListResponse))),
      rest.post(AccessControlUrls.getEnhancedAccessControlProfiles.url,
        (_, res, ctx) => res(ctx.json(enhancedAccessControlList)))
    )
  })

  const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id', action: 'edit' }

  it.skip('should test Guest pass network successfully', async () => {
    render(<Provider><NetworkForm /></Provider>, { route: { params } })
    await fillInBeforeSettings('Guest Pass network test')

    await userEvent.click(await screen.findByRole('checkbox', { name: /Redirect users to/ }))
    const redirectUrlInput = await screen.findByPlaceholderText('e.g. http://www.example.com')
    fireEvent.change(redirectUrlInput, { target: { value: 'https://www.commscope.com/ruckus/' } })
    await userEvent.click(await screen.findByRole('checkbox',
      { name: /Enable RUCKUS DHCP service/ }))
    // await userEvent.click(await screen.findByText('More details'))
    await userEvent.click(await screen.findByText('Next'))
  })

  describe('RedirectUrlInput functionality', () => {
    // Mock data for testing
    const mockNetworkWithRedirectUrl: NetworkSaveData = {
      type: 'guest',
      guestPortal: {
        redirectUrl: 'http://example.com',
        guestNetworkType: GuestNetworkTypeEnum.GuestPass
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
                  <GuestPassForm />
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

    it('should set redirectCheckbox to true when in clone mode and redirectUrl exists', async () => {
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
                  <GuestPassForm />
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
                  <GuestPassForm />
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

    it('should not set redirectCheckbox to true when in edit mode but redirectUrl does not exist', async () => {
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
                  <GuestPassForm />
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
