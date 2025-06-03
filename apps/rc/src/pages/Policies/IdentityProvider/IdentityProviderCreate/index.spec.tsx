

import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import * as featureToggle                                                                            from '@acx-ui/feature-toggle'
import { IdentityProviderUrls, PolicyOperation, PolicyType, SamlIdpProfileUrls, getPolicyRoutePath } from '@acx-ui/rc/utils'
import { Provider }                                                                                  from '@acx-ui/store'
import { mockServer, render, screen, waitFor }                                                       from '@acx-ui/test-utils'

import { dummyTableResult, mockedTenantId } from '../__tests__/fixtures'
import { mockedSamlIpdProfileList }         from '../SamlIdpTable/__tests__/fixtures'

import IdentityProviderCreate from '.'

let params: { tenantId: string }
const createViewPath = '/:tenantId/' + getPolicyRoutePath({
  type: PolicyType.SAML_IDP,
  oper: PolicyOperation.CREATE
})

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))
describe('IdentityProviderCreate', () => {
  beforeEach(() => {
    params = {
      tenantId: mockedTenantId
    }

    jest.clearAllMocks()
    ;(featureToggle.useIsSplitOn as jest.Mock).mockReturnValue(true)

    mockServer.use(
      rest.post(IdentityProviderUrls.getIdentityProviderList.url,
        (req, res, ctx) => {
          return res(ctx.status(200), ctx.json(dummyTableResult))
        }
      ),

      rest.post(
        SamlIdpProfileUrls.getSamlIdpProfileViewDataList.url,
        (req, res, ctx) => {
          return res(ctx.json(mockedSamlIpdProfileList))
        }
      )
    )
  })

  afterEach(() => {
    mockedUsedNavigate.mockClear()
  })

  it('should render breadcrumb correctly', async () => {
    render(
      <Provider>
        <IdentityProviderCreate />
      </Provider>
      , { route: { path: createViewPath, params } }
    )
    expect(await screen.findByText('Network Control')).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'Policies & Profiles'
    })).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'Identity Provider'
    })).toBeVisible()
  })

  it('should navigate to SAML IdP creation page when Saml IdP is selected', async () => {
    render(
      <Provider>
        <IdentityProviderCreate />
      </Provider>
      , { route: { path: createViewPath, params } }
    )

    const samlIdpRadio = screen.getByLabelText('SAML IdP')
    userEvent.click(samlIdpRadio)

    const nextButton = screen.getByRole('button', { name: 'Next' })
    userEvent.click(nextButton)

    await waitFor(() => expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/t/policies/samlIdp/add`,
      hash: '',
      search: ''
    }, { state: { from: undefined } }))
  })

  it('samlIdpRadio should be disabled when SAML IdP is not supported', async () => {
    (featureToggle.useIsSplitOn as jest.Mock).mockImplementation((feature) =>
      feature === featureToggle.Features.WIFI_CAPTIVE_PORTAL_SSO_SAML_TOGGLE ? false : true
    )
    render(
      <Provider>
        <IdentityProviderCreate />
      </Provider>
      , { route: { path: createViewPath, params } }
    )

    const samlIdpRadio = screen.getByLabelText('SAML IdP')
    expect(samlIdpRadio).toBeDisabled()
  })

  it('should navigate to policies select page when click on cancel button', async () => {
    render(
      <Provider>
        <IdentityProviderCreate />
      </Provider>
      , { route: { path: createViewPath, params } }
    )

    const cancelButton = screen.getByRole('button', { name: 'Cancel' })
    userEvent.click(cancelButton)

    await waitFor(() => expect(mockedUsedNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/t/policies/select`,
      hash: '',
      search: ''
    }))
  })
})
