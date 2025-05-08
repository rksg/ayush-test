import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'


import { StepsFormLegacy }                                                                                     from '@acx-ui/components'
import { directoryServerApi }                                                                                  from '@acx-ui/rc/services'
import { AaaUrls, CommonUrlsInfo, WifiUrlsInfo, DirectoryServerUrls, GuestNetworkTypeEnum, AccessControlUrls } from '@acx-ui/rc/utils'
import { Provider, store }                                                                                     from '@acx-ui/store'
import { mockServer, render, screen, waitFor }                                                                 from '@acx-ui/test-utils'
import { UserUrlsInfo }                                                                                        from '@acx-ui/user'

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
  cloudPathDataNone,
  mockAAAPolicyListResponse,
  mockedCloudPathAuthRadius,
  mockedCloudPathAcctRadius,
  mockedDirectoryServerProfiles
} from '../__tests__/fixtures'
import { MLOContext }     from '../NetworkForm'
import NetworkFormContext from '../NetworkFormContext'

import { DirectoryServerForm } from './DirectoryServerForm'

describe('CaptiveNetworkForm-Directory', () => {
  const directoryServerAPI = jest.fn()

  beforeEach(() => {
    networkDeepResponse.name = 'Directory network test'
    directoryServerAPI.mockClear()
    const wisprRes={ ...networkDeepResponse, enableDhcp: true, type: 'guest',
      guestPortal: {
        ...cloudPathDataNone.guestPortal,
        guestNetworkType: GuestNetworkTypeEnum.Directory
      },
      wlan: { ...networkDeepResponse.wlan, ...cloudPathDataNone.wlan } }
    store.dispatch(directoryServerApi.util.resetApiState())
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
      rest.post(AaaUrls.getAAAPolicyViewModelList.url,
        (req, res, ctx) => res(ctx.json(mockAAAPolicyListResponse))),
      rest.get(WifiUrlsInfo.getNetwork.url,
        (_, res, ctx) => res(ctx.json(wisprRes))),
      rest.get(AaaUrls.getAAAPolicy.url,
        (req, res, ctx) => {
          // eslint-disable-next-line max-len
          return res(ctx.json(req.params.venueId === '21' ? mockedCloudPathAuthRadius : mockedCloudPathAcctRadius))
        }
      ),
      rest.post(DirectoryServerUrls.getDirectoryServerViewDataList.url,
        (_, res, ctx) => {
          directoryServerAPI()
          return res(ctx.json(mockedDirectoryServerProfiles))
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

  const params = {
    networkId: '5c342542bb824a8b981a9bb041a8a2da',
    tenantId: 'tenant-id',
    action: 'edit'
  }

  it('should test edit network successfully', async () => {
    const directoryServerDataRef = { current: { id: '', name: '' } }
    render(
      <Provider>
        <NetworkFormContext.Provider
          value={{
            editMode: true,
            cloneMode: false,
            data: { ...cloudPathDataNone, id: params.networkId },
            isRuckusAiMode: false
          }}
        >
          <MLOContext.Provider value={{
            isDisableMLO: false,
            disableMLO: jest.fn()
          }}>
            <StepsFormLegacy>
              <StepsFormLegacy.StepForm>
                <DirectoryServerForm
                  directoryServerDataRef={directoryServerDataRef}/>
              </StepsFormLegacy.StepForm>
            </StepsFormLegacy>
          </MLOContext.Provider>
        </NetworkFormContext.Provider>
      </Provider>, { route: { params } })
    await waitFor(() => expect(directoryServerAPI).toBeCalled())
    const server = screen.getByTestId('directory-server-select')
    expect(server).toBeInTheDocument()
    await userEvent.click(await screen.findByRole('combobox'))
    expect(await screen.findByRole('option', { name: /ldap-profile1/ })).toBeInTheDocument()
  })

  it('should set redirectCheckbox to true when in edit mode and redirectUrl exists', async () => {
    const directoryServerDataRef = { current: { id: '', name: '' } }
    const dataWithRedirectUrl = {
      ...cloudPathDataNone,
      id: params.networkId,
      guestPortal: {
        ...cloudPathDataNone.guestPortal,
        redirectUrl: 'http://example.com'
      }
    }

    render(
      <Provider>
        <NetworkFormContext.Provider
          value={{
            editMode: true,
            cloneMode: false,
            data: dataWithRedirectUrl,
            isRuckusAiMode: false
          }}
        >
          <MLOContext.Provider value={{
            isDisableMLO: false,
            disableMLO: jest.fn()
          }}>
            <StepsFormLegacy>
              <StepsFormLegacy.StepForm>
                <DirectoryServerForm
                  directoryServerDataRef={directoryServerDataRef}/>
              </StepsFormLegacy.StepForm>
            </StepsFormLegacy>
          </MLOContext.Provider>
        </NetworkFormContext.Provider>
      </Provider>, { route: { params } })

    // Check if the redirectCheckbox is checked
    const checkbox = await screen.findByRole('checkbox', { name: /Redirect users to/ })
    await waitFor(() => {
      expect(checkbox).toBeChecked()
    })
  })

  it('should set redirectCheckbox to true when in clone mode and redirectUrl exists', async () => {
    const directoryServerDataRef = { current: { id: '', name: '' } }
    const dataWithRedirectUrl = {
      ...cloudPathDataNone,
      id: params.networkId,
      guestPortal: {
        ...cloudPathDataNone.guestPortal,
        redirectUrl: 'http://example.com'
      }
    }

    render(
      <Provider>
        <NetworkFormContext.Provider
          value={{
            editMode: false,
            cloneMode: true,
            data: dataWithRedirectUrl,
            isRuckusAiMode: false
          }}
        >
          <MLOContext.Provider value={{
            isDisableMLO: false,
            disableMLO: jest.fn()
          }}>
            <StepsFormLegacy>
              <StepsFormLegacy.StepForm>
                <DirectoryServerForm
                  directoryServerDataRef={directoryServerDataRef}/>
              </StepsFormLegacy.StepForm>
            </StepsFormLegacy>
          </MLOContext.Provider>
        </NetworkFormContext.Provider>
      </Provider>, { route: { params } })

    // Check if the redirectCheckbox is checked
    const checkbox = await screen.findByRole('checkbox', { name: /Redirect users to/ })
    await waitFor(() => {
      expect(checkbox).toBeChecked()
    })
  })

  it('should not set redirectCheckbox to true when not in edit or clone mode', async () => {
    const directoryServerDataRef = { current: { id: '', name: '' } }
    const dataWithRedirectUrl = {
      ...cloudPathDataNone,
      id: params.networkId,
      guestPortal: {
        ...cloudPathDataNone.guestPortal,
        redirectUrl: 'http://example.com'
      }
    }

    render(
      <Provider>
        <NetworkFormContext.Provider
          value={{
            editMode: false,
            cloneMode: false,
            data: dataWithRedirectUrl,
            isRuckusAiMode: false
          }}
        >
          <MLOContext.Provider value={{
            isDisableMLO: false,
            disableMLO: jest.fn()
          }}>
            <StepsFormLegacy>
              <StepsFormLegacy.StepForm>
                <DirectoryServerForm
                  directoryServerDataRef={directoryServerDataRef}/>
              </StepsFormLegacy.StepForm>
            </StepsFormLegacy>
          </MLOContext.Provider>
        </NetworkFormContext.Provider>
      </Provider>, { route: { params } })

    // Check if the redirectCheckbox is not checked
    const checkbox = await screen.findByRole('checkbox', { name: /Redirect users to/ })
    expect(checkbox).not.toBeChecked()
  })
})
