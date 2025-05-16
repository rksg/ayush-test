import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { StepsFormLegacy }                                                                                                          from '@acx-ui/components'
import { Features, useIsSplitOn }                                                                                                   from '@acx-ui/feature-toggle'
import { directoryServerApi }                                                                                                       from '@acx-ui/rc/services'
import { AaaUrls, CommonUrlsInfo, WifiUrlsInfo, DirectoryServerUrls, GuestNetworkTypeEnum, NetworkTypeEnum, PersonaUrls, DpskUrls } from '@acx-ui/rc/utils'
import { Provider, store }                                                                                                          from '@acx-ui/store'
import { mockServer, render, screen, waitFor }                                                                                      from '@acx-ui/test-utils'
import { UserUrlsInfo }                                                                                                             from '@acx-ui/user'

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
  mockedDirectoryServerProfiles,
  mockIdentityGroupQuery
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
      rest.post(
        PersonaUrls.searchPersonaGroupList.url.split('?')[0],
        (req, res, ctx) => {
          const searchParams = req.url.searchParams
          if (
            searchParams.get('size') === '10000' &&
            searchParams.get('page') === '0' &&
            searchParams.get('sort') === 'name,asc'
          ) {
            return res(ctx.json(mockIdentityGroupQuery))
          }
          return res(ctx.json(mockIdentityGroupQuery))
        }
      ),
      rest.get(
        DpskUrls.getDpsk.url,
        (req, res, ctx) => res(ctx.json({}))
      ),
      rest.get(
        WifiUrlsInfo.queryDpskService.url,
        (_req, res, ctx) => res(ctx.json({}))
      )
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

  it('should render and interact with Identity Group in create mode', async () => {
    // Arrange: Setup ref and context for create mode
    const directoryServerDataRef = { current: { id: '', name: '' } }
    jest.mocked(useIsSplitOn).mockImplementation(ff => {
      return ff === Features.WIFI_IDENTITY_AND_IDENTITY_GROUP_MANAGEMENT_TOGGLE
    })
    render(
      <Provider>
        <NetworkFormContext.Provider
          value={{
            editMode: false,
            cloneMode: false,
            data: { id: 'test-network-id', type: NetworkTypeEnum.CAPTIVEPORTAL }, // Use a type that supports identity group
            isRuckusAiMode: false
          }}
        >
          <MLOContext.Provider value={{
            isDisableMLO: false,
            disableMLO: jest.fn()
          }}>
            <StepsFormLegacy>
              <StepsFormLegacy.StepForm>
                <DirectoryServerForm directoryServerDataRef={directoryServerDataRef}/>
              </StepsFormLegacy.StepForm>
            </StepsFormLegacy>
          </MLOContext.Provider>
        </NetworkFormContext.Provider>
      </Provider>
    )

    // Act: Interact with Identity Group dropdown
    const identityGroupDropdown = screen.queryAllByRole('combobox')
    expect(identityGroupDropdown[1]).toBeInTheDocument()
    await userEvent.click(identityGroupDropdown[1])

    // Select an option (e.g., IG-1)
    const option = await screen.findByText('IG-1')
    await userEvent.click(option)

    // Assert: Association switch should appear
    const associationSwitch = screen.queryByTestId('identity-associate-switch')
    expect(associationSwitch).not.toBeInTheDocument()

    // Assert: 'Associate Identity' button should appear
    const addIdentityButton = screen.queryByTestId('add-identity-button')
    expect(addIdentityButton).not.toBeInTheDocument()
  })

  it('should render and interact with Identity Group in edit mode', async () => {
    // Arrange: Setup ref and context for edit mode
    const directoryServerDataRef = { current: { id: '', name: '' } }
    jest.mocked(useIsSplitOn).mockImplementation(ff => {
      return ff === Features.WIFI_IDENTITY_AND_IDENTITY_GROUP_MANAGEMENT_TOGGLE
    })
    render(
      <Provider>
        <NetworkFormContext.Provider
          value={{
            editMode: true,
            cloneMode: false,
            data: { id: 'test-network-id', type: NetworkTypeEnum.CAPTIVEPORTAL }, // Use a type that supports identity group
            isRuckusAiMode: false
          }}
        >
          <MLOContext.Provider value={{
            isDisableMLO: false,
            disableMLO: jest.fn()
          }}>
            <StepsFormLegacy>
              <StepsFormLegacy.StepForm>
                <DirectoryServerForm directoryServerDataRef={directoryServerDataRef}/>
              </StepsFormLegacy.StepForm>
            </StepsFormLegacy>
          </MLOContext.Provider>
        </NetworkFormContext.Provider>
      </Provider>
    )

    // Act: Interact with Identity Group dropdown
    const identityGroupDropdown = screen.queryAllByRole('combobox')
    expect(identityGroupDropdown[1]).toBeInTheDocument()
    await userEvent.click(identityGroupDropdown[1])

    // Select an option (e.g., IG-1)
    const option = await screen.findByText('IG-1')
    await userEvent.click(option)

    // Assert: Association switch should appear
    const associationSwitch = screen.queryByTestId('identity-associate-switch')
    expect(associationSwitch).not.toBeInTheDocument()

    // Assert: 'Associate Identity' button should appear
    const addIdentityButton = screen.queryByTestId('add-identity-button')
    expect(addIdentityButton).not.toBeInTheDocument()
  })
})