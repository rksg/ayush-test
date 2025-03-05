/* eslint-disable max-len */
import userEvent    from '@testing-library/user-event'
import { rest }     from 'msw'
import { Path, To } from 'react-router-dom'

import { networkApi, policyApi, venueApi } from '@acx-ui/rc/services'
import {
  getPolicyRoutePath,
  PolicyOperation,
  PolicyType,
  CommonUrlsInfo,
  IdentityProviderUrls,
  AaaUrls
} from '@acx-ui/rc/utils'
import { Provider, store } from '@acx-ui/store'
import {
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'

import {
  dummayRadiusServiceList,
  dummyNetworksResult,
  dummyTableResult,
  mockedTenantId
} from '../__tests__/fixtures'

import IdentityProviderTable from './IdentityProviderTable'

const mockedUseNavigate = jest.fn()
const mockedTenantPath: Path = {
  pathname: 't/' + mockedTenantId,
  search: '',
  hash: ''
}

const tablePath = '/:tenantId/t/' + getPolicyRoutePath({ type: PolicyType.IDENTITY_PROVIDER, oper: PolicyOperation.LIST })

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUseNavigate,
  useTenantLink: (to: To): Path => {
    return { ...mockedTenantPath, pathname: mockedTenantPath.pathname + to }
  }
}))

describe('IdentityProviderTable', () => {
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
      ),
      rest.delete(
        IdentityProviderUrls.deleteIdentityProvider.url,
        (_, res, ctx) => {
          mockDeleteFn()
          return res(ctx.status(202))
        }
      )
    )
  })

  it('should render table', async () => {
    render(
      <Provider>
        <IdentityProviderTable />
      </Provider>, {
        route: { params: { tenantId: mockedTenantId }, path: tablePath }
      }
    )

    const targetName = dummyTableResult.data[0].naiRealms[0].name
    const row1 = await screen.findByText(targetName)
    await userEvent.click(row1)

    let editButton = await screen.findByText('Edit')
    expect(editButton).toBeInTheDocument()
    let deleteButton = await screen.findByText('Delete')
    expect(deleteButton).toBeInTheDocument()

    //await userEvent.click(deleteButton)
    //const dialog = await screen.findByRole('dialog')
    //expect(dialog).toBeInTheDocument()
  })
})
