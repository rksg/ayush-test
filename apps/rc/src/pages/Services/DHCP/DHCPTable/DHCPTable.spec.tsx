import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'
import { Path }  from 'react-router-dom'

import {
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

const mockTableResult = [{
  id: 'cc080e33-26a7-4d34-870f-b7f312fcfccb',
  serviceName: 'My DHCP 1',
  dhcpPools: [],
  venueIds: []
}]


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

describe('DHCPTable', () => {
  const params = {
    tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
  }

  // eslint-disable-next-line max-len
  const tablePath = '/:tenantId/' + getServiceRoutePath({ type: ServiceType.DHCP, oper: ServiceOperation.LIST })

  beforeEach(async () => {
    mockServer.use(
      rest.get(
        DHCPUrls.getDHCPProfiles.url,
        (req, res, ctx) => res(ctx.json(mockTableResult))
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

    const targetServiceName = mockTableResult[0].serviceName
    expect(await screen.findByRole('button', { name: /Add DHCP Service/i })).toBeVisible()
    expect(await screen.findByRole('row', { name: new RegExp(targetServiceName) })).toBeVisible()
  })

  // TODO
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

    const target = mockTableResult[0]
    const row = await screen.findByRole('row', { name: new RegExp(target.serviceName) })
    await userEvent.click(within(row).getByRole('radio'))

    await userEvent.click(screen.getByRole('button', { name: /Delete/ }))

    expect(await screen.findByText('Delete "' + target.serviceName + '"?')).toBeVisible()

    // eslint-disable-next-line max-len
    await userEvent.click(await screen.findByRole('button', { name: /Delete Service/i }))

    await waitFor(() => {
      expect(deleteFn).toHaveBeenCalled()
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

    const target = mockTableResult[0]
    const row = await screen.findByRole('row', { name: new RegExp(target.serviceName) })
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
