import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'
import { Path }  from 'react-router-dom'

import {
  AaaUrls,
  CertificateUrls,
  CommonUrlsInfo,
  getPolicyDetailsLink,
  getPolicyRoutePath,
  IdentityProviderUrls,
  PolicyOperation,
  PolicyType
} from '@acx-ui/rc/utils'
import { Provider } from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitFor,
  within
} from '@acx-ui/test-utils'

import AAATable from './AAATable'

const mockTableResult = {
  totalCount: 3,
  data: [{
    id: 'cc080e33-26a7-4d34-870f-b7f312fcfccb',
    name: 'My AAA Server 1',
    type: 'AUTHENTICATION',
    primary: '35.195.204.77:1812'
  },
  {
    id: 'abcdeefwef-26a7-4d34-870f-b7f312fcfccb',
    name: 'Test AAA Server',
    type: 'AUTHENTICATION',
    primary: '34.72.60.107:1811',
    networkIds: ['123', '456']
  },
  {
    id: '637f6dc0-26e2-4498-9c3c-594c51840112',
    name: 'Test HS20 AAA Server',
    type: 'AUTHENTICATION',
    primary: '34.72.60.108:1811',
    hotspot20IdentityProviderIds: ['789', '012']
  },
  {
    id: '485617d8-816c-493e-9854-fc6126f7e83d',
    name: 'Test RadSec AAA Server',
    type: 'AUTHENTICATION',
    primary: '34.72.60.108:1811',
    radSecOptions: {
      tlsEnabled: true,
      certificateAuthorityId: '2ce780df-fd3f-4b22-b9d0-deefed397410',
      clientCertificateId: ''
    },
    networkIds: ['761474080cd64bfcb5f7-5550d68e802f', 'c1972b49-3d38-432b-a43f-6fa2aacfd5d6']
  }]
}


const mockedUseNavigate = jest.fn()
const mockedTenantPath: Path = {
  pathname: 't/__tenantId__',
  search: '',
  hash: ''
}
const state= {
  networkIds: ['761474080cd64bfcb5f7-5550d68e802f', 'c1972b49-3d38-432b-a43f-6fa2aacfd5d6']
}

jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUseNavigate,
  useTenantLink: (): Path => mockedTenantPath
}))

describe('AAATable', () => {
  const params = {
    tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
  }

  // eslint-disable-next-line max-len
  const tablePath = '/:tenantId/' + getPolicyRoutePath({ type: PolicyType.AAA, oper: PolicyOperation.LIST })

  beforeEach(async () => {
    mockServer.use(
      rest.post(
        AaaUrls.getAAAPolicyViewModelList.url,
        (req, res, ctx) => res(ctx.json({ ...mockTableResult }))
      ),
      rest.post(CommonUrlsInfo.getVMNetworksList.url,
        (_, res, ctx) => res(ctx.json({
          data: [],
          totalCount: 0
        }))
      ),
      rest.post(
        IdentityProviderUrls.getIdentityProviderList.url,
        (req, res, ctx) => res(ctx.json({}))
      ),
      rest.post(
        CertificateUrls.getCAs.url,
        (req, res, ctx) => res(ctx.json({}))
      ),
      rest.post(
        CertificateUrls.getCertificateList.url,
        (req, res, ctx) => res(ctx.json({}))
      )
    )
  })

  it('should render table', async () => {
    render(
      <Provider>
        <AAATable />
      </Provider>, {
        route: { params, path: tablePath }
      }
    )

    const targetName = mockTableResult.data[0].name
    expect(await screen.findByRole('button', { name: /Add RADIUS Server/i })).toBeVisible()
    expect(await screen.findByRole('row', { name: new RegExp(targetName) })).toBeVisible()
  })

  it('should render breadcrumb correctly', async () => {
    render(
      <Provider>
        <AAATable />
      </Provider>, {
        route: { params, path: tablePath }
      }
    )
    expect(await screen.findByText('Network Control')).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'Policies & Profiles'
    })).toBeVisible()
  })

  it('should delete selected row', async () => {
    const deleteFn = jest.fn()

    mockServer.use(
      rest.delete(
        AaaUrls.deleteAAAPolicyList.url,
        (req, res, ctx) => {
          deleteFn(req.body)
          return res(ctx.json({ requestId: '12345' }))
        }
      )
    )

    render(
      <Provider>
        <AAATable />
      </Provider>, {
        route: { params, path: tablePath }
      }
    )

    const target = mockTableResult.data[0]
    const row = await screen.findByRole('row', { name: new RegExp(target.name) })
    await userEvent.click(within(row).getByRole('checkbox'))

    await userEvent.click(screen.getByRole('button', { name: /Delete/ }))

    const dialog = await screen.findByRole('dialog')
    expect(await screen.findByText('Delete "' + target.name + '"?')).toBeVisible()

    await userEvent.click(await screen.findByRole('button', { name: /Delete Policy/i }))

    await waitFor(() => expect(dialog).not.toBeVisible())
    await waitFor(() => {
      expect(deleteFn).toHaveBeenCalled()
    })
  })

  it('should not delete selected row when it is applied to a network', async () => {
    render(
      <Provider>
        <AAATable />
      </Provider>, {
        route: { params, path: tablePath }
      }
    )

    const target = mockTableResult.data[1]
    const row = await screen.findByRole('row', { name: new RegExp(target.name) })
    await userEvent.click(within(row).getByRole('checkbox'))

    await userEvent.click(screen.getByRole('button', { name: /Delete/ }))

    // eslint-disable-next-line max-len
    expect(await screen.findByText('You are unable to delete this record due to its usage in Network')).toBeVisible()
  })

  it('should not delete selected row when it is applied to a identity provder', async () => {
    render(
      <Provider>
        <AAATable />
      </Provider>, {
        route: { params, path: tablePath }
      }
    )

    const target = mockTableResult.data[2]
    const row = await screen.findByRole('row', { name: new RegExp(target.name) })
    await userEvent.click(within(row).getByRole('checkbox'))

    await userEvent.click(screen.getByRole('button', { name: /Delete/ }))

    // eslint-disable-next-line max-len
    expect(await screen.findByText('You are unable to delete this record due to its usage in Identity Provider')).toBeVisible()
  })

  it('should navigate to the Edit view', async () => {
    render(
      <Provider>
        <AAATable />
      </Provider>, {
        route: { params, path: tablePath }
      }
    )

    const target = mockTableResult.data[3]
    const row = await screen.findByRole('row', { name: new RegExp(target.name) })
    await userEvent.click(within(row).getByRole('checkbox'))

    await userEvent.click(screen.getByRole('button', { name: /Edit/ }))

    const editPath = getPolicyDetailsLink({
      type: PolicyType.AAA,
      oper: PolicyOperation.EDIT,
      policyId: target.id
    })

    expect(mockedUseNavigate).toHaveBeenCalledWith({
      ...mockedTenantPath,
      pathname: `${mockedTenantPath.pathname}/${editPath}`
    }, {
      state
    })
  })
})
