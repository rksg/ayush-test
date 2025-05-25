/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-len */

import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { StepsFormLegacy }                                                  from '@acx-ui/components'
import { useIsSplitOn }                                                     from '@acx-ui/feature-toggle'
import { CommonUrlsInfo, WifiUrlsInfo, NetworkSaveData, AccessControlUrls } from '@acx-ui/rc/utils'
import { Provider }                                                         from '@acx-ui/store'
import { mockServer, render, screen, fireEvent, waitFor }                   from '@acx-ui/test-utils'
import { UserUrlsInfo }                                                     from '@acx-ui/user'

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
  hostapprovalData
} from '../__tests__/fixtures'
import { MLOContext }     from '../NetworkForm'
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
    const hostDataRes= { ...networkDeepResponse, enableDhcp: true, type: 'guest' as any,
      guestPortal: hostapprovalData.guestPortal }
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
        (_, res, ctx) => res(ctx.json(hostDataRes))),
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

  it('should test Host approval network successfully', async () => {
    render(
      <Provider>
        <NetworkFormContext.Provider
          value={{
            editMode: false, cloneMode: true, data: hostapprovalData, isRuckusAiMode: false
          }}
        >
          <MLOContext.Provider value={{
            isDisableMLO: false,
            disableMLO: jest.fn()
          }}>
            <StepsFormLegacy>
              <StepsFormLegacy.StepForm>
                <HostApprovalForm />
              </StepsFormLegacy.StepForm>
            </StepsFormLegacy>
          </MLOContext.Provider>
        </NetworkFormContext.Provider>
      </Provider>, { route: { params } })

    await userEvent.click(await screen.findByRole('checkbox', { name: /Redirect users to/ }))
    await userEvent.click(await screen.findByRole('checkbox', { name: /Redirect users to/ }))
    const redirectUrlInput = await screen.findByPlaceholderText('e.g. http://www.example.com')
    fireEvent.change(redirectUrlInput, { target: { value: 'https://www.commscope.com/ruckus/' } })
    fireEvent.blur(redirectUrlInput)
    await userEvent.click(await screen.findByRole('checkbox',
      { name: /Enable RUCKUS DHCP service/ }))
    // await userEvent.click(await screen.findByText('More details'))
    const insertInput = await screen.findByPlaceholderText(/Enter domain\(s\) separated by comma/)
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
      <Provider>
        <NetworkFormContext.Provider
          value={{
            editMode: false, cloneMode: false, data: hostapprovalData, isRuckusAiMode: false
          }}
        >
          <MLOContext.Provider value={{
            isDisableMLO: false,
            disableMLO: jest.fn()
          }}>
            <StepsFormLegacy>
              <StepsFormLegacy.StepForm>
                <HostApprovalForm />
              </StepsFormLegacy.StepForm>
            </StepsFormLegacy>
          </MLOContext.Provider>
        </NetworkFormContext.Provider>
      </Provider>
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

  describe('RedirectUrlInput functionality', () => {
    // Mock data for testing
    const mockNetworkWithRedirectUrl: NetworkSaveData = {
      type: 'guest' as any,
      guestPortal: {
        redirectUrl: 'http://example.com',
        ...hostapprovalData.guestPortal
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
                  <HostApprovalForm />
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
                  <HostApprovalForm />
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
                  <HostApprovalForm />
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
                  <HostApprovalForm />
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
