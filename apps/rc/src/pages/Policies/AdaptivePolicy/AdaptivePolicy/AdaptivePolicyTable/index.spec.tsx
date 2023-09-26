import { rest } from 'msw'

import { getPolicyRoutePath, PolicyOperation, PolicyType, RulesManagementUrlsInfo } from '@acx-ui/rc/utils'
import { Path }                                                                     from '@acx-ui/react-router-dom'
import { Provider }                                                                 from '@acx-ui/store'
import { fireEvent, mockServer, render, screen, waitFor, within }                   from '@acx-ui/test-utils'

import {
  adaptivePolicyList,
  assignConditions,
  policySetList,
  templateList,
  prioritizedPolicies
} from './__test__/fixtures'

import AdaptivePolicyTable from './index'

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

describe('AdaptivePolicyTable', () => {
  const params = {
    tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
    policyId: '79c439e1e5474f68acc9da38fa08a37b',
    templateId: '200'
  }

  // eslint-disable-next-line max-len
  const tablePath = '/:tenantId/' + getPolicyRoutePath({ type: PolicyType.ADAPTIVE_POLICY, oper: PolicyOperation.LIST })

  beforeEach(() => {
    mockServer.use(
      rest.get(
        RulesManagementUrlsInfo.getPolicies.url.split('?')[0],
        (req, res, ctx) => res(ctx.json(adaptivePolicyList))
      ),
      rest.get(
        RulesManagementUrlsInfo.getConditionsInPolicy.url.split('?')[0],
        (req, res, ctx) => res(ctx.json(assignConditions))
      ),
      rest.get(
        RulesManagementUrlsInfo.getPolicyTemplateList.url.split('?')[0],
        (req, res, ctx) => res(ctx.json(templateList))
      ),
      rest.get(
        RulesManagementUrlsInfo.getPolicySets.url.split('?')[0],
        (req, res, ctx) => res(ctx.json(policySetList))
      ),
      rest.get(
        RulesManagementUrlsInfo.getPrioritizedPolicies.url,
        (req, res, ctx) => res(ctx.json(prioritizedPolicies))
      ),
      rest.post(
        RulesManagementUrlsInfo.getPoliciesByQuery.url.split('?')[0],
        (req, res, ctx) => res(ctx.json(adaptivePolicyList))
      )
    )
  })

  it('should render correctly', async () => {
    render(<Provider><AdaptivePolicyTable /></Provider>, {
      route: { params, path: tablePath }
    })

    const row = await screen.findByRole('row', { name: /test1/ })
    expect(row).toHaveTextContent('1')
  })

  it('should delete selected row', async () => {
    const deleteFn = jest.fn()
    mockServer.use(
      rest.delete(
        RulesManagementUrlsInfo.deletePolicy.url,
        (req, res, ctx) => {
          deleteFn(req.body)
          return res(ctx.json({ requestId: '12345' }))
        })
    )

    render(<Provider><AdaptivePolicyTable /></Provider>, {
      route: { params, path: tablePath }
    })

    const row = await screen.findByRole('row', { name: 'test1 RADIUS 0 0' })
    fireEvent.click(within(row).getByRole('radio'))

    const deleteButton = screen.getByRole('button', { name: /delete/i })
    fireEvent.click(deleteButton)

    await screen.findByText('Delete "test1"?')

    const deleteListButton = screen.getByRole('button', { name: 'Delete policy' })
    await waitFor(() => expect(deleteListButton).toBeEnabled())
    fireEvent.click(deleteListButton)

    await waitFor(() => {
      expect(deleteFn).toHaveBeenCalled()
    })
  })

  it('should edit selected row', async () => {
    render(<Provider><AdaptivePolicyTable /></Provider>, {
      route: { params, path: tablePath }
    })

    const row = await screen.findByRole('row', { name: 'test1 RADIUS 0 0' })
    fireEvent.click(within(row).getByRole('radio'))

    const editButton = screen.getByRole('button', { name: /Edit/i })
    fireEvent.click(editButton)
  })

  it('should navigate add policy', async () => {
    render(<Provider><AdaptivePolicyTable /></Provider>, {
      route: { params, path: tablePath }
    })

    fireEvent.click(await screen.findByText('Add Policy'))

    const createPath = getPolicyRoutePath({
      type: PolicyType.ADAPTIVE_POLICY,
      oper: PolicyOperation.CREATE
    })

    expect(mockedUseNavigate).toHaveBeenCalledWith({
      ...mockedTenantPath,
      pathname: `${mockedTenantPath.pathname}/${createPath}`
    })
  })
})
