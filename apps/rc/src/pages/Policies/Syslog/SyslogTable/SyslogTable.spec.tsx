import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'
import { Path }  from 'react-router-dom'

import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import {
  SyslogUrls,
  getPolicyDetailsLink,
  getPolicyRoutePath,
  PolicyOperation,
  PolicyType,
  CommonUrlsInfo
} from '@acx-ui/rc/utils'
import { Provider } from '@acx-ui/store'
import {
  mockServer,
  render,
  screen, waitForElementToBeRemoved,
  within
} from '@acx-ui/test-utils'

import SyslogTable from './SyslogTable'

const mockTableResult = {
  totalCount: 1,
  page: 1,
  data: [{
    id: 'cc080e33-26a7-4d34-870f-b7f312fcfccb',
    name: 'My Syslog Server 1',
    type: 'Syslog',
    scope: '5'
  }]
}

const mockQueryResult = {
  totalCount: 1,
  page: 1,
  data: [{
    id: 'b76d9aeb1d5e4fc8b62ed6250a6471ee',
    name: 'Syslog 1',
    venueIds: [],
    primaryServer: '1.2.3.4:514 (UDP)',
    secondaryServer: '',
    facility: 'KEEP_ORIGINAL',
    flowLevel: 'CLIENT_FLOW'
  }]
}
const mockedDeleteFn = jest.fn()
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

describe('SyslogTable', () => {
  const params = {
    tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
  }

  // eslint-disable-next-line max-len
  const tablePath = '/:tenantId/t/' + getPolicyRoutePath({ type: PolicyType.SYSLOG, oper: PolicyOperation.LIST })

  beforeEach(async () => {
    mockServer.use(
      rest.post(
        SyslogUrls.syslogPolicyList.url,
        (req, res, ctx) => res(ctx.json(mockTableResult))
      ),
      rest.post(
        CommonUrlsInfo.getVenuesList.url,
        (req, res, ctx) => res(ctx.json(mockVenueData))
      ),
      rest.post(
        SyslogUrls.querySyslog.url,
        (req, res, ctx) => res(ctx.json(mockQueryResult))
      ),
      rest.delete(
        SyslogUrls.deleteSyslogPolicy.url,
        (req, res, ctx) => {
          mockedDeleteFn()
          return res(ctx.json({}))
        })
    )
  })

  it('should render table', async () => {
    render(
      <Provider>
        <SyslogTable />
      </Provider>, {
        route: { params, path: tablePath }
      }
    )
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))

    const targetName = mockTableResult.data[0].name
    expect(await screen.findByRole('button', { name: /Add Syslog Server/i })).toBeVisible()
    expect(await screen.findByRole('row', { name: new RegExp(targetName) })).toBeVisible()
  })

  it('should render breadcrumb correctly', async () => {
    render(
      <Provider>
        <SyslogTable />
      </Provider>, {
        route: { params, path: tablePath }
      }
    )
    expect(await screen.findByText('Network Control')).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'Policies & Profiles'
    })).toBeVisible()
  })

  // TODO Should implement this after API is ready
  it.todo('should delete selected row')

  it('should navigate to the Edit view', async () => {
    render(
      <Provider>
        <SyslogTable />
      </Provider>, {
        route: { params, path: tablePath }
      }
    )
    const target = mockTableResult.data[0]
    const row = await screen.findByRole('row', { name: new RegExp(target.name) })
    await userEvent.click(within(row).getByRole('checkbox'))

    await userEvent.click(screen.getByRole('button', { name: /Edit/ }))

    const editPath = getPolicyDetailsLink({
      type: PolicyType.SYSLOG,
      oper: PolicyOperation.EDIT,
      policyId: target.id
    })

    expect(mockedUseNavigate).toHaveBeenCalledWith({
      ...mockedTenantPath,
      pathname: `${mockedTenantPath.pathname}/${editPath}`
    })
  })

  it('should render table and delete correctly with rbac api', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.RBAC_SERVICE_POLICY_TOGGLE)
    render(
      <Provider>
        <SyslogTable />
      </Provider>, {
        route: { params, path: tablePath }
      }
    )
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    const row = await screen.findByRole('row', { name: new RegExp('Syslog 1') })
    expect(row).toBeVisible()
    await userEvent.click(row)
    await userEvent.click(await screen.findByRole('button', { name: 'Delete' } ))
    await userEvent.click(await screen.findByRole('button', { name: 'Delete Policy' } ))
    expect(mockedDeleteFn).toHaveBeenCalled()
  })

})
