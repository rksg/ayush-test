import { rest } from 'msw'

import {
  getPolicyDetailsLink,
  getPolicyRoutePath,
  PolicyOperation,
  PolicyType,
  RadiusAttributeGroupUrlsInfo, RulesManagementUrlsInfo
} from '@acx-ui/rc/utils'
import { Provider }                   from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'

import { mockGroup, policyList, policySetList, prioritizedPolicies, templateList } from './__tests__/fixtures'
import RadiusAttributeGroupDetail                                                  from './RadiusAttributeGroupDetail'

describe('RadiusAttributeGroupDetail', () => {
  const params = {
    tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
    policyId: mockGroup.id
  }
  beforeEach(() => {
    mockServer.use(
      rest.get(
        RadiusAttributeGroupUrlsInfo.getAttributeGroup.url,
        (req, res, ctx) => res(ctx.json(mockGroup))
      ),
      rest.post(
        RulesManagementUrlsInfo.getPoliciesByQuery.url.split('?')[0],
        (req, res, ctx) => res(ctx.json(policyList))
      ),
      rest.get(
        RulesManagementUrlsInfo.getPolicySets.url.split('?')[0],
        (req, res, ctx) => res(ctx.json(policySetList))
      ),
      rest.get(
        RulesManagementUrlsInfo.getPrioritizedPolicies.url,
        (req, res, ctx) => res(ctx.json(prioritizedPolicies))
      ),
      rest.get(
        RulesManagementUrlsInfo.getPolicyTemplateList.url.split('?')[0],
        (req, res, ctx) => res(ctx.json(templateList))
      )
    )
  })

  // eslint-disable-next-line max-len
  const path = '/:tenantId/t/' + getPolicyRoutePath({ type: PolicyType.RADIUS_ATTRIBUTE_GROUP, oper: PolicyOperation.DETAIL })

  it('should render correctly', async () => {
    render(<Provider><RadiusAttributeGroupDetail /></Provider>, {
      route: { params, path }
    })

    const names = await screen.findAllByText(mockGroup.name)
    expect(names[0]).toBeVisible()
    expect(names[1]).toBeVisible()

    await screen.findByText(mockGroup.attributeAssignments[0].attributeName)
    await screen.findByText(mockGroup.attributeAssignments[0].attributeValue)
    await screen.findByText(mockGroup.attributeAssignments[1].attributeName)
    await screen.findByText(mockGroup.attributeAssignments[1].attributeValue)
    await screen.findByText('Instance (' + policyList.content.length + ')')
    await screen.findByRole('row', { name: new RegExp('ap2') })
  })

  it('should render breadcrumb correctly', async () => {
    render(<Provider><RadiusAttributeGroupDetail /></Provider>, {
      route: { params, path }
    })
    expect(await screen.findByText('Network Control')).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'Policies & Profiles'
    })).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'RADIUS Attribute Groups'
    })).toBeVisible()
  })

  it('should navigate to edit page', async () => {
    const editLink = `/${params.tenantId}/t/` + getPolicyDetailsLink({
      type: PolicyType.RADIUS_ATTRIBUTE_GROUP,
      oper: PolicyOperation.EDIT,
      policyId: params.policyId
    })

    render(<Provider><RadiusAttributeGroupDetail /></Provider>, {
      route: { params, path }
    })

    expect(await screen.findByRole('link', { name: 'Configure' })).toHaveAttribute('href', editLink)
  })
})
