import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'
import { Path }  from 'react-router-dom'

import {
  CommonUrlsInfo,
  getPolicyDetailsLink,
  getPolicyRoutePath,
  PolicyOperation,
  PolicyType,
  VlanPoolUrls
} from '@acx-ui/rc/utils'
import { Provider } from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitFor,
  within
} from '@acx-ui/test-utils'

import VLANPoolTable from './VLANPoolTable'

const mockTableResult = {
  totalCount: 1,
  page: 1,
  data: [{
    id: 'cc080e33-26a7-4d34-870f-b7f312fcfccb',
    name: 'My Client Isolation 1',
    type: 'Client Isolation',
    scope: '5'
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

describe('VLANPoolTable', () => {
  const params = {
    tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
  }

  // eslint-disable-next-line max-len
  const tablePath = '/:tenantId/' + getPolicyRoutePath({ type: PolicyType.VLAN_POOL, oper: PolicyOperation.LIST })

  beforeEach(async () => {
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getPoliciesList.url,
        (req, res, ctx) => res(ctx.json(mockTableResult))
      )
    )
  })

  it('should render table', async () => {
    render(
      <Provider>
        <VLANPoolTable />
      </Provider>, {
        route: { params, path: tablePath }
      }
    )

    const targetName = mockTableResult.data[0].name
    // eslint-disable-next-line max-len
    expect(await screen.findByRole('button', { name: /Add VLAN Pool/i })).toBeVisible()
    expect(await screen.findByRole('row', { name: new RegExp(targetName) })).toBeVisible()
  })

  it('should delete selected row', async () => {
    const deleteFn = jest.fn()

    mockServer.use(
      rest.delete(
        VlanPoolUrls.deleteVLANPoolPolicy.url,
        (req, res, ctx) => {
          deleteFn(req.body)
          return res(ctx.json({ requestId: '12345' }))
        }
      )
    )

    render(
      <Provider>
        <VLANPoolTable />
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
    await userEvent.click(await screen.findByRole('button', { name: /Delete Policy/i }))

    await waitFor(() => {
      expect(deleteFn).toHaveBeenCalled()
    })
  })

  it('should navigate to the Edit view', async () => {
    render(
      <Provider>
        <VLANPoolTable />
      </Provider>, {
        route: { params, path: tablePath }
      }
    )

    const target = mockTableResult.data[0]
    const row = await screen.findByRole('row', { name: new RegExp(target.name) })
    await userEvent.click(within(row).getByRole('radio'))

    await userEvent.click(screen.getByRole('button', { name: /Edit/ }))

    const editPath = getPolicyDetailsLink({
      type: PolicyType.VLAN_POOL,
      oper: PolicyOperation.EDIT,
      policyId: target.id
    })

    expect(mockedUseNavigate).toHaveBeenCalledWith({
      ...mockedTenantPath,
      pathname: `${mockedTenantPath.pathname}/${editPath}`
    })
  })
})
