import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { StepsFormLegacy }                       from '@acx-ui/components'
import { useIsSplitOn, Features }                from '@acx-ui/feature-toggle'
import { directoryServerApi, samlIdpProfileApi } from '@acx-ui/rc/services'
import {
  AaaUrls,
  CommonUrlsInfo,
  GuestNetworkTypeEnum,
  WifiUrlsInfo,
  SamlIdpProfileUrls,
  CertificateUrls,
  NetworkSaveData
} from '@acx-ui/rc/utils'
import { Provider, store }                     from '@acx-ui/store'
import { mockServer, render, screen, waitFor } from '@acx-ui/test-utils'
import { UserUrlsInfo }                        from '@acx-ui/user'

import { certList }     from '../../policies/SamlIdp/__tests__/fixtures'
import {
  cloudPathDataNone,
  mockAAAPolicyListResponse,
  mockedCloudPathAcctRadius,
  mockedCloudPathAuthRadius,
  networkDeepResponse,
  networksResponse,
  successResponse,
  venueListResponse,
  venuesResponse,
  mockSAMLIdpQuery,
  mockSamlA7,
  mockedNetworkId,
  mockedMetadata,
  mockSamlProfileA7Id
} from '../__tests__/fixtures'
import { MLOContext }     from '../NetworkForm'
import NetworkFormContext from '../NetworkFormContext'


import { SAMLForm } from './SAMLForm'

describe('CaptiveNetworkForm - SAML', () => {
  const SAMLQueryAPI = jest.fn()
  const mockCreateSamlIdpProfile = jest.fn()
  beforeEach(() => {
    networkDeepResponse.name = 'SAML network test'
    SAMLQueryAPI.mockClear()
    const wisprRes = {
      ...networkDeepResponse,
      enableDhcp: true,
      type: 'guest',
      guestPortal: {
        ...cloudPathDataNone.guestPortal,
        guestNetworkType: GuestNetworkTypeEnum.SAML
      },
      wlan: { ...networkDeepResponse.wlan, ...cloudPathDataNone.wlan }
    }
    store.dispatch(directoryServerApi.util.resetApiState())
    mockServer.use(
      rest.get(UserUrlsInfo.getAllUserSettings.url, (_, res, ctx) =>
        res(ctx.json({ COMMON: '{}' }))
      ),
      rest.post(CommonUrlsInfo.getVenuesList.url, (_, res, ctx) =>
        res(ctx.json(venuesResponse))
      ),
      rest.post(CommonUrlsInfo.getVenuesList.url, (_, res, ctx) =>
        res(ctx.json(venueListResponse))
      ),
      rest.post(CommonUrlsInfo.getVMNetworksList.url, (_, res, ctx) =>
        res(ctx.json(networksResponse))
      ),
      rest.post(
        WifiUrlsInfo.addNetworkDeep.url.replace('?quickAck=true', ''),
        (_, res, ctx) => res(ctx.json(successResponse))
      ),
      rest.post(CommonUrlsInfo.getVenuesList.url, (_, res, ctx) =>
        res(ctx.json(venueListResponse))
      ),
      rest.post(AaaUrls.getAAAPolicyViewModelList.url, (_, res, ctx) =>
        res(ctx.json(mockAAAPolicyListResponse))
      ),
      rest.get(WifiUrlsInfo.getNetwork.url, (_, res, ctx) =>
        res(ctx.json(wisprRes))
      ),
      rest.get(AaaUrls.getAAAPolicy.url, (req, res, ctx) => {
        // eslint-disable-next-line max-len
        return res(
          ctx.json(
            req.params.venueId === '21'
              ? mockedCloudPathAuthRadius
              : mockedCloudPathAcctRadius
          )
        )
      }),
      rest.post(
        SamlIdpProfileUrls.getSamlIdpProfileViewDataList.url,
        (_, res, ctx) => {
          SAMLQueryAPI()
          return res(ctx.json(mockSAMLIdpQuery))
        }
      ),

      rest.get(
        SamlIdpProfileUrls.getSamlIdpProfile.url,
        (_, res, ctx) => {
          return res(ctx.json(mockSamlA7))
        }
      ),
      rest.post(
        CertificateUrls.getServerCertificates.url,
        (_, res, ctx) => res(ctx.json(certList))
      ),
      rest.post(
        SamlIdpProfileUrls.createSamlIdpProfile.url,
        (_, res, ctx) => {
          mockCreateSamlIdpProfile()
          return res(ctx.json({
            response: {
              id: mockSamlProfileA7Id
            }
          }))
        }
      )
    )
  })

  const params = {
    networkId: mockedNetworkId,
    tenantId: 'tenant-id',
    action: 'edit'
  }

  it('should test edit network successfully', async () => {
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
          <MLOContext.Provider
            value={{
              isDisableMLO: false,
              disableMLO: jest.fn()
            }}
          >
            <StepsFormLegacy>
              <StepsFormLegacy.StepForm>
                <SAMLForm />
              </StepsFormLegacy.StepForm>
            </StepsFormLegacy>
          </MLOContext.Provider>
        </NetworkFormContext.Provider>
      </Provider>,
      { route: { params } }
    )
    await waitFor(() => expect(SAMLQueryAPI).toBeCalled())
    const saml = screen.getByTestId('saml-idp-profile-select')
    expect(saml).toBeInTheDocument()
    await userEvent.click(await screen.findByRole('combobox'))
    expect(
      await screen.findByRole('option', { name: /SAML-A7/ })
    ).toBeInTheDocument()

    store.dispatch(
      samlIdpProfileApi.util.invalidateTags([
        { type: 'SamlIdpProfile', id: 'LIST' }
      ])
    )

    await waitFor(() => expect(SAMLQueryAPI).toBeCalledTimes(2))
    await userEvent.click(saml)
    await userEvent.click(await screen.findByText('SAML-A4'))

    // find  view Details button
    const viewDetailButton = screen.getByRole('button', {
      name: 'View Details'
    })
    //click view detail button
    await userEvent.click(viewDetailButton)

  })

  it('should handle empty SAML IDP profile list', async () => {
    mockServer.use(
      rest.post(
        SamlIdpProfileUrls.getSamlIdpProfileViewDataList.url,
        (_, res, ctx) => {
          SAMLQueryAPI()
          return res(ctx.json({ data: [], totalCount: 0 }))
        }
      )
    )

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
          <MLOContext.Provider
            value={{
              isDisableMLO: false,
              disableMLO: jest.fn()
            }}
          >
            <StepsFormLegacy>
              <StepsFormLegacy.StepForm>
                <SAMLForm />
              </StepsFormLegacy.StepForm>
            </StepsFormLegacy>
          </MLOContext.Provider>
        </NetworkFormContext.Provider>
      </Provider>,
      { route: { params } }
    )

    await waitFor(() => expect(SAMLQueryAPI).toBeCalled())
    const saml = screen.getByTestId('saml-idp-profile-select')
    expect(saml).toBeInTheDocument()
    await userEvent.click(await screen.findByRole('combobox'))
    expect(screen.queryByRole('option')).not.toBeInTheDocument()
  })

  it('should handle API error when fetching SAML IDP profiles', async () => {
    mockServer.use(
      rest.post(
        SamlIdpProfileUrls.getSamlIdpProfileViewDataList.url,
        (_, res, ctx) => {
          SAMLQueryAPI()
          return res(ctx.status(500))
        }
      )
    )

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
          <MLOContext.Provider
            value={{
              isDisableMLO: false,
              disableMLO: jest.fn()
            }}
          >
            <StepsFormLegacy>
              <StepsFormLegacy.StepForm>
                <SAMLForm />
              </StepsFormLegacy.StepForm>
            </StepsFormLegacy>
          </MLOContext.Provider>
        </NetworkFormContext.Provider>
      </Provider>,
      { route: { params } }
    )

    await waitFor(() => expect(SAMLQueryAPI).toBeCalled())
    const saml = screen.getByTestId('saml-idp-profile-select')
    expect(saml).toBeInTheDocument()
  })

  it('should handle selection of SAML IDP profile', async () => {
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
          <MLOContext.Provider
            value={{
              isDisableMLO: false,
              disableMLO: jest.fn()
            }}
          >
            <StepsFormLegacy>
              <StepsFormLegacy.StepForm>
                <SAMLForm />
              </StepsFormLegacy.StepForm>
            </StepsFormLegacy>
          </MLOContext.Provider>
        </NetworkFormContext.Provider>
      </Provider>,
      { route: { params } }
    )

    await waitFor(() => expect(SAMLQueryAPI).toBeCalled())
    await userEvent.click(await screen.findByRole('combobox'))
    const option = await screen.findByRole('option', { name: /SAML-A7/ })
    await userEvent.click(option)
    expect(option).toBeInTheDocument()
  })

  it('should make WalledGarden required when SAML toggle is true', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff =>
      ff === Features.WIFI_CAPTIVE_PORTAL_SSO_SAML_TOGGLE)

    render(WalledGardenTextAreaEmptyTestCase(), { route: { params } })

    const addButton = await screen.findAllByRole('button', { name: 'Add' })
    await userEvent.click(addButton[1])
    expect(await screen.findByText('Walled Garden is required')).toBeVisible()
  })

  it('should not make WalledGarden required when SAML toggle is false', async () => {

    render(WalledGardenTextAreaEmptyTestCase(), { route: { params } })

    const addButton = await screen.findAllByRole('button', { name: 'Add' })
    await userEvent.click(addButton[1])
    expect(screen.queryByText('Walled Garden is required')).toBeNull()

  })

  function WalledGardenTextAreaEmptyTestCase () {
    const network = {
      ...cloudPathDataNone,
      guestPortal: {
        ...cloudPathDataNone.guestPortal,
        walledGardens: []
      }
    }

    return (<Provider>
      <NetworkFormContext.Provider
        value={{
          editMode: true,
          cloneMode: false,
          data: network,
          isRuckusAiMode: false
        }}
      >
        <MLOContext.Provider
          value={{
            isDisableMLO: false,
            disableMLO: jest.fn()
          }}
        >
          <StepsFormLegacy>
            <StepsFormLegacy.StepForm>
              <SAMLForm />
            </StepsFormLegacy.StepForm>
          </StepsFormLegacy>
        </MLOContext.Provider>
      </NetworkFormContext.Provider>
    </Provider>)
  }

  it('should test add saml drawer successfully', async () => {
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
          <MLOContext.Provider
            value={{
              isDisableMLO: false,
              disableMLO: jest.fn()
            }}
          >
            <StepsFormLegacy>
              <StepsFormLegacy.StepForm>
                <SAMLForm />
              </StepsFormLegacy.StepForm>
            </StepsFormLegacy>
          </MLOContext.Provider>
        </NetworkFormContext.Provider>
      </Provider>,
      { route: { params } }
    )
    await waitFor(() => expect(SAMLQueryAPI).toBeCalled())
    const addButton = screen.getByTestId('saml-idp-profile-add-button')
    await userEvent.click(addButton)

    // test Close button
    const closeButton = screen.getByRole('button', { name: 'Close' })
    await userEvent.click(closeButton)

    // test Cancel button
    await userEvent.click(addButton)
    const cancelButton = (await screen.findAllByRole('button', { name: 'Cancel' }))[1]
    await userEvent.click(cancelButton)

    //Test callback function
    await userEvent.click(addButton)
    // wait for "Add SAML IdP Profile" in the screen
    const drawerTitle = await screen.findByText('Add SAML Identity Provider')
    expect(drawerTitle).toBeInTheDocument()
    const policyNameField = screen.getByRole('textbox', { name: 'Profile Name' })
    await userEvent.type(policyNameField, 'Test Profile Name')

    // Find metadata textarea and input
    const metadataField = screen.getByTestId('metadata-textarea')
    await userEvent.type(metadataField, mockedMetadata)
    // find all add button
    const drawerAddButton = (await screen.findAllByRole('button', { name: 'Add' }))[2]
    await userEvent.click(drawerAddButton)

    await waitFor(() => expect(mockCreateSamlIdpProfile).toHaveBeenCalled())
    await waitFor(() => expect(SAMLQueryAPI).toBeCalledTimes(3))

    expect(await screen.findByText('SAML-A7')).toBeInTheDocument()
  })

  describe('RedirectUrlInput functionality', () => {
    // Mock data for testing
    const mockNetworkWithRedirectUrl: NetworkSaveData = {
      type: 'guest',
      guestPortal: {
        redirectUrl: 'http://example.com',
        guestNetworkType: GuestNetworkTypeEnum.SAML
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
            <MLOContext.Provider
              value={{
                isDisableMLO: false,
                disableMLO: jest.fn()
              }}
            >
              <StepsFormLegacy>
                <StepsFormLegacy.StepForm>
                  <SAMLForm />
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
    // eslint-disable-next-line max-len
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
            <MLOContext.Provider
              value={{
                isDisableMLO: false,
                disableMLO: jest.fn()
              }}
            >
              <StepsFormLegacy>
                <StepsFormLegacy.StepForm>
                  <SAMLForm />
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
            <MLOContext.Provider
              value={{
                isDisableMLO: false,
                disableMLO: jest.fn()
              }}
            >
              <StepsFormLegacy>
                <StepsFormLegacy.StepForm>
                  <SAMLForm />
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
    // eslint-disable-next-line max-len
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
            <MLOContext.Provider
              value={{
                isDisableMLO: false,
                disableMLO: jest.fn()
              }}
            >
              <StepsFormLegacy>
                <StepsFormLegacy.StepForm>
                  <SAMLForm />
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
