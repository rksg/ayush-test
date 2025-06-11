import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'
import { Path }  from 'react-router-dom'

import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import {
  CommonUrlsInfo,
  getServiceDetailsLink,
  getServiceRoutePath,
  MdnsProxyUrls,
  ServiceOperation,
  ServiceType
} from '@acx-ui/rc/utils'
import { Provider } from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
  within
} from '@acx-ui/test-utils'

import MdnsProxyTable from './MdnsProxyTable'

const mockedTableResult = {
  totalCount: 1,
  page: 1,
  data: [{
    id: 'cc080e33-26a7-4d34-870f-b7f312fcfccb',
    name: 'My mDNS Proxy 1',
    type: 'mDNS Proxy',
    scope: '5'
  }]
}

const mockedTableResultRbac = {
  totalCount: 1,
  page: 1,
  data: [{
    id: 'cc080e33-26a7-4d34-870f-b7f312fcfccb',
    name: 'My mDNS Proxy 1',
    type: 'mDNS Proxy',
    activations: [
      {
        venueId: 'v1',
        apSerialNumbers: []
      }
    ]
  }]
}

const mockedVenuesResult = {
  totalCount: 1,
  page: 1,
  data: [{
    id: 'v1',
    name: 'My Venue'
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

describe('MdnsProxyTable', () => {
  const params = {
    tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
  }

  // eslint-disable-next-line max-len
  const tablePath = '/:tenantId/' + getServiceRoutePath({ type: ServiceType.MDNS_PROXY, oper: ServiceOperation.LIST })

  beforeEach(async () => {
    mockServer.use(
      rest.post(
        MdnsProxyUrls.getEnhancedMdnsProxyList.url,
        (req, res, ctx) => res(ctx.json(mockedTableResult))
      ),
      rest.post(
        CommonUrlsInfo.getVenues.url,
        (req, res, ctx) => res(ctx.json(mockedVenuesResult))
      )
    )
  })

  it('should render table', async () => {
    render(
      <Provider>
        <MdnsProxyTable />
      </Provider>, {
        route: { params, path: tablePath }
      }
    )
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    const targetServiceName = mockedTableResult.data[0].name
    expect(await screen.findByRole('button', { name: /Add mDNS Proxy Service/i })).toBeVisible()
    expect(await screen.findByRole('row', { name: new RegExp(targetServiceName) })).toBeVisible()
  })

  it('should render table via RBAC api', async () => {
    const queryRbacFn = jest.fn()
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.RBAC_SERVICE_POLICY_TOGGLE)

    mockServer.use(
      rest.post(
        MdnsProxyUrls.queryMdnsProxy.url,
        (_, res, ctx) => {
          queryRbacFn()
          return res(ctx.json(mockedTableResultRbac))
        }
      )
    )

    render(
      <Provider>
        <MdnsProxyTable />
      </Provider>, {
        route: { params, path: tablePath }
      }
    )

    await waitFor(() => expect(queryRbacFn).toHaveBeenCalled())

    const targetServiceName = mockedTableResultRbac.data[0].name
    expect(await screen.findByRole('button', { name: /Add mDNS Proxy Service/i })).toBeVisible()
    expect(await screen.findByRole('row', { name: new RegExp(targetServiceName) })).toBeVisible()

    jest.mocked(useIsSplitOn).mockReset()
  })

  it('should render breadcrumb correctly', async () => {
    render(
      <Provider>
        <MdnsProxyTable />
      </Provider>, {
        route: { params, path: tablePath }
      }
    )
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    expect(await screen.findByText('Network Control')).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'My Services'
    })).toBeVisible()
  })

  it('should delete selected row', async () => {
    const deleteFn = jest.fn()

    mockServer.use(
      rest.delete(
        MdnsProxyUrls.deleteMdnsProxy.url,
        (req, res, ctx) => {
          deleteFn(req.body)
          return res(ctx.json({ requestId: '12345' }))
        }
      )
    )

    render(
      <Provider>
        <MdnsProxyTable />
      </Provider>, {
        route: { params, path: tablePath }
      }
    )
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))

    const target = mockedTableResult.data[0]
    const row = await screen.findByRole('row', { name: new RegExp(target.name) })
    await userEvent.click(within(row).getByRole('radio'))

    await userEvent.click(screen.getByRole('button', { name: /Delete/ }))

    expect(await screen.findByText('Delete "' + target.name + '"?')).toBeVisible()

    // eslint-disable-next-line max-len
    await userEvent.click(await screen.findByRole('button', { name: /Delete Service/i }))

    await waitFor(() => {
      expect(deleteFn).toHaveBeenCalled()
    })
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull()
    })
  })

  it('should delete selected row via RBAC api', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.RBAC_SERVICE_POLICY_TOGGLE)
    const deleteFn = jest.fn()

    mockServer.use(
      rest.delete(
        MdnsProxyUrls.deleteMdnsProxyRbac.url,
        (req, res, ctx) => {
          deleteFn(req.body)
          return res(ctx.json({ requestId: '12345' }))
        }
      ),
      rest.post(
        MdnsProxyUrls.queryMdnsProxy.url,
        (_, res, ctx) => res(ctx.json(mockedTableResultRbac))
      )
    )

    render(
      <Provider>
        <MdnsProxyTable />
      </Provider>, {
        route: { params, path: tablePath }
      }
    )
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))

    const target = mockedTableResult.data[0]
    const row = await screen.findByRole('row', { name: new RegExp(target.name) })
    await userEvent.click(within(row).getByRole('radio'))

    await userEvent.click(screen.getByRole('button', { name: /Delete/ }))

    expect(await screen.findByText('Delete "' + target.name + '"?')).toBeVisible()

    // eslint-disable-next-line max-len
    await userEvent.click(await screen.findByRole('button', { name: /Delete Service/i }))

    await waitFor(() => {
      expect(deleteFn).toHaveBeenCalled()
    })
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull()
    })

    jest.mocked(useIsSplitOn).mockRestore()
  })

  it('should navigate to the Edit view', async () => {
    render(
      <Provider>
        <MdnsProxyTable />
      </Provider>, {
        route: { params, path: tablePath }
      }
    )
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))

    const target = mockedTableResult.data[0]
    const row = await screen.findByRole('row', { name: new RegExp(target.name) })
    await userEvent.click(within(row).getByRole('radio'))

    await userEvent.click(screen.getByRole('button', { name: /Edit/ }))

    const editPath = getServiceDetailsLink({
      type: ServiceType.MDNS_PROXY,
      oper: ServiceOperation.EDIT,
      serviceId: target.id
    })

    expect(mockedUseNavigate).toHaveBeenCalledWith({
      ...mockedTenantPath,
      pathname: `${mockedTenantPath.pathname}/${editPath}`
    })

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull()
    })
  })

  it('should render table without Header when hideHeader is true', async () => {
    render(
      <Provider>
        <MdnsProxyTable hideHeader={true} />
      </Provider>, {
        route: { params, path: tablePath }
      }
    )
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))

    expect(screen.queryByText(`mDNS Proxy (${mockedTableResult.totalCount})`)).toBeNull()
    expect(screen.queryByRole('button', { name: /Add mDNS Proxy Service/ })).toBeNull()
  })
})
