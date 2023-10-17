import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import {
  getPolicyDetailsLink,
  getPolicyRoutePath,
  PolicyOperation,
  PolicyType,
  RadiusAttributeGroupUrlsInfo, RulesManagementUrlsInfo
} from '@acx-ui/rc/utils'
import { Path }                                                   from '@acx-ui/react-router-dom'
import { Provider }                                               from '@acx-ui/store'
import { fireEvent, mockServer, render, screen, waitFor, within } from '@acx-ui/test-utils'

import { groupList, adaptivePolicyList, groupListByPost, assignments } from './__tests__/fixtures'

import RadiusAttributeGroupTable from './index'

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

describe('RadiusAttributeGroupTable', () => {
  const params = {
    tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
  }

  // eslint-disable-next-line max-len
  const tablePath = '/:tenantId/t/' + getPolicyRoutePath({ type: PolicyType.RADIUS_ATTRIBUTE_GROUP, oper: PolicyOperation.LIST })

  beforeEach(() => {
    mockServer.use(
      rest.get(
        RadiusAttributeGroupUrlsInfo.getAttributeGroups.url.split('?')[0],
        (req, res, ctx) => res(ctx.json(groupList))
      ),
      rest.post(
        RulesManagementUrlsInfo.getPoliciesByQuery.url.split('?')[0],
        (req, res, ctx) => res(ctx.json(adaptivePolicyList))
      ),
      rest.post(
        RadiusAttributeGroupUrlsInfo.getAttributeGroupsWithQuery.url.split('?')[0],
        (req, res, ctx) => res(ctx.json(groupListByPost))
      ),
      rest.get(
        RulesManagementUrlsInfo.getPolicies.url.split('?')[0],
        (req, res, ctx) => res(ctx.json(adaptivePolicyList))
      ),
      rest.get(
        RadiusAttributeGroupUrlsInfo.getAssignments.url.split('?')[0],
        (req, res, ctx) => res(ctx.json([]))
      )
    )
  })

  it('should render correctly', async () => {
    render(<Provider><RadiusAttributeGroupTable /></Provider>, {
      route: { params, path: tablePath }
    })

    fireEvent.click(within(await screen.findByRole('row', { name: /group1/ })).getByRole('radio'))

    await screen.findByText('Delete')
    await screen.findByText('Edit')
  })

  it('should delete selected row', async () => {
    const deleteFn = jest.fn()

    mockServer.use(
      rest.delete(
        RadiusAttributeGroupUrlsInfo.deleteAttributeGroup.url,
        (req, res, ctx) => {
          deleteFn(req.body)
          return res(ctx.json({ requestId: '12345' }))
        })
    )

    render(<Provider><RadiusAttributeGroupTable /></Provider>, {
      route: { params, path: tablePath }
    })

    const row = await screen.findByRole('row', { name: /group2/ })
    await userEvent.click(within(row).getByRole('radio'))

    await userEvent.click(screen.getByRole('button', { name: /Delete/ }))

    expect(await screen.findByText('Delete "' + groupList.content[1].name + '"?')).toBeVisible()

    await userEvent.click(await screen.findByRole('button', { name: /Delete group/i }))

    await waitFor(() => {
      expect(deleteFn).toHaveBeenCalled()
    })
  })

  it.skip('should not allow to delete selected row', async () => {
    const deleteFn = jest.fn()
    mockServer.use(
      rest.delete(
        RadiusAttributeGroupUrlsInfo.deleteAttributeGroup.url,
        (req, res, ctx) => {
          deleteFn(req.body)
          return res(ctx.json({ requestId: '12345' }))
        }),
      rest.get(
        RadiusAttributeGroupUrlsInfo.getAssignments.url.split('?')[0],
        (req, res, ctx) => res(ctx.json(assignments))
      )
    )

    render(<Provider><RadiusAttributeGroupTable /></Provider>, {
      route: { params, path: tablePath }
    })

    await screen.findByRole('row', { name: /group1 2/i })
    // eslint-disable-next-line max-len
    await userEvent.click(within(await screen.findByRole('row', { name: /group1 2 1/i })).getByRole('radio'))

    await userEvent.click(screen.getByRole('button', { name: /Delete/ }))

    // eslint-disable-next-line max-len
    expect(await screen.findByText('This group is in use by one or more Adaptive Policies.')).toBeVisible()
  })

  it('should edit selected row', async () => {
    render(<Provider><RadiusAttributeGroupTable /></Provider>, {
      route: { params, path: tablePath }
    })

    const row = await screen.findByRole('row', { name: /group1/ })
    fireEvent.click(within(row).getByRole('radio'))

    fireEvent.click(await screen.findByText('Edit'))

    const editPath = getPolicyDetailsLink({
      type: PolicyType.RADIUS_ATTRIBUTE_GROUP,
      oper: PolicyOperation.EDIT,
      policyId: groupList.content[0].id!
    })

    expect(mockedUseNavigate).toHaveBeenCalledWith({
      ...mockedTenantPath,
      pathname: `${mockedTenantPath.pathname}/${editPath}`
    })
  })

  it('should navigate to add group', async () => {
    render(<Provider><RadiusAttributeGroupTable /></Provider>, {
      route: { params, path: tablePath }
    })

    fireEvent.click(await screen.findByText('Add Group'))

    const addPath = getPolicyRoutePath({
      type: PolicyType.RADIUS_ATTRIBUTE_GROUP,
      oper: PolicyOperation.CREATE
    })

    expect(mockedUseNavigate).toHaveBeenCalledWith({
      ...mockedTenantPath,
      pathname: `${mockedTenantPath.pathname}/${addPath}`
    })
  })
})
