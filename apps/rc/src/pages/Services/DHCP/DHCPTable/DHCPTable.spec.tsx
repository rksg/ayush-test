import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'
import { Path }  from 'react-router-dom'

import { useIsSplitOn } from '@acx-ui/feature-toggle'
import {
  CommonUrlsInfo,
  DHCPUrls,
  getServiceDetailsLink,
  getServiceRoutePath,
  ServiceOperation,
  ServiceType
} from '@acx-ui/rc/utils'
import { Provider } from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitFor,
  within
} from '@acx-ui/test-utils'

import DHCPTable from './DHCPTable'

const mockTableResult = {
  totalCount: 1,
  data: [{
    id: 'cc080e33-26a7-4d34-870f-b7f312fcfccb',
    name: 'My DHCP 1',
    dhcpPools: [],
    venueIds: []
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

const mockVenueData = {
  fields: ['name', 'id'],
  totalCount: 3,
  page: 1,
  data: [
    { id: 'mock_venue_1', name: 'Mock Venue 1' },
    { id: 'mock_venue_2', name: 'Mock Venue 2' },
    { id: 'mock_venue_3', name: 'Mock Venue 3' }
  ]
}

describe('DHCPTable', () => {
  const params = {
    tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
  }

  // eslint-disable-next-line max-len
  const tablePath = '/:tenantId/t/' + getServiceRoutePath({ type: ServiceType.DHCP, oper: ServiceOperation.LIST })

  beforeEach(async () => {
    mockServer.use(
      rest.post(
        DHCPUrls.getDHCPProfilesViewModel.url,
        (req, res, ctx) => res(ctx.json(mockTableResult))
      ),
      rest.post(
        CommonUrlsInfo.getVenuesList.url,
        (req, res, ctx) => res(ctx.json(mockVenueData))
      )
    )
  })

  it('should render table', async () => {
    render(
      <Provider>
        <DHCPTable />
      </Provider>, {
        route: { params, path: tablePath }
      }
    )

    const targetServiceName = mockTableResult.data[0].name
    expect(await screen.findByRole('button', { name: /Add DHCP Service/i })).toBeVisible()
    expect(await screen.findByRole('row', { name: new RegExp(targetServiceName) })).toBeVisible()
  })

  it('should render breadcrumb correctly when feature flag is off', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    render(
      <Provider>
        <DHCPTable />
      </Provider>, {
        route: { params, path: tablePath }
      }
    )
    expect(screen.queryByText('Network Control')).toBeNull()
    expect(screen.getByRole('link', {
      name: 'My Services'
    })).toBeVisible()
  })

  it('should render breadcrumb correctly when feature flag is on', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    render(
      <Provider>
        <DHCPTable />
      </Provider>, {
        route: { params, path: tablePath }
      }
    )
    expect(await screen.findByText('Network Control')).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'My Services'
    })).toBeVisible()
  })

  it('should delete selected row', async () => {
    const deleteFn = jest.fn()

    mockServer.use(
      rest.delete(
        DHCPUrls.deleteDHCPProfile.url,
        (req, res, ctx) => {
          deleteFn(req.body)
          return res(ctx.json({ requestId: '12345' }))
        }
      )
    )

    render(
      <Provider>
        <DHCPTable />
      </Provider>, {
        route: { params, path: tablePath }
      }
    )

    const target = mockTableResult.data[0]
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

  it('should navigate to the Edit view', async () => {
    render(
      <Provider>
        <DHCPTable />
      </Provider>, {
        route: { params, path: tablePath }
      }
    )

    const target = mockTableResult.data[0]
    const row = await screen.findByRole('row', { name: new RegExp(target.name) })
    await userEvent.click(within(row).getByRole('radio'))

    await userEvent.click(screen.getByRole('button', { name: /Edit/ }))

    const editPath = getServiceDetailsLink({
      type: ServiceType.DHCP,
      oper: ServiceOperation.EDIT,
      serviceId: target.id
    })

    expect(mockedUseNavigate).toHaveBeenCalledWith({
      ...mockedTenantPath,
      pathname: `${mockedTenantPath.pathname}/${editPath}`
    })
  })
})
