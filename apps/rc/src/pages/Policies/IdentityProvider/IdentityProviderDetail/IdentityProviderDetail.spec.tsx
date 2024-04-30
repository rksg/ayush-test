import { rest }     from 'msw'
import { Path, To } from 'react-router-dom'

import { networkApi, policyApi }                                                                 from '@acx-ui/rc/services'
import { CommonUrlsInfo, IdentityProviderUrls, PolicyOperation, PolicyType, getPolicyRoutePath } from '@acx-ui/rc/utils'
import { Provider, store }                                                                       from '@acx-ui/store'
import { mockServer, render, screen, waitFor }                                                   from '@acx-ui/test-utils'

import { dummyNetworksResult, dummyTableResult, mockedPolicyId, mockedTenantId } from '../__tests__/fixtures'

import IdentityProviderDetail from './IdentityProviderDetail'




const mockedUseNavigate = jest.fn()
const mockedTenantPath: Path = {
  pathname: 't/' + mockedTenantId,
  search: '',
  hash: ''
}
const detailPath = '/:tenantId/t/' + getPolicyRoutePath({
  type: PolicyType.IDENTITY_PROVIDER,
  oper: PolicyOperation.DETAIL
})

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUseNavigate,
  useTenantLink: (to: To): Path => {
    return { ...mockedTenantPath, pathname: mockedTenantPath.pathname + to }
  }
}))

describe('IdentityProviderDetail', () => {
  const mockParams = { tenantId: mockedTenantId, policyId: mockedPolicyId }
  const mockDeleteFn = jest.fn()

  beforeEach(async () => {
    store.dispatch(networkApi.util.resetApiState())
    store.dispatch(policyApi.util.resetApiState())
    mockDeleteFn.mockClear()

    mockServer.use(
      rest.post(
        IdentityProviderUrls.getIdentityProviderList.url,
        (_, res, ctx) => res(ctx.json(dummyTableResult))
      ),
      rest.post(
        CommonUrlsInfo.getVMNetworksList.url,
        (_, res, ctx) => res(ctx.json(dummyNetworksResult))
      )
    )
  })

  it('should render successful', async () => {
    render(
      <Provider>
        <IdentityProviderDetail />
      </Provider>, {
        route: { params: mockParams, path: detailPath }
      }
    )

    await waitFor(() => {
      expect(screen.queryByText('HS20 Identity Provider 1')).toBeVisible()
    })

    expect(screen.queryByText('abc.com')).toBeVisible()

    await waitFor(() => {
      expect(screen.queryByText('AAA Network-1')).toBeVisible()
    })
  })
})