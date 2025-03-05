import userEvent    from '@testing-library/user-event'
import { rest }     from 'msw'
import { Path, To } from 'react-router-dom'

import { networkApi, policyApi, venueApi } from '@acx-ui/rc/services'
import {
  AaaUrls,
  CommonUrlsInfo,
  IdentityProviderTabType,
  IdentityProviderUrls,
  PolicyOperation,
  PolicyType,
  getPolicyRoutePath } from '@acx-ui/rc/utils'
import { Provider, store }            from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'

import { dummayRadiusServiceList, dummyNetworksResult, dummyTableResult, mockedTenantId } from './__tests__/fixtures'

import IdentityProvider from '.'

const mockedUseNavigate = jest.fn()
const mockedTenantPath: Path = {
  pathname: 't/' + mockedTenantId,
  search: '',
  hash: ''
}

const tablePath = '/:tenantId/t/' +
    getPolicyRoutePath({ type: PolicyType.IDENTITY_PROVIDER, oper: PolicyOperation.LIST })

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUseNavigate,
  useTenantLink: (to: To): Path => {
    return { ...mockedTenantPath, pathname: mockedTenantPath.pathname + to }
  }
}))
describe('IdentityProvider', () => {
  const params = { tenantId: '_tenantId_' }

  const mockDeleteFn = jest.fn()

  beforeEach(async () => {

    store.dispatch(networkApi.util.resetApiState())
    store.dispatch(policyApi.util.resetApiState())
    store.dispatch(venueApi.util.resetApiState())
    mockDeleteFn.mockClear()

    mockServer.use(
      rest.post(
        IdentityProviderUrls.getIdentityProviderList.url,
        (_, res, ctx) => res(ctx.json(dummyTableResult))
      ),
      rest.post(
        CommonUrlsInfo.getVMNetworksList.url,
        (_, res, ctx) => res(ctx.json(dummyNetworksResult))
      ),
      rest.post(
        AaaUrls.getAAAPolicyViewModelList.url,
        (_, res, ctx) => res(ctx.json(dummayRadiusServiceList))
      )
    )
  })

  it('should render correctly', async () => {
    render(
      <Provider>
        <IdentityProvider currentTabType={IdentityProviderTabType.Hotspot20}/>
      </Provider>,
      {
        route: { params, path: tablePath }
      }
    )

    // eslint-disable-next-line max-len
    expect(screen.getByRole('button', { name: 'Add HS2.0 IdP' })).toBeVisible()

    const samlTab = screen.getByRole('tab', { name: 'SAML' })
    await userEvent.click(samlTab)
    expect(mockedUseNavigate).toHaveBeenCalledWith({
      pathname: `/${params.tenantId}/t/${getPolicyRoutePath({
        type: PolicyType.SAML_IDP,
        oper: PolicyOperation.LIST
      })}`,
      hash: '',
      search: ''
    })
  })

  it('should render breadcrumb correctly', async () => {

    render(
      <Provider>
        <IdentityProvider currentTabType={IdentityProviderTabType.Hotspot20}/>
      </Provider>, {
        route: { params: { tenantId: mockedTenantId }, path: tablePath }
      }
    )

    expect(await screen.findByText('Network Control')).toBeVisible()
    expect(screen.getByRole('link', { name: 'Policies & Profiles' })).toBeVisible()
  })
})