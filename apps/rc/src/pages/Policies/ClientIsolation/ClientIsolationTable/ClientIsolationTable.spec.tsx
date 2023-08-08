import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'
import { Path }  from 'react-router-dom'

import {
  ClientIsolationUrls,
  CommonUrlsInfo,
  getPolicyDetailsLink,
  getPolicyRoutePath,
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

import ClientIsolationTable from './ClientIsolationTable'

const mockedTableResult = {
  totalCount: 2,
  page: 1,
  data: [{
    id: 'cc080e33-26a7-4d34-870f-b7f312fcfccb',
    name: 'My Client Isolation 1',
    tenantId: '864548131578778',
    description: 'Hello',
    clientEntries: ['mac1', 'mac2', 'mac3']
  }, {
    id: 'aaaaae33-26a7-4d34-870f-b7f312fcfccb',
    name: 'My Client Isolation 2',
    tenantId: '864548131578778',
    description: 'Hello 2',
    clientEntries: ['mac4', 'mac5', 'mac6'],
    venueIds: ['v1']
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

describe('ClientIsolationTable', () => {
  const params = {
    tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
  }

  // eslint-disable-next-line max-len
  const tablePath = '/:tenantId/t/' + getPolicyRoutePath({ type: PolicyType.CLIENT_ISOLATION, oper: PolicyOperation.LIST })

  beforeEach(async () => {
    mockServer.use(
      rest.post(
        ClientIsolationUrls.getEnhancedClientIsolationList.url,
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
        <ClientIsolationTable />
      </Provider>, {
        route: { params, path: tablePath }
      }
    )

    const targetName = mockedTableResult.data[0].name
    // eslint-disable-next-line max-len
    expect(await screen.findByRole('button', { name: /Add Client Isolation Profile/i })).toBeVisible()
    expect(await screen.findByRole('row', { name: new RegExp(targetName) })).toBeVisible()
  })

  it('should render breadcrumb correctly', async () => {
    render(
      <Provider>
        <ClientIsolationTable />
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
        ClientIsolationUrls.deleteClientIsolationList.url,
        (req, res, ctx) => {
          deleteFn(req.body)
          return res(ctx.json({ requestId: '12345' }))
        }
      )
    )

    render(
      <Provider>
        <ClientIsolationTable />
      </Provider>, {
        route: { params, path: tablePath }
      }
    )

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

  it('should not delete selected row when it is applied to Venue', async () => {

    render(
      <Provider>
        <ClientIsolationTable />
      </Provider>, {
        route: { params, path: tablePath }
      }
    )

    const target = mockedTableResult.data[1]
    const row = await screen.findByRole('row', { name: new RegExp(target.name) })
    await userEvent.click(within(row).getByRole('checkbox'))

    await userEvent.click(screen.getByRole('button', { name: /Delete/ }))

    // eslint-disable-next-line max-len
    expect(await screen.findByText('You are unable to delete this record due to its usage in Venue')).toBeVisible()
  })

  it('should navigate to the Edit view', async () => {
    render(
      <Provider>
        <ClientIsolationTable />
      </Provider>, {
        route: { params, path: tablePath }
      }
    )

    const target = mockedTableResult.data[0]
    const row = await screen.findByRole('row', { name: new RegExp(target.name) })
    await userEvent.click(within(row).getByRole('checkbox'))

    await userEvent.click(screen.getByRole('button', { name: /Edit/ }))

    const editPath = getPolicyDetailsLink({
      type: PolicyType.CLIENT_ISOLATION,
      oper: PolicyOperation.EDIT,
      policyId: target.id
    })

    expect(mockedUseNavigate).toHaveBeenCalledWith({
      ...mockedTenantPath,
      pathname: `${mockedTenantPath.pathname}/${editPath}`
    })
  })
})
