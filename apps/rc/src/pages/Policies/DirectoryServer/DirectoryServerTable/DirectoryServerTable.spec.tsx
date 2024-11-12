import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'
import { Path }  from 'react-router-dom'

import { directoryServerApi } from '@acx-ui/rc/services'
import {
  CommonRbacUrlsInfo,
  DirectoryServerUrls,
  getPolicyDetailsLink,
  getPolicyRoutePath,
  PolicyOperation,
  PolicyType
} from '@acx-ui/rc/utils'
import { Provider, store } from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
  within
} from '@acx-ui/test-utils'

import DirectoryServerTable from './DirectoryServerTable'

const mockedTableResult = {
  totalCount: 2,
  page: 1,
  data: [{
    wifiNetworkIds: [],
    port: 389,
    domainName: 'ou=mathematicians,dc=example,dc=com',
    tenantId: '13c94993c1894fadbcf7b68e1f94b876',
    name: 'Online LDAP Test Server',
    host: 'ldap.forumsys.com',
    id: 'a5ac9a7a3be54dba9c8741c67d1c41fa',
    type: 'LDAP'
  }, {
    wifiNetworkIds: ['network1'],
    port: 389,
    domainName: 'dc=tdcad,dc=com',
    tenantId: '13c94993c1894fadbcf7b68e1f94b876',
    name: 'ldap-profile4',
    host: '1.169.93.183',
    id: '49d2173ae5d943daa454af8de40fd4d9',
    type: 'LDAP'
  }]
}

const mockedNetworkResult = {
  totalCount: 1,
  page: 1,
  data: [{
    id: 'network1',
    name: 'My Network1'
  }]
}

const mockedUseNavigate = jest.fn()
const mockedTenantPath: Path = {
  pathname: 't/__tenantId__',
  search: '',
  hash: ''
}

jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUseNavigate,
  useTenantLink: (): Path => mockedTenantPath
}))

describe('DirectoryServerTable', () => {
  const params = {
    tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
  }

  // eslint-disable-next-line max-len
  const tablePath = '/:tenantId/t/' + getPolicyRoutePath({ type: PolicyType.DIRECTORY_SERVER, oper: PolicyOperation.LIST })

  beforeEach(async () => {
    store.dispatch(directoryServerApi.util.resetApiState())
    mockServer.use(
      rest.post(
        DirectoryServerUrls.getDirectoryServerViewDataList.url,
        (req, res, ctx) => res(ctx.json(mockedTableResult))
      ),
      rest.post(
        CommonRbacUrlsInfo.getWifiNetworksList.url,
        (req, res, ctx) => res(ctx.json(mockedNetworkResult))
      )
    )
  })

  it('should render table', async () => {
    render(
      <Provider>
        <DirectoryServerTable />
      </Provider>, {
        route: { params, path: tablePath }
      }
    )
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))

    const targetName = mockedTableResult.data[0].name
    // eslint-disable-next-line max-len
    expect(await screen.findByRole('button', { name: /Add Directory Server/i })).toBeVisible()
    expect(await screen.findByRole('row', { name: new RegExp(targetName) })).toBeVisible()
  })

  it('should render breadcrumb correctly', async () => {
    render(
      <Provider>
        <DirectoryServerTable />
      </Provider>, {
        route: { params, path: tablePath }
      }
    )
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))

    expect(await screen.findByText('Network Control')).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'Policies & Profiles'
    })).toBeVisible()
  })

  it('should delete selected row', async () => {
    const deleteFn = jest.fn()

    mockServer.use(
      rest.delete(
        DirectoryServerUrls.deleteDirectoryServer.url,
        (req, res, ctx) => {
          deleteFn(req.body)
          return res(ctx.json({ requestId: '12345' }))
        }
      )
    )

    render(
      <Provider>
        <DirectoryServerTable />
      </Provider>, {
        route: { params, path: tablePath }
      }
    )
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))

    const target = mockedTableResult.data[0]
    const row = await screen.findByRole('row', { name: new RegExp(target.name) })
    await userEvent.click(within(row).getByRole('checkbox'))

    await userEvent.click(screen.getByRole('button', { name: /Delete/ }))

    expect(await screen.findByText('Delete "' + target.name + '"?')).toBeVisible()

    await userEvent.click(await screen.findByRole('button', { name: /Delete Policy/i }))

    await waitFor(() => {
      expect(deleteFn).toHaveBeenCalled()
    })
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull()
    })
  })

  it('should not delete selected row when it is applied to Network', async () => {

    render(
      <Provider>
        <DirectoryServerTable />
      </Provider>, {
        route: { params, path: tablePath }
      }
    )

    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))

    const target = mockedTableResult.data[1]
    const row = await screen.findByRole('row', { name: new RegExp(target.name) })
    await userEvent.click(within(row).getByRole('checkbox'))

    await userEvent.click(screen.getByRole('button', { name: /Delete/ }))

    // eslint-disable-next-line max-len
    expect(await screen.findByText('You are unable to delete this record due to its usage in Network')).toBeVisible()
  })

  it('should navigate to the Edit view', async () => {
    render(
      <Provider>
        <DirectoryServerTable />
      </Provider>, {
        route: { params, path: tablePath }
      }
    )
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))

    const target = mockedTableResult.data[0]
    const row = await screen.findByRole('row', { name: new RegExp(target.name) })
    await userEvent.click(within(row).getByRole('checkbox'))

    await userEvent.click(screen.getByRole('button', { name: /Edit/ }))

    const editPath = getPolicyDetailsLink({
      type: PolicyType.DIRECTORY_SERVER,
      oper: PolicyOperation.EDIT,
      policyId: target.id
    })

    expect(mockedUseNavigate).toHaveBeenCalledWith({
      ...mockedTenantPath,
      pathname: `${mockedTenantPath.pathname}/${editPath}`
    })
  })
})
