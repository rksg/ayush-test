import { rest } from 'msw'

import {
  getPolicyDetailsLink, getPolicyRoutePath, MacRegListUrlsInfo,
  PolicyOperation,
  PolicyType,
  RulesManagementUrlsInfo
} from '@acx-ui/rc/utils'
import { Path }                                                   from '@acx-ui/react-router-dom'
import { Provider }                                               from '@acx-ui/store'
import { fireEvent, mockServer, render, screen, waitFor, within } from '@acx-ui/test-utils'

import { policySetList, prioritizedPolicies, adaptivePolicyList, macList } from './__test__/fixtures'

import AdaptivePolicySetTable from './index'

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

describe('AdaptivePolicySetTable', () => {
  const params = {
    tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
    policyId: '79c439e1e5474f68acc9da38fa08a37b'
  }

  // eslint-disable-next-line max-len
  const tablePath = '/:tenantId/' + getPolicyRoutePath({ type: PolicyType.ADAPTIVE_POLICY_SET, oper: PolicyOperation.LIST })

  beforeEach(() => {
    mockServer.use(
      rest.get(
        RulesManagementUrlsInfo.getPolicySets.url,
        (req, res, ctx) => res(ctx.json(policySetList))
      ),
      rest.get(
        RulesManagementUrlsInfo.getPrioritizedPolicies.url,
        (req, res, ctx) => res(ctx.json(prioritizedPolicies))
      ),
      rest.get(
        RulesManagementUrlsInfo.getPolicies.url,
        (req, res, ctx) => res(ctx.json(adaptivePolicyList))
      ),
      rest.get(
        RulesManagementUrlsInfo.getPolicies.url,
        (req, res, ctx) => res(ctx.json(adaptivePolicyList))
      ),
      rest.get(
        MacRegListUrlsInfo.getMacRegistrationPools.url,
        (req, res, ctx) => res(ctx.json(macList))
      )
    )
  })

  it('should render correctly', async () => {
    render(<Provider><AdaptivePolicySetTable /></Provider>, {
      route: { params, path: tablePath }
    })

    const row = await screen.findByRole('row', { name: 'ps12 3' })
    expect(row).toHaveTextContent('1')
  })

  it('should delete selected row', async () => {
    const deleteFn = jest.fn()

    mockServer.use(
      rest.delete(
        RulesManagementUrlsInfo.deletePolicySet.url,
        (req, res, ctx) => {
          deleteFn(req.body)
          return res(ctx.json({ requestId: '12345' }))
        })
    )

    render(<Provider><AdaptivePolicySetTable /></Provider>, {
      route: { params, path: tablePath }
    })

    const row = await screen.findByRole('row', { name: new RegExp( 'ps12') })
    fireEvent.click(within(row).getByRole('radio'))

    const deleteButton = screen.getByRole('button', { name: /delete/i })
    fireEvent.click(deleteButton)

    await screen.findByText('Delete "ps12"?')

    const deleteListButton = screen.getByRole('button', { name: 'Delete policy set' })
    await waitFor(() => expect(deleteListButton).toBeEnabled())
    fireEvent.click(deleteListButton)

    await waitFor(() => {
      expect(deleteFn).toHaveBeenCalled()
    })
  })

  it('should edit selected row', async () => {
    render(<Provider><AdaptivePolicySetTable /></Provider>, {
      route: { params, path: tablePath }
    })

    const row = await screen.findByRole('row', { name: new RegExp( 'ps12') })
    fireEvent.click(within(row).getByRole('radio'))

    const editButton = screen.getByRole('button', { name: /Edit/i })
    fireEvent.click(editButton)

    const editPath = getPolicyDetailsLink({
      type: PolicyType.ADAPTIVE_POLICY_SET,
      oper: PolicyOperation.EDIT,
      policyId: policySetList.content[0].id
    })

    expect(mockedUseNavigate).toHaveBeenCalledWith({
      ...mockedTenantPath,
      pathname: `${mockedTenantPath.pathname}/${editPath}`
    })
  })

  it('should negative add policy', async () => {
    render(<Provider><AdaptivePolicySetTable /></Provider>, {
      route: { params, path: tablePath }
    })

    fireEvent.click(await screen.findByText('Add Set'))

    const createPath = getPolicyRoutePath({
      type: PolicyType.ADAPTIVE_POLICY_SET,
      oper: PolicyOperation.CREATE
    })

    expect(mockedUseNavigate).toHaveBeenCalledWith({
      ...mockedTenantPath,
      pathname: `${mockedTenantPath.pathname}/${createPath}`
    })
  })
})
