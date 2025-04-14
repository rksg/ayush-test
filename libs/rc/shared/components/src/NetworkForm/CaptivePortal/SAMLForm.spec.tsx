import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { StepsFormLegacy }        from '@acx-ui/components'
import { useIsSplitOn, Features } from '@acx-ui/feature-toggle'
import { directoryServerApi }     from '@acx-ui/rc/services'
import {
  AaaUrls,
  CommonUrlsInfo,
  GuestNetworkTypeEnum,
  WifiUrlsInfo,
  SamlIdpProfileUrls
} from '@acx-ui/rc/utils'
import { Provider, store }                     from '@acx-ui/store'
import { mockServer, render, screen, waitFor } from '@acx-ui/test-utils'
import { UserUrlsInfo }                        from '@acx-ui/user'

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
  mockSAMLIdpQuery
} from '../__tests__/fixtures'
import { MLOContext }     from '../NetworkForm'
import NetworkFormContext from '../NetworkFormContext'


import { SAMLForm } from './SAMLForm'

describe('CaptiveNetworkForm - SAML', () => {
  const SAMLQueryAPI = jest.fn()
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
      )
    )
  })

  const params = {
    networkId: '5c342542bb824a8b981a9bb041a8a2da',
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
})
